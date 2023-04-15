import { type NextPage } from "next";
import { useRouter } from "next/router";
import { ErrorComponent, Loading } from "~/client/common/errors";
import { Seo } from "~/client/Seo";
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
      <Seo
        title={`${user.username || user.name || "Unknown User"} | Inent`}
        description={user.description ?? "Unknown user"}
        ogImage={user.image ?? undefined}
      />
      <UserDetails user={user} />
    </>
  );
};

export default User;
