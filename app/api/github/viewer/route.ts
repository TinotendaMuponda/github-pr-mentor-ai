import { getCurrentUser } from "@/lib/auth/session";
import { runGitHubGraphQL } from "@/lib/github/client";
import { VIEWER_QUERY } from "@/lib/github/queries";
import { viewerResponseSchema } from "@/lib/github/schemas";
import { getGitHubAccessTokenForUser, GitHubTokenError } from "@/lib/github/token";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        error: "You must sign in with GitHub first."
      },
      { status: 401 }
    );
  }

  try {
    const accessToken = await getGitHubAccessTokenForUser(user.id);
    const response = await runGitHubGraphQL<unknown>(
      accessToken,
      VIEWER_QUERY
    );
    const data = viewerResponseSchema.parse(response);

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return handleGitHubRouteError(error);
  }
}

function handleGitHubRouteError(error: unknown) {
  if (error instanceof GitHubTokenError) {
    return Response.json(
      {
        error: error.message
      },
      { status: error.status }
    );
  }

  console.error("GitHub viewer route failed", error);

  return Response.json(
    {
      error: "GitHub GraphQL request failed."
    },
    { status: 502 }
  );
}
