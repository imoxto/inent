import { useSession } from "next-auth/react";
import { RouterOutputs, api } from "~/utils/api";
import { UserCardMin } from "./user";
import Link from "next/link";
import { UpdateRoomForm, UpdateUserRoomForm } from "./forms/roomForms";
import Image from "next/image";
import { IoClipboardOutline } from "react-icons/io5";

function getUserFromRole(
  userRooms: RouterOutputs["room"]["getMyRoom"]["otherUsers"][number]
) {
  return {
    id: userRooms.userId,
    name: userRooms.user.name,
    image: userRooms.user.image,
    role: userRooms.role,
  };
}

export function ChatSideBar({ roomId }: { roomId: string }) {
  const { data: session } = useSession();
  const { data: room, isLoading } = api.room.getMyRoom.useQuery(roomId);
  const utils = api.useContext();
  const userName = session?.user?.name;

  if (isLoading) {
    return (
      <div className="flex w-full flex-col bg-gray-800 text-center text-lg md:w-72">
        Loading...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex w-full flex-col bg-gray-800 text-center text-lg md:w-72">
        Room not found!
      </div>
    );
  }

  const me = room.me ? getUserFromRole(room.me) : null;
  const users = room.otherUsers.map(getUserFromRole);
  const allUsers = me ? [me, ...users] : users;

  return (
    <section className="flex w-full flex-col bg-gray-800 md:w-72">
      <div className="flex-1 overflow-y-hidden">
        <div className="flex h-full flex-col divide-y divide-gray-700">
          <header className="flex flex-row items-center gap-2 p-4">
            <Image
              src={room.image ?? "/inent.png"}
              alt={`${room.name}'s image`}
              width={40}
              height={40}
            />
            <h1 className="text-3xl font-bold text-gray-50">{room.name}</h1>
          </header>
          <div className="hidden flex-1 space-y-6 overflow-y-auto p-4 text-gray-400 md:block">
            <article className="space-y-2">
              <p className="text-md space-y-2">{room.description}</p>
            </article>
            {userName && (
              <article>
                <h2 className="text-lg text-gray-200">Users</h2>
                <ul className="space-y-2">
                  {allUsers.map((user) => (
                    <li className="flex flex-row items-center justify-between">
                      <UserCardMin
                        user={{
                          id: user.id,
                          name: user.name ?? null,
                          image: user.image ?? null,
                        }}
                      />
                      {(user.id === me?.id || room.me?.role === "admin") && (
                        <UpdateUserRoomForm
                          userId={user.id}
                          roomId={roomId}
                          role={user.role}
                          onSuccess={() => utils.room.getMyRoom.invalidate()}
                          isSelfAndNotAdmin={
                            user.id === me?.id && user.role !== "admin"
                          }
                        />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-row items-center justify-between">
                  <Link href="/">
                    <button>Home</button>
                  </Link>
                  {room.me?.role === "admin" && (
                    <UpdateRoomForm
                      room={room}
                      onSettled={() => utils.room.getMyRoom.invalidate()}
                    />
                  )}
                </div>
                {room.type === "group" && (
                  <div className="flex flex-col">
                    <p>Invite Code:</p>
                    <div className="flex flex-row items-center gap-2">
                      <p>{room.inviteCode}</p>
                      <IoClipboardOutline
                        className="cursor-pointer"
                        onClick={() =>
                          navigator.clipboard.writeText(room.inviteCode)
                        }
                      />
                    </div>
                  </div>
                )}
              </article>
            )}
          </div>
        </div>
      </div>
      <div className="hidden h-16 shrink-0 md:block"></div>
    </section>
  );
}
