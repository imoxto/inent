import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { UserCardMin } from "../user";
import { AuthButton } from "./auth";

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 px-4 py-2">
      <span />
      <div className="flex flex-row items-center">
        {sessionData && (
          <UserCardMin
            user={{
              id: sessionData.user.id,
              name: sessionData.user.name ?? null,
              username: sessionData.user.username ?? null,
              image: sessionData.user.image ?? null,
            }}
          />
        )}
        <AuthButton />
      </div>
    </div>
  );
};
