import { runGitHubGraphQL } from "@/lib/github/client";
import { PULL_REQUEST_OVERVIEW_QUERY } from "@/lib/github/queries";
import {
  pullRequestOverviewResponseSchema,
  type PullRequestOverviewResponse
} from "@/lib/github/schemas";
import { syncPullRequestOverview } from "@/lib/github/sync-pull-request";
import { getGitHubAccessTokenForUser } from "@/lib/github/token";

export type PullRequestParams = {
  owner: string;
  repo: string;
  number: number;
};

export type PullRequestOverviewData = {
  repository: NonNullable<PullRequestOverviewResponse["repository"]>;
  pullRequest: NonNullable<
    NonNullable<PullRequestOverviewResponse["repository"]>["pullRequest"]
  >;
  files: NonNullable<
    NonNullable<PullRequestOverviewResponse["repository"]>["pullRequest"]
  >["files"]["nodes"];
  sync: Awaited<ReturnType<typeof syncPullRequestOverview>>;
  rateLimit: PullRequestOverviewResponse["rateLimit"];
};

export class PullRequestNotFoundError extends Error {
  status = 404;

  constructor() {
    super("Pull request not found or not accessible with this token.");
    this.name = "PullRequestNotFoundError";
  }
}

export async function getPullRequestOverviewForUser(
  userId: string,
  params: PullRequestParams
): Promise<PullRequestOverviewData> {
  const accessToken = await getGitHubAccessTokenForUser(userId);
  const response = await runGitHubGraphQL<unknown>(
    accessToken,
    PULL_REQUEST_OVERVIEW_QUERY,
    params
  );
  const data = pullRequestOverviewResponseSchema.parse(response);

  if (!data.repository?.pullRequest) {
    throw new PullRequestNotFoundError();
  }

  const sync = await syncPullRequestOverview(
    data.repository,
    data.repository.pullRequest
  );

  return {
    repository: data.repository,
    pullRequest: data.repository.pullRequest,
    files: data.repository.pullRequest.files.nodes,
    sync,
    rateLimit: data.rateLimit
  };
}
