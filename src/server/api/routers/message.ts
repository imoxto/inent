import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const messageRouter = createTRPCRouter({
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
        include: {
          user: { select: { image: true } },
        },
      });
    }),

  send: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
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

  sendInitialDm: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
        targetUserId: z.string().cuid2(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const currentUserId = ctx.session.user.id;
      const room = await ctx.prisma.room.create({
        data: {
          name: "DM",
          userRoom: {
            create: {
              userId: currentUserId,
              inviterId: currentUserId,
              role: "owner",
            },
          },
        },
      });
      await ctx.prisma.userRoom.create({
        data: {
          roomId: room.id,
          userId: input.targetUserId,
          inviterId: currentUserId,
        },
      });

      return ctx.prisma.message.create({
        data: {
          content: input.messageContent,
          roomId: room.id,
          userId: ctx.session.user.id,
        },
      });
    }),
});
