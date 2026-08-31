import { graphql } from "@octokit/graphql";

export function createGitHubGraphQLClient(accessToken: string) {
  return graphql.defaults({
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
}

export async function runGitHubGraphQL<TResponse>(
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {}
) {
  const client = createGitHubGraphQLClient(accessToken);

  return client<TResponse>(query, variables);
}
