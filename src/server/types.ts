import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "./api/root";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
