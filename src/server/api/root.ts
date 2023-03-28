import { createTRPCRouter } from "~/server/api/trpc";
import { rootRouter } from "~/server/api/routers";
import { userRouter } from "./routers/user";
import { userRoomRouter } from "./routers/userRoom";
import { roomRouter } from "./routers/room";
import { messageRouter } from "./routers/message";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  room: roomRouter,
  message: messageRouter,
  userRoom: userRoomRouter,
  root: rootRouter,
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
