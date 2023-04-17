import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roomRouter = createTRPCRouter({
  getMyRoom: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: {
          id: input,
          OR: [{ visibility: "public" }, { userRoom: { some: { userId } } }],
        },
        include: {
          userRoom: {
            include: {
              user: {
                select: { name: true, image: true },
              },
            },
          },
        },
      });
      if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { userRoom, ...rest } = room;
      const me = userRoom.find((ur) => ur.userId === userId);
      const otherUsers = userRoom.filter((ur) => ur.userId !== userId);

      return {
        ...rest,
        me,
        otherUsers,
      };
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          id: z.string().cuid2(),
          name: z.string(),
          description: z.string().nullish(),
          visibility: z.enum(["public", "private"]),
          image: z.string().nullish(),
          inviteCode: z.string().optional(),
        })
        .transform((input) => {
          if (input.image === "") {
            input.image = undefined;
          }
          if (input.inviteCode === "") {
            input.inviteCode = undefined;
          }
          return input;
        })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: {
          id: input.id,
          userRoom: { some: { userId, role: "admin" } },
        },
      });
      if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
      const { id, ...rest } = input;
      return ctx.prisma.room.update({
        where: { id: input.id },
        data: rest,
      });
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.room.findMany({
      where: { visibility: "public" },
    });
  }),

  create: protectedProcedure
    .input(
      z
        .object({
          name: z.string(),
          description: z.string().nullish(),
          visibility: z.enum(["public", "private"]),
          image: z.string().nullish(),
          inviteCode: z.string().optional(),
        })
        .transform((input) => {
          if (input.image === "") {
            input.image = undefined;
          }
          if (input.inviteCode === "") {
            input.inviteCode = undefined;
          }
          return input;
        })
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.room.create({
        data: {
          ...input,
          userRoom: { create: { userId, inviterId: userId, role: "admin" } },
        },
      });
    }),

  join: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: { inviteCode: input, type: "group" },
        include: { userRoom: true },
      });
      if (!room) throw new TRPCError({ code: "NOT_FOUND" });
      if (room.userRoom.some((ur) => ur.userId === userId)) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      return ctx.prisma.userRoom.create({
        data: {
          userId,
          roomId: room.id,
          inviterId: userId,
          role: "member",
        },
      });
    }),

  leave: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const room = await ctx.prisma.room.findFirst({
        where: {
          id: input,
          userRoom: { some: { userId } },
        },
        include: { userRoom: { select: { userId: true, role: true } } },
      });
      if (!room) throw new TRPCError({ code: "UNAUTHORIZED" });
      const admins = room.userRoom.filter((ur) => ur.role === "admin");
      if (
        (admins.length <= 1 && admins[0]?.userId === userId) ||
        room.type === "dm"
      ) {
        return ctx.prisma.room.delete({
          where: { id: room.id },
        });
      }
      return ctx.prisma.userRoom.delete({
        where: { roomId_userId: { roomId: room.id, userId } },
      });
    }),

  createDM: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      if (userId === input) throw new TRPCError({ code: "BAD_REQUEST" });
      const [user1, user2, currentRoom] = await ctx.prisma.$transaction([
        ctx.prisma.user.findUnique({ where: { id: userId } }),
        ctx.prisma.user.findUnique({ where: { id: input } }),
        ctx.prisma.room.findFirst({
          where: {
            type: "dm",
            visibility: "private",
            userRoom: {
              every: {
                userId: {
                  in: [userId, input],
                },
              },
            },
          },
        }),
      ]);
      if (!user1 || !user2) throw new TRPCError({ code: "NOT_FOUND" });
      if (currentRoom) return currentRoom;

      const room = await ctx.prisma.room.create({
        data: {
          name: `DM: ${user1.name} & ${user2.name}`,
          type: "dm",
          userRoom: {
            create: [
              { userId, inviterId: userId, role: "admin" },
              { userId: input, inviterId: userId, role: "admin" },
            ],
          },
          visibility: "private",
        },
      });
      return room;
    }),
});
