import { getCurrentUser } from "@/lib/auth/session";
import {
  getPullRequestOverviewForUser,
  PullRequestNotFoundError
} from "@/lib/github/pull-request-overview";
import { parsePullRequestParams } from "@/lib/github/request";
import { GitHubTokenError } from "@/lib/github/token";

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
    const data = await getPullRequestOverviewForUser(user.id, params);

    return Response.json(
      {
        repository: data.repository,
        pullRequest: data.pullRequest,
        files: data.files,
        sync: data.sync,
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

  if (error instanceof PullRequestNotFoundError) {
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
