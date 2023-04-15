import { z } from "zod";
import * as Ably from "ably/promises";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";

export const messageRouter = createTRPCRouter({
  infinite: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid2(),
        cursor: z.string().nullish(),
        take: z.number().min(1).max(50).nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: {
          id: input.roomId,
          OR: [{ visibility: "public" }, { userRoom: { some: { userId } } }],
        },
        include: {
          userRoom: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
      const take = input.take ?? 10;
      const cursor = input.cursor;

      const page = await ctx.prisma.message.findMany({
        where: { roomId: input.roomId },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: take + 1,
        skip: 0,
      });
      const items = page.reverse();
      let prevCursor: null | typeof cursor = null;
      if (items.length > take) {
        const prev = items.shift();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        prevCursor = prev!.id;
      }
      return {
        items,
        prevCursor,
      };
    }),

  create: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
        roomId: z.string().cuid2(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: {
          id: input.roomId,
          OR: [{ visibility: "public" }, { userRoom: { some: { userId } } }],
        },
        include: {
          userRoom: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
      const message = await ctx.prisma.message.create({
        data: {
          content: input.messageContent,
          roomId: input.roomId,
          userId: ctx.session.user.id,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      const client = new Ably.Rest(env.ABLY_API_KEY);

      var channel = client.channels.get(`roomId:${input.roomId}`);

      await channel.publish("new-message", message);
      return message;
    }),

  delete: protectedProcedure
    .input(z.string().cuid2())
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const message = await ctx.prisma.message.findFirst({
        where: {
          id: input,
        },
        include: {
          room: {
            select: {
              userRoom: {
                select: {
                  userId: true,
                  role: true,
                },
                where: {
                  userId,
                },
              },
            },
          },
        },
      });

      if (
        message?.room?.userRoom[0]?.role !== "admin" &&
        message?.userId !== userId
      )
        throw new TRPCError({ code: "UNAUTHORIZED" });

      await ctx.prisma.message.delete({
        where: {
          id: input,
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
              role: "admin",
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
