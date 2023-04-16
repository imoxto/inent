import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { UserRooms } from "./userRoom";
import { CardMin, SearchUserBar } from "./common/small";
import {
  CreateRoomForm,
  DMUserButtom,
  JoinRoomForm,
  UpdateUserForm,
} from "./forms/roomForms";
import { MdLockOutline, MdOutlineGroup } from "react-icons/md";

export const UserDetails: React.FC<{
  user: Omit<User, "emailVerified" | "email">;
}> = ({ user }) => {
  const { data: session } = useSession();
  return (
    <div className="flex w-[400px] flex-col items-center gap-6 p-2">
      <Image
        className="rounded-full"
        src={user.image || "/favicon.ico"}
        alt="user's image"
        width={60}
        height={60}
      />
      <div className="flex w-full flex-col gap-2">
        {user.name && <h1 className="text-lg font-bold">{user.name}</h1>}
        {user.description && <p className="text-sm">{user.description}</p>}
        <div className="flex flex-row items-center gap-2">
          {user.visibility === "public" ? (
            <MdOutlineGroup />
          ) : (
            <MdLockOutline />
          )}
          <p className="text-sm text-gray-400">{`${user.visibility} profile`}</p>
        </div>
      </div>
      <div className="flex w-full flex-row items-center justify-between gap-2">
        <Link href="/">
          <button>Home</button>
        </Link>
        {user.id === session?.user?.id ? (
          <UpdateUserForm />
        ) : (
          <DMUserButtom userId={user.id} />
        )}
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
  users: Pick<User, "id" | "name" | "image">[];
}> = ({ users }) => {
  return (
    <>
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
    </>
  );
};

export const UserHomePage = () => {
  const { data: sessionData } = useSession();
  const { data: userRooms } = api.userRoom.getUserRooms.useQuery();

  if (!sessionData) {
    return null;
  }
  return (
    <div>
      <div className="flex flex-col gap-3">
        <SearchUserBar />
        <div className="flex flex-row items-center justify-between gap-2">
          <CreateRoomForm />
          <JoinRoomForm />
        </div>
        <UserRooms userRooms={userRooms ?? []} />
      </div>
    </div>
  );
};

