import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { UserHomePage } from "~/client/user";

const Home: NextPage = () => {
  const { data: sessionData } = useSession();
  return !sessionData ? <div>Welcome to Inent!</div> : <UserHomePage />;
};

export default Home;
