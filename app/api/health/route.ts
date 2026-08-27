import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const databaseCheck = await prisma.$queryRaw<Array<{ ok: number }>>`
      SELECT 1 AS ok
    `;

    const [users, repositories, pullRequests] = await Promise.all([
      prisma.user.count(),
      prisma.repository.count(),
      prisma.pullRequest.count()
    ]);

    return Response.json(
      {
        status: "ok",
        database: databaseCheck[0]?.ok === 1 ? "connected" : "unknown",
        counts: {
          users,
          repositories,
          pullRequests
        }
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (error) {
    console.error("Health check failed", error);

    return Response.json(
      {
        status: "error",
        database: "unavailable"
      },
      { status: 500 }
    );
  }
}
