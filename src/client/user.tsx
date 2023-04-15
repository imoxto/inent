import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { RouterInputs, api } from "~/utils/api";
import { UserRooms } from "./userRoom";
import { CardMin, SearchUserBar } from "./common/small";
import { SubmitHandler, useForm } from "react-hook-form";
import { enqueueSnackbar } from "notistack";

export const UserDetails: React.FC<{
  user: Omit<User, "emailVerified" | "email">;
}> = ({ user }) => {
  return (
    <div className="flex flex-row items-center gap-2 rounded p-2 hover:bg-white/5">
      <Image
        className="rounded-full"
        src={user.image || "/favicon.ico"}
        alt="user's image"
        width={60}
        height={60}
      />
      <div className="flex-column ">
        {user.username && <h1>{user.username}</h1>}
        {user.name && <p>{user.name}</p>}
        {user.description && <p>{user.description}</p>}
      </div>
    </div>
  );
};

export const UserCardMin: React.FC<{
  user: Pick<User, "id" | "name" | "image">;
}> = ({ user }) => {
  return (
    <Link href={`/u/${user.id}`}>
      <CardMin content={{ name: user.name, image: user.image }} />
    </Link>
  );
};

export const UserListMin: React.FC<{
  users: Pick<User, "username" | "id" | "name" | "image">[];
}> = ({ users }) => {
  return (
    <div>
      {users.map((user) => (
        <UserCardMin
          key={user.id}
          user={{
            id: user.id,
            name: user.name ?? null,
            image: user.image ?? null,
          }}
        />
      ))}
    </div>
  );
};

export const UserHomePage = () => {
  const { data: sessionData } = useSession();
  const { data: helloSecuredMessage } = api.root.helloSecured.useQuery();
  const { data: userRooms, refetch: refetchUserRooms } =
    api.userRoom.getUserRooms.useQuery();
  const {
    register,
    handleSubmit,
    // watch,
    // formState: { errors },
  } = useForm();
  const { mutateAsync, isLoading } = api.room.create.useMutation();

  const onSubmit: SubmitHandler<RouterInputs["room"]["create"]> = (data) => {
    mutateAsync(data, {
      onError: (error) => enqueueSnackbar(error.message, { variant: "error" }),
      onSuccess: () => {
        enqueueSnackbar("Room created", { variant: "success" });
      },
      onSettled: () => refetchUserRooms(),
    });
  };

  if (!sessionData) {
    return null;
  }
  return (
    <div>
      <div>
        <SearchUserBar />
        <UserRooms userRooms={userRooms ?? []} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit as any)}
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
            id="floating_password"
            className="peer block w-full appearance-none border-0 border-b-2 border-gray-300 bg-transparent py-2.5 px-0 text-sm text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-0 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
            placeholder=" "
            {...register("description")}
          />
          <label className="absolute top-3 -z-10 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500">
            description
          </label>
        </div>
        <select
          id="countries"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          disabled={isLoading}
          {...register("visibility")}
        >
          <option>public</option>
          <option>private</option>
        </select>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto"
        >
          Submit
        </button>
      </form>
      <p>{helloSecuredMessage}</p>
    </div>
  );
};
