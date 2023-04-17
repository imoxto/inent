import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Navbar } from "~/client/common/nav";
import { useRouter } from "next/router";
import { SnackbarProvider } from "notistack";
import { Seo } from "~/client/Seo";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  return (
    <SnackbarProvider>
      <Seo />
      <SessionProvider session={session}>
        <main className="flex min-h-screen flex-col items-center justify-start bg-gray-900 text-white">
          {router.pathname !== "/room/[roomId]" && <Navbar />}
          <Component {...pageProps} />
        </main>
      </SessionProvider>
      <ReactQueryDevtools />
    </SnackbarProvider>
  );
};

export default api.withTRPC(MyApp);
