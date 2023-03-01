import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const rootRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ roomId: z.string().cuid2() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.message.findMany({
        where: {
          room: {
            id: input.roomId,
            userRoom: { some: { userId: ctx.session.user.id } },
          },
        },
      });
    }),

  send: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
        targetUserId: z.string().cuid2(),
        roomId: z.string().cuid2(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.message.create({
        data: {
          content: input.messageContent,
          roomId: input.roomId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
