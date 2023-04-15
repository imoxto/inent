import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { UserRooms } from "./userRoom";
import { CardMin, SearchUserBar } from "./common/small";
import { CreateRoomForm, JoinRoomForm } from "./forms/roomForms";

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
        <div className="flex flex-row gap-2">
          <CreateRoomForm />
          <JoinRoomForm />
        </div>
        <UserRooms userRooms={userRooms ?? []} />
      </div>
    </div>
  );
};

