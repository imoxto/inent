import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";
import { enqueueSnackbar } from "notistack";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "~/utils/api";

import * as Ably from "ably/promises";
import { configureAbly } from "@ably-labs/react-hooks";
import { ChatSideBar } from "~/client/room";
import {
  DeleteMessageForm,
  JoinRoomForm,
  UpdateMessageForm,
} from "~/client/forms/roomForms";

function AddMessageForm({
  onMessagePost,
  roomId,
  disabled,
}: {
  onMessagePost: () => void;
  roomId: string;
  disabled?: boolean;
}) {
  const addPost = api.message.create.useMutation();
  const { data: session } = useSession();
  const [message, setMessage] = useState("");
  const [enterToPostMessage, setEnterToPostMessage] = useState(true);
  async function postMessage() {
    const input = {
      messageContent: message,
      roomId,
    };
    try {
      await addPost.mutateAsync(input, {
        onError(err) {
          enqueueSnackbar(err.message, { variant: "error" });
        },
      });
      setMessage("");
      onMessagePost();
    } catch {}
  }

  // const isTyping = api.post.isTyping.useMutation();

  const user = session?.user;
  if (!user) {
    return (
      <div className="flex w-full justify-between rounded bg-gray-800 px-3 py-2 text-lg text-gray-200">
        <p className="font-bold">
          You have to{" "}
          <button
            className="inline font-bold underline"
            onClick={() => signIn()}
          >
            sign in
          </button>{" "}
          to write.
        </p>
        <button
          onClick={() => signIn()}
          data-testid="signin"
          className="h-full rounded bg-indigo-500 px-4"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (disabled) {
    <div className="flex w-full justify-between rounded bg-gray-800 px-3 py-2 text-lg text-gray-200">
      <p className="font-bold">{"You have to join room to write"}</p>
      <JoinRoomForm />
    </div>;
  }
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          /**
           * In a real app you probably don't want to use this manually
           * Checkout React Hook Form - it works great with api
           * @link https://react-hook-form.com/
           */
          await postMessage();
        }}
      >
        <fieldset disabled={addPost.isLoading} className="min-w-0">
          <div className="text-md flex h-fit w-full items-end rounded bg-gray-500 px-3 py-2 text-gray-200">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-fit flex-1 resize-none bg-transparent outline-0"
              rows={message.split(/\r|\n/).length}
              id="text"
              name="text"
              autoFocus
              onKeyDown={async (e) => {
                if (e.key === "Shift") {
                  setEnterToPostMessage(false);
                }
                if (e.key === "Enter" && enterToPostMessage) {
                  e.preventDefault();
                  void postMessage();
                }
                // isTyping.mutate({ typing: true });
              }}
              onKeyUp={(e) => {
                if (e.key === "Shift") {
                  setEnterToPostMessage(true);
                }
              }}
              onBlur={() => {
                setEnterToPostMessage(true);
                // isTyping.mutate({ typing: false });
              }}
            />
            <div>
              <button type="submit" className="rounded bg-indigo-500 px-4 py-1">
                Submit
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </>
  );
}

export default function IndexPage() {
  const router = useRouter();
  const { roomId } = router.query as { roomId: string };

  const postsQuery = api.message.infinite.useInfiniteQuery(
    { roomId },
    {
      getPreviousPageParam: (d) => d.prevCursor,
    }
  );
  const { hasPreviousPage, isFetchingPreviousPage, fetchPreviousPage } =
    postsQuery;

  // list of messages that are rendered
  const [messages, setMessages] = useState(() => {
    const msgs = postsQuery.data?.pages.map((page) => page.items).flat();
    return msgs;
  });
  // const [channel, setChannel] = useState<Ably.Types.RealtimeChannelPromise | null>(null)
  type Post = NonNullable<typeof messages>[number];
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const { data: room } = api.room.getMyRoom.useQuery(roomId);
  const isAdmin = room?.me?.role === "admin";

  // fn to add and dedupe new messages onto state
  const addMessages = useCallback((incoming?: Post[]) => {
    setMessages((current) => {
      const map: Record<Post["id"], Post> = {};
      for (const msg of current ?? []) {
        map[msg.id] = msg;
      }
      for (const msg of incoming ?? []) {
        map[msg.id] = msg;
      }
      return Object.values(map).sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  const removeMessage = useCallback((deleteMessageId: string) => {
    setMessages((current) =>
      current?.filter((msg) => msg.id !== deleteMessageId)
    );
  }, []);

  const updateMessage = useCallback((message: Post) => {
    setMessages((current) =>
      current?.map((msg) => (msg.id !== message.id ? msg : message))
    );
  }, []);

  // when new data from `useInfiniteQuery`, merge with current state
  useEffect(() => {
    const msgs = postsQuery.data?.pages.map((page) => page.items).flat();
    addMessages(msgs);
  }, [postsQuery.data?.pages, addMessages]);

  const scrollToBottomOfList = useCallback(() => {
    if (scrollTargetRef.current == null) {
      return;
    }

    scrollTargetRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [scrollTargetRef]);
  useEffect(() => {
    scrollToBottomOfList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!room?.id) {
      return;
    }

    const ably: Ably.Types.RealtimePromise = configureAbly({
      authUrl: "/api/authentication/token-auth",
    });

    ably.connection.on((stateChange: Ably.Types.ConnectionStateChange) => {
      console.log(stateChange);
    });

    const _channel = ably.channels.get(`roomId:${roomId}`);
    _channel.subscribe((data: Ably.Types.Message) => {
      // console.log(data);
      if (data.name === "new-message") {
        addMessages([data.data]);
      } else if (data.name === "delete-message") {
        removeMessage(data.data);
      } else if (data.name === "update-message") {
        updateMessage(data.data);
      }
    });
    // setChannel(_channel);

    return () => {
      _channel.unsubscribe();
    };
  }, [room?.id]);

  // const [currentlyTyping, setCurrentlyTyping] = useState<string[]>([]);
  // api.post.whoIsTyping.useSubscription(undefined, {
  //   onData(data) {
  //     setCurrentlyTyping(data);
  //   },
  // });

  return (
    <div className="flex h-screen w-screen flex-col md:flex-row">
      <ChatSideBar roomId={roomId} />
      <div className="flex-1 overflow-y-hidden md:h-screen">
        <section className="flex h-full flex-col justify-end space-y-4 bg-gray-700 p-4">
          <div className="space-y-4 overflow-y-auto">
            <button
              data-testid="loadMore"
              onClick={() => fetchPreviousPage()}
              disabled={!hasPreviousPage || isFetchingPreviousPage}
              className="rounded bg-indigo-500 px-4 py-2 text-white disabled:opacity-40"
            >
              {isFetchingPreviousPage
                ? "Loading more..."
                : hasPreviousPage
                ? "Load More"
                : "Nothing more to load"}
            </button>
            <div className="flex flex-col">
              {messages
                ? [
                    ...messages.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-row justify-start gap-2 p-1  hover:bg-black/10"
                      >
                        <Image
                          src={item.user.image ?? "/inent.png"}
                          alt={`${item.user.name}'s image`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full p-1"
                        />
                        <article key={item.id} className="w-full text-gray-50">
                          <header className="flex justify-between text-sm">
                            <div className="flex flex-row space-x-2 text-sm">
                              <h3 className="text-base">{item.user.name}</h3>
                              <span className="text-gray-500">
                                {new Intl.DateTimeFormat("en-GB", {
                                  dateStyle: "short",
                                  timeStyle: "short",
                                }).format(new Date(item.createdAt))}
                              </span>
                            </div>
                            <div className="flex flex-row gap-2 text-sm">
                              {item.userId === room?.me?.userId && (
                                <UpdateMessageForm
                                  messageId={item.id}
                                  messageContent={item.content}
                                />
                              )}
                              {(item.userId === room?.me?.userId ||
                                isAdmin) && (
                                <DeleteMessageForm messageId={item.id} />
                              )}
                            </div>
                          </header>
                          <p className="text-md whitespace-pre-line leading-tight">
                            {item.content}
                          </p>
                        </article>
                      </div>
                    )),
                    <div ref={scrollTargetRef}></div>,
                  ]
                : []}
            </div>
          </div>
          <div className="w-full">
            <AddMessageForm
              disabled={!room}
              roomId={roomId}
              onMessagePost={() => scrollToBottomOfList()}
            />
            <p className="h-2 italic text-gray-400">
              {/* {currentlyTyping.length
                  ? `${currentlyTyping.join(", ")} typing...`
                  : ""} */}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [api].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://api.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createSSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.fetchQuery('post.all');
//
//   return {
//     props: {
//       apiState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
