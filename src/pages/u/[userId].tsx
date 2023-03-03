import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ErrorComponent, Loading } from "~/client/common/errors";
import { UserDetails } from "~/client/user";
import { api } from "~/utils/api";

const User: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userId as string;
  const { data: user, isLoading } = api.user.getOne.useQuery({ userId });
  if (isLoading) {
    return <Loading />;
  } else if (!user) {
    return <ErrorComponent text="User not found." />;
  }
  return (
    <>
      <Head>
        <title>{`${
          user.username || user.name || "Unknown User"
        } | Inent`}</title>
        <meta name="description" content={user.description ?? "Unknown user"} />
      </Head>
      <UserDetails user={user} />
    </>
  );
};

export default User;
