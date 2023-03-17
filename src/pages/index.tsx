import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { Seo } from "~/client/Seo";

const Home: NextPage = () => {
  useSession()
  return (
    <>
      <Seo />
      <div>Welcome to Inent!</div>
    </>
  );
};

export default Home;
