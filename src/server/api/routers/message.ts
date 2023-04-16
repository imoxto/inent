import { z } from "zod";
import * as Ably from "ably/promises";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env.mjs";
import { TRPCError } from "@trpc/server";
import { cgptRequest } from "~/server/external/cgpt";

const getAblyChannel = (roomId: string) => {
  const client = new Ably.Rest(env.ABLY_API_KEY);
  return client.channels.get(`roomId:${roomId}`);
};

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
      });

      getAblyChannel(input.roomId).publish("new-message", {
        ...message,
        user: {
          name: ctx.session.user.name ?? null,
          image: ctx.session.user.image ?? null,
        },
      });

      const aiReciever = room.userRoom.find(
        (ur) => ur.userId === "Ai-chatbot-v0"
      );
      if (aiReciever) {
        cgptRequest(input.messageContent)
          .then((res) => {
            if (!res.data.choices[0]?.message.content) {
              return;
            }
            ctx.prisma.message
              .create({
                data: {
                  content: res.data.choices[0]?.message.content,
                  roomId: input.roomId,
                  userId: aiReciever.userId,
                },
              })
              .then((message) => {
                getAblyChannel(input.roomId).publish("new-message", {
                  ...message,
                  user: {
                    name: "AI chatbot v0",
                    image: "/cute_robot.webp",
                  },
                });
              });
          })
          .catch((err) => {
            console.error(err);
          });
      }

      return message;
    }),

  update: protectedProcedure
    .input(
      z.object({
        messageContent: z.string(),
        messageId: z.string().cuid2(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const message = await ctx.prisma.message.findUnique({
        where: {
          id: input.messageId,
        },
      });

      if (message?.userId !== userId)
        throw new TRPCError({ code: "UNAUTHORIZED" });

      const updatedMassage = await ctx.prisma.message.update({
        where: {
          id: input.messageId,
        },
        data: {
          content: input.messageContent,
        },
      });
      getAblyChannel(message.roomId).publish("update-message", {
        ...updatedMassage,
        user: {
          name: ctx.session.user.name ?? null,
          image: ctx.session.user.image ?? null,
        },
      });
      return updatedMassage;
    }),

  delete: protectedProcedure
    .input(z.string().cuid2())
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;
      const message = await ctx.prisma.message.findUnique({
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

      const deletedMessage = await ctx.prisma.message.delete({
        where: {
          id: input,
        },
        select: { id: true },
      });
      getAblyChannel(message.roomId).publish(
        "delete-message",
        deletedMessage.id
      );
      return deletedMessage;
    }),
});
