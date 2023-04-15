import { enqueueSnackbar } from "notistack";
import { SubmitHandler, useForm } from "react-hook-form";
import { api, RouterInputs } from "~/utils/api";
import { MyModal } from "../common/myModal";
import { MdOutlineDeleteOutline, MdEditNote } from "react-icons/md";

export const CreateRoomForm = ({ onSettled }: { onSettled?: () => void }) => {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm();
  const { mutateAsync: createRoom, isLoading: isCreatingRoom } =
    api.room.create.useMutation();

  const utils = api.useContext();

  const onSubmitCreateGroupFrom: SubmitHandler<
    RouterInputs["room"]["create"]
  > = (data) => {
    createRoom(data, {
      onError: (error) => enqueueSnackbar(error.message, { variant: "error" }),
      onSuccess: () => {
        enqueueSnackbar("Room created", { variant: "success" });
      },
      onSettled: () => {
        onSettled?.();
        utils.userRoom.getUserRooms.invalidate();
      },
    });
  };
  return (
    <MyModal button="Create a room">
      {({ closeModal }) => {
        return (
          <form
            onSubmit={handleSubmit((data) => {
              onSubmitCreateGroupFrom(data as any);
              closeModal();
            })}
            className=" min-w-[400px] p-4"
          >
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                required
                {...register("name")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Name
              </label>
            </div>
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("description")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                description
              </label>
            </div>

            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("image")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Image link
              </label>
            </div>

            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("inviteCode")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Invite Code
              </label>
            </div>

            <select
              id="countries"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              {...register("visibility")}
            >
              <option>public</option>
              <option>private</option>
            </select>
            <button
              type="submit"
              disabled={isCreatingRoom}
              className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
            >
              Submit
            </button>
          </form>
        );
      }}
    </MyModal>
  );
};

export const UpdateRoomForm = ({
  room,
  onSettled,
}: {
  room: RouterInputs["room"]["update"];
  onSettled?: () => void;
}) => {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm({
    defaultValues: {
      name: room.name,
      description: room.description,
      image: room.image,
      inviteCode: room.inviteCode,
      visibility: room.visibility,
    },
  });
  const { mutateAsync: updateRoom, isLoading: isUpdatingRoom } =
    api.room.update.useMutation();
  const utils = api.useContext();

  const onSubmitCreateGroupFrom: SubmitHandler<
    RouterInputs["room"]["update"]
  > = (data) => {
    updateRoom(
      { ...data, id: room.id },
      {
        onError: (error) =>
          enqueueSnackbar(error.message, { variant: "error" }),
        onSuccess: () => {
          enqueueSnackbar("Room updated", { variant: "success" });
        },
        onSettled: () => {
          onSettled?.();
          utils.userRoom.getUserRooms.invalidate();
        },
      }
    );
  };
  return (
    <MyModal button="Update room">
      {({ closeModal }) => {
        return (
          <form
            onSubmit={handleSubmit((data) => {
              onSubmitCreateGroupFrom(data as any);
              closeModal();
            })}
            className=" min-w-[400px] p-4"
          >
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                required
                {...register("name")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Name
              </label>
            </div>
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("description")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                description
              </label>
            </div>

            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("image")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Image link
              </label>
            </div>

            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                {...register("inviteCode")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Invite Code
              </label>
            </div>

            <select
              id="countries"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
              {...register("visibility")}
            >
              <option>public</option>
              <option>private</option>
            </select>
            <button
              type="submit"
              disabled={isUpdatingRoom}
              className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
            >
              Submit
            </button>
          </form>
        );
      }}
    </MyModal>
  );
};

export const JoinRoomForm = ({ onSettled }: { onSettled?: () => void }) => {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm();

  const utils = api.useContext();

  const { mutateAsync: joinRoom, isLoading: isJoiningRoom } =
    api.room.join.useMutation();

  const onSubmitJoinGroupFrom: SubmitHandler<{ inviteCode: string }> = (
    data
  ) => {
    joinRoom(data.inviteCode, {
      onError: (error) => enqueueSnackbar(error.message, { variant: "error" }),
      onSuccess: () => {
        enqueueSnackbar("Room created", { variant: "success" });
      },
      onSettled: () => {
        utils.room.getMyRoom.invalidate();
        onSettled?.();
      },
    });
  };
  return (
    <MyModal button="Join a room">
      {({ closeModal }) => {
        return (
          <form
            onSubmit={handleSubmit((data) => {
              onSubmitJoinGroupFrom(data as any);
              closeModal();
            })}
            className=" min-w-[400px] p-4"
          >
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                required
                {...register("inviteCode")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Invite Code
              </label>
            </div>

            <button
              type="submit"
              disabled={isJoiningRoom}
              className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
            >
              Submit
            </button>
          </form>
        );
      }}
    </MyModal>
  );
};

export function DeleteMessageForm({
  messageId,
  onSettled,
  onSuccess,
}: {
  messageId: string;
  onSettled?: () => void;
  onSuccess?: () => void;
}) {
  const { mutateAsync: deleteMessage, isLoading: isDeletingMessage } =
    api.message.delete.useMutation({
      onError: (error) => enqueueSnackbar(error.message, { variant: "error" }),
      onSuccess: () => {
        enqueueSnackbar("Message deleted", {
          variant: "success",
        });
        onSuccess?.();
      },
      onSettled: () => {
        onSettled?.();
      },
    });
  return (
    <MyModal
      button={<MdOutlineDeleteOutline className="cursor-pointer" color="red" />}
    >
      {({ closeModal }) => {
        return (
          <div className="p-4">
            <p className="text-lg font-medium">Delete message</p>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete this message?
            </p>
            <div className="mt-4 flex justify-end">
              <button
                className="mr-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-800"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-blue-800"
                onClick={() => {
                  deleteMessage(messageId);
                  closeModal();
                }}
                disabled={isDeletingMessage}
              >
                Delete
              </button>
            </div>
          </div>
        );
      }}
    </MyModal>
  );
}

export function UpdateMessageForm({
  messageId,
  messageContent,
  onSettled,
  onSuccess,
}: {
  messageId: string;
  messageContent: string;
  onSettled?: () => void;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm({
    defaultValues: {
      messageContent,
    },
  });

  const { mutateAsync: updateMessage, isLoading: isUpdatingMessage } =
    api.message.update.useMutation({
      onError: (error) => enqueueSnackbar(error.message, { variant: "error" }),
      onSuccess: () => {
        enqueueSnackbar("Message updated", {
          variant: "success",
        });
        onSuccess?.();
      },
      onSettled: () => {
        onSettled?.();
      },
    });

  const onSubmitUpdateMessage: SubmitHandler<{ messageContent: string }> = (
    data
  ) => {
    updateMessage({ messageId, messageContent: data.messageContent });
  };

  return (
    <MyModal button={<MdEditNote className="cursor-pointer" color="blue" />}>
      {({ closeModal }) => {
        return (
          <form
            onSubmit={handleSubmit((data) => {
              onSubmitUpdateMessage(data as any);
              closeModal();
            })}
            className=" min-w-[400px] p-4"
          >
            <div className="group relative z-0 mb-6 w-full">
              <input
                type="text"
                id="floating_text"
                className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
                placeholder=" "
                required
                {...register("messageContent")}
              />
              <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
                Message
              </label>
            </div>

            <button
              type="submit"
              disabled={isUpdatingMessage}
              className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
            >
              Submit
            </button>
          </form>
        );
      }}
    </MyModal>
  );
}