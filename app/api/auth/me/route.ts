import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        authenticated: false,
        user: null
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  return Response.json(
    {
      authenticated: true,
      user: {
        login: user.login,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      }
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
