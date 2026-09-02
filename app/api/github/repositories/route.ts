import { getCurrentUser } from "@/lib/auth/session";
import { runGitHubGraphQL } from "@/lib/github/client";
import { REPOSITORIES_QUERY } from "@/lib/github/queries";
import { parsePositiveInt } from "@/lib/github/request";
import { repositoriesResponseSchema } from "@/lib/github/schemas";
import { getGitHubAccessTokenForUser, GitHubTokenError } from "@/lib/github/token";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      {
        error: "You must sign in with GitHub first."
      },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const first = Math.min(parsePositiveInt(url.searchParams.get("first"), 10), 25);

  try {
    const accessToken = await getGitHubAccessTokenForUser(user.id);
    const response = await runGitHubGraphQL<unknown>(
      accessToken,
      REPOSITORIES_QUERY,
      { first }
    );

    // Validate the GitHub response before the app trusts it.
    const data = repositoriesResponseSchema.parse(response);

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

  console.error("GitHub repositories route failed", error);

  return Response.json(
    {
      error: "GitHub GraphQL request failed."
    },
    { status: 502 }
  );
}
