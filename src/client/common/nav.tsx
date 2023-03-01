import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "./auth";

export const Navbar: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <div className="flex w-full flex-row items-center justify-between gap-4 px-4 py-2">
      <div></div>
      <div className="flex flex-row items-center">
        {sessionData && (
          <Link
            className="mx-4 flex flex-row items-center gap-2 rounded-full p-2 hover:bg-white/5"
            href={`/u/${sessionData.user.username || sessionData.user.id}`}
          >
            <Image
              className="rounded-full"
              src={sessionData.user.image || "/favicon.ico"}
              alt="user's image"
              width={40}
              height={40}
            />
            {sessionData.user.username || sessionData.user.name}
          </Link>
        )}
        <AuthButton />
      </div>
    </div>
  );
};
