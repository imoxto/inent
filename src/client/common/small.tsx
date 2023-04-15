import { User } from "@prisma/client";
import Image from "next/image";
import debounce from "lodash/debounce";
import { useState } from "react";
import { RouterOutputs, api } from "~/utils/api";
import Link from "next/link";
import { UserListMin } from "../user";
import { useOutsideClick } from "../hooks";

export const CardMin: React.FC<{
  content: Pick<User, "name" | "image">;
  onClick?: () => void;
}> = ({ content, ...otherProps }) => {
  return (
    <div
      className="flex flex-row items-center gap-2 rounded p-2 hover:bg-white/5"
      {...otherProps}
    >
      <Image
        className="rounded-full"
        src={content.image || "/favicon.ico"}
        alt="content image"
        width={40}
        height={40}
      />
      {content.name}
    </div>
  );
};

// type SearchBarProps = {
//   onSelectUser?: (
//     user: Pick<User, "id" | "username" | "name" | "image">
//   ) => void;
// };

export const SearchUserBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const {
    isLoading,
    data: searchData,
    refetch: searchUsers,
    remove: removeUserSearch,
  } = api.root.search.useQuery(query);

  const debouncedSetQuery = debounce(() => {
    searchUsers();
  }, 300);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    debouncedSetQuery();
  };

  const ref = useOutsideClick(() => {
    removeUserSearch(), setQuery("");
  });

  // const handleUserSelect = (
  //   user: Pick<User, "id" | "username" | "name" | "image">
  // ) => {
  //   setQuery("");
  //   removeUserSearch();
  //   onSelectUser?.(user);
  // };

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
        placeholder="Search for users..."
      />
      {query.length > 0 && (
        <SearchResult searchData={searchData} isLoading={isLoading} />
      )}
    </div>
  );
};

export function SearchResult({
  searchData,
  isLoading,
}: {
  searchData?: RouterOutputs["root"]["search"];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <ul className="absolute z-10 w-full rounded-md border border-gray-300 bg-white  text-gray-900 shadow-lg">
        <div className="cursor-not-allowed px-4 py-2 text-gray-500">
          Loading...
        </div>
      </ul>
    );
  } else if (
    !searchData ||
    (searchData.users.length === 0 && searchData.rooms.length === 0)
  ) {
    return null;
  }
  const { users, rooms } = searchData;
  return (
    <ul className="absolute z-10 w-full rounded-md border border-gray-300 bg-white  text-gray-900 shadow-lg">
      <div>
        {users.length > 0 && (
          <>
            <h1>Users</h1>
            <UserListMin users={searchData.users} />
          </>
        )}

        {rooms.length > 0 && (
          <>
            <h1>Rooms</h1>
            {rooms.map((room) => (
              <Link href={`/room/${room.id}`} key={room.id}>
                <CardMin content={room} />
              </Link>
            ))}
          </>
        )}
      </div>
    </ul>
  );
}

