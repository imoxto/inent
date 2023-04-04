import { User } from "@prisma/client";
import Image from "next/image";
import debounce from "lodash/debounce";
import { useState } from "react";
import { api } from "~/utils/api";
import Link from "next/link";

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

type SearchBarProps = {
  onSelectUser?: (
    user: Pick<User, "id" | "username" | "name" | "image">
  ) => void;
};

export const SearchUserBar: React.FC<SearchBarProps> = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const {
    isLoading,
    data: users,
    refetch: searchUsers,
    remove: removeUserSearch,
  } = api.user.search.useQuery(query);

  const debouncedSetQuery = debounce(() => {
    searchUsers();
  }, 300);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    debouncedSetQuery();
  };

  const handleUserSelect = (
    user: Pick<User, "id" | "username" | "name" | "image">
  ) => {
    setQuery("");
    removeUserSearch();
    onSelectUser?.(user);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleQueryChange}
        className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
        placeholder="Search for users..."
      />
      {query.length > 0 && users && (
        <ul className="absolute z-10 w-full rounded-md border border-gray-300 bg-white  text-gray-900 shadow-lg">
          {isLoading ? (
            <li className="cursor-not-allowed px-4 py-2 text-gray-500">
              Loading...
            </li>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
              >
                <Link href={`/u/${user.id}`}>
                  <CardMin content={user} />
                </Link>
              </div>
            ))
          ) : (
            <li className="cursor-not-allowed px-4 py-2 text-gray-500">
              No matching users found.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};
