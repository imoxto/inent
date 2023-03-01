import { type AppProps } from "next/app";
import { getProviders, signIn } from "next-auth/react";
import { type GetServerSideProps } from "next/types";

const SignIn = ({ providers }: { providers: AppProps }) => {
  return (
    <>
      <h1>Sign in</h1>
      <div className="p-2">
        {Object.values(providers).map((provider) => {
          if (provider.id === "google") {
            return (
              <button
                type="button"
                className="dark:focus:ring-[#4285F4]/55 inline-flex items-center rounded-lg bg-[#4285F4] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50"
                key={provider.id}
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                <svg
                  className="mr-2 -ml-1 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Sign in with Google
              </button>
            );
          }
          return (
            <button
              key={provider.id}
              onClick={() => signIn(provider.id, { callbackUrl: "/" })}
            >
              Sign in with {provider.name}
            </button>
          );
        })}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};

export default SignIn;
