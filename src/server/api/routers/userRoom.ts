import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const rootRouter = createTRPCRouter({
  invitePerson: protectedProcedure
    .input(
      z
        .object({
          roomId: z.string().cuid2(),
          userId: z.string().cuid2(),
        })
        .strict()
    )
    .mutation(async ({ input, ctx }) => {
      const { roomId, userId } = input;
      const userRoom = ctx.prisma.userRoom.upsert({
        create: { roomId, userId, inviterId: ctx.session.user.id },
        update: {},
        where: { roomId_userId: { roomId, userId } },
      });
      return userRoom;
    }),

  acceptInvite: protectedProcedure
    .input(
      z
        .object({
          roomId: z.string().cuid2(),
        })
        .strict()
    )
    .mutation(async ({ input, ctx }) => {
      const { roomId } = input;
      const userRoom = ctx.prisma.userRoom.update({
        data: { role: "member" },
        where: { roomId_userId: { roomId, userId: ctx.session.user.id } },
      });
      return userRoom;
    }),
});
