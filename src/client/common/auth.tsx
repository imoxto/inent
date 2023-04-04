import { signIn, signOut, useSession } from "next-auth/react";

export const AuthButton: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <button
      className="rounded bg-white/5 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/10"
      onClick={sessionData ? () => void signOut() : () => void signIn()}
    >
      {sessionData ? "Sign out" : "Sign in"}
    </button>
  );
};
