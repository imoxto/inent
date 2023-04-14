import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getOne: publicProcedure
    .input(
      z
        .object({
          userId: z.string().cuid2(),
        })
        .strict()
    )
    .query(({ ctx, input }) => {
      const currentUserId = ctx.session?.user.id;
      const { userId } = input;
      return ctx.prisma.user.findFirst({
        where:
          userId === currentUserId
            ? { id: userId }
            : { id: userId, visibility: "public" },
      });
    }),

  update: protectedProcedure
    .input(
      z
        .object({
          name: z.string().nullable(),
          description: z.string().nullable(),
          username: z.string().nullable(),
          visibility: z.enum(["public", "private"]),
        })
        .strict()
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),
});
