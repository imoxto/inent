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
        })
        .strict()
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
});
