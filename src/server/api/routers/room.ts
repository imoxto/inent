import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const roomRouter = createTRPCRouter({
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
          description: z.string().nullable(),
          visibility: z.enum(["public", "private"]),
        })
        .strict()
    )
    .mutation(({ ctx, input }) => {
      const userId = ctx.session.user.id;
      return ctx.prisma.room.create({
        data: {
          ...input,
          userRoom: { create: { userId, inviterId: userId, role: "owner" } },
        },
      });
    }),
});
