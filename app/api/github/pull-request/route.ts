import { getCurrentUser } from "@/lib/auth/session";
import { runGitHubGraphQL } from "@/lib/github/client";
import { PULL_REQUEST_OVERVIEW_QUERY } from "@/lib/github/queries";
import { parsePullRequestParams } from "@/lib/github/request";
import { pullRequestOverviewResponseSchema } from "@/lib/github/schemas";
import { syncPullRequestOverview } from "@/lib/github/sync-pull-request";
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

  const params = parsePullRequestParams(new URL(request.url));

  if (!params) {
    return Response.json(
      {
        error: "Provide owner, repo, and number query parameters."
      },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getGitHubAccessTokenForUser(user.id);
    const response = await runGitHubGraphQL<unknown>(
      accessToken,
      PULL_REQUEST_OVERVIEW_QUERY,
      params
    );
    const data = pullRequestOverviewResponseSchema.parse(response);

    if (!data.repository?.pullRequest) {
      return Response.json(
        {
          error: "Pull request not found or not accessible with this token."
        },
        { status: 404 }
      );
    }

    const sync = await syncPullRequestOverview(
      data.repository,
      data.repository.pullRequest
    );

    return Response.json(
      {
        repository: data.repository,
        pullRequest: data.repository.pullRequest,
        files: data.repository.pullRequest.files.nodes,
        sync,
        rateLimit: data.rateLimit
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
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

  console.error("GitHub pull request route failed", error);

  return Response.json(
    {
      error: "GitHub GraphQL request failed."
    },
    { status: 502 }
  );
}
