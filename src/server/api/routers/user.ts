import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: { OR: [{ visibility: "public" }, { id: ctx.session?.user.id }] },
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
