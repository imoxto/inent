import { NextRequest, NextResponse } from "next/server";
import { prisma } from "~/server/db";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const messages: string[] = [];
  try {
    const cron = req.nextUrl.searchParams.get("cron");
    if (!cron) return new Response("No cron provided", { status: 400 });
    const users = await prisma.user.findMany();
    messages.push(`Found ${users.length} users`);
    const tokenExceededUsers = users
      .filter((user) => user.aiTokens > 1000)
      .map((user) => user.id);
    const otherUsers = users
      .filter((user) => user.aiTokens <= 1000)
      .map((user) => user.id);
    const updateExceededUserCount = await prisma.user.updateMany({
      where: {
        id: {
          in: tokenExceededUsers,
        },
      },
      data: {
        aiTokens: {
          decrement: 1000,
        },
      },
    });
    messages.push(
      `Updated ${updateExceededUserCount.count} users with exceeded tokens`
    );
    await prisma.user.updateMany({
      where: {
        id: {
          in: otherUsers,
        },
      },
      data: {
        aiTokens: 0,
      },
    });
    messages.push(
      `Updated ${otherUsers.length} users with non-exceeded tokens`
    );
    return new NextResponse(messages.join("\n"), {
      status: 200,
    });
  } catch (err: any) {
    return new NextResponse([...messages, err.message].join("\n"), {
      status: 500,
    });
  }
}
