import { User } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";

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
    <Link
      className="mx-4 flex flex-row items-center gap-2 rounded p-2 hover:bg-white/5"
      href={`/u/${user.id}`}
    >
      <Image
        className="rounded-full"
        src={user.image || "/favicon.ico"}
        alt="user's image"
        width={40}
        height={40}
      />
      {user.name}
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
