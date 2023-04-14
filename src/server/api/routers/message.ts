import { observable } from "@trpc/server/observable";
import { z } from "zod";
import { Realtime } from "ably";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { Message } from "@prisma/client";

const ably = new Realtime.Promise(env.ABLY_API_KEY);
ably.connection.once("connected", () => console.log("Connected to Ably!"));
const getRoomChannel = (roomId: string) => ably.channels.get(`room:${roomId}`);

console.log("Connected to Ably!");

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
      const channel = getRoomChannel(input.roomId);
      const message = await ctx.prisma.message.create({
        data: {
          content: input.messageContent,
          roomId: input.roomId,
          userId: ctx.session.user.id,
        },
      });

      await channel.publish("add", message);
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

  onAdd: protectedProcedure
    .input(z.string())
    .subscription(async ({ input }) => {
      const channel = getRoomChannel(input);
      return observable<
        Message & {
          user: {
            name: string | null;
            image: string | null;
          };
        }
      >((emit) => {
        const onAdd = (message: {
          data: Message & {
            user: {
              name: string | null;
              image: string | null;
            };
          };
        }) => {
          emit.next(message.data);
        };

        channel.subscribe("add", onAdd);
      });
    }),
});
