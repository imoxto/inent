import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRoomRouter = createTRPCRouter({
  getUserRooms: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.userRoom.findMany({
      where: { userId: ctx.session.user.id },
      include: { room: { select: { name: true, image: true } } },
    });
  }),

  getUserRoom: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid2(),
        userId: z.string().cuid2(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { roomId, userId } = input;
      return ctx.prisma.userRoom.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
    }),

  remove: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid2(),
        userId: z.string().cuid2(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, userId } = input;
      const userRooms = await ctx.prisma.userRoom.findMany({
        where: { roomId },
        select: { role: true, userId: true },
      });
      const currentUserRoom = userRooms.find(
        (u) => u.userId === ctx.session.user.id
      );
      const isAdmin = currentUserRoom?.role === "admin";
      if (!isAdmin && userId !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      if (userRooms.length === 1)
        return ctx.prisma.room.delete({ where: { id: roomId } });
      return ctx.prisma.userRoom.delete({
        where: {
          roomId_userId: { roomId, userId },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid2(),
        userId: z.string().cuid2(),
        role: z.enum(["admin", "member"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roomId, userId, role } = input;
      const userRooms = await ctx.prisma.userRoom.findMany({
        where: { roomId },
        select: { role: true, userId: true },
      });
      const currentUserRoom = userRooms.find(
        (u) => u.userId === ctx.session.user.id
      );
      const isAdmin = currentUserRoom?.role === "admin";
      if (!isAdmin && userId !== ctx.session.user.id)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      return ctx.prisma.userRoom.update({
        where: { roomId_userId: { roomId, userId } },
        data: { role },
      });
    }),

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
      const userRoom = ctx.prisma.userRoom.create({
        data: { roomId, userId, inviterId: ctx.session.user.id },
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
