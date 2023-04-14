import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const rootRouter = createTRPCRouter({
  hello: publicProcedure.query(() => {
    return `Hello!`;
  }),
  helloSecured: protectedProcedure.query(({ ctx }) => {
    return `Hello ${ctx.session.user.name}!`;
  }),
  search: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const users = await ctx.prisma.user.findMany({
      select: { id: true, name: true, username: true, image: true },
      where: {
        visibility: "public",
        OR: [
          { username: { search: input } },
          { name: { search: input } },
          { id: { search: input } },
        ],
      },
      take: 5,
    });
    const rooms = await ctx.prisma.room.findMany({
      select: { id: true, name: true, image: true },
      where: { name: { search: input } },

      take: 5,
    });
    return {
      users,
      rooms,
    };
  }),
});
