import { signOut, useSession } from "next-auth/react";
import { RouterOutputs, api } from "~/utils/api";
import { UserListMin } from "./user";
import Link from "next/link";

function getUserFromRole(
  userRooms: RouterOutputs["room"]["getMyRoom"]["otherUsers"][number]
) {
  return {
    id: userRooms.userId,
    name: userRooms.user.name,
    image: userRooms.user.image,
  };
}

export function ChatSideBar({ roomId }: { roomId: string }) {
  const { data: session } = useSession();
  const { data: room, isLoading } = api.room.getMyRoom.useQuery(roomId);
  const userName = session?.user?.name;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!room) {
    return <div>Room not found!</div>;
  }

  const me = room.me ? getUserFromRole(room.me) : null;
  const users = room.otherUsers.map(getUserFromRole);
  const allUsers = me ? [me, ...users] : users;

  return (
    <section className="flex w-full flex-col bg-gray-800 md:w-72">
      <div className="flex-1 overflow-y-hidden">
        <div className="flex h-full flex-col divide-y divide-gray-700">
          <header className="p-4">
            <h1 className="text-3xl font-bold text-gray-50">{room.name}</h1>
          </header>
          <div className="hidden flex-1 space-y-6 overflow-y-auto p-4 text-gray-400 md:block">
            <article className="space-y-2">
              <h2 className="text-lg text-gray-200">Description</h2>
              <p className="text-md space-y-2">{room.description}</p>
            </article>
            {userName && (
              <article>
                <h2 className="text-lg text-gray-200">Users</h2>
                <ul className="space-y-2">
                  <UserListMin users={allUsers} />
                </ul>
                <Link href="/">
                  <button>Home</button>
                </Link>
              </article>
            )}
          </div>
        </div>
      </div>
      <div className="hidden h-16 shrink-0 md:block"></div>
    </section>
  );
}
