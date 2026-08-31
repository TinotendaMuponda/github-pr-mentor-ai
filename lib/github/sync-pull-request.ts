import { prisma } from "@/lib/prisma";
import type { PullRequestOverviewResponse } from "@/lib/github/schemas";

type PullRequestNode = NonNullable<
  NonNullable<PullRequestOverviewResponse["repository"]>["pullRequest"]
>;

export async function syncPullRequestOverview(
  repositoryNode: NonNullable<PullRequestOverviewResponse["repository"]>,
  pullRequestNode: PullRequestNode
) {
  const repository = await prisma.repository.upsert({
    where: {
      githubId: repositoryNode.id
    },
    update: {
      owner: repositoryNode.owner.login,
      name: repositoryNode.name,
      nameWithOwner: repositoryNode.nameWithOwner,
      url: repositoryNode.url,
      isPrivate: repositoryNode.isPrivate
    },
    create: {
      githubId: repositoryNode.id,
      owner: repositoryNode.owner.login,
      name: repositoryNode.name,
      nameWithOwner: repositoryNode.nameWithOwner,
      url: repositoryNode.url,
      isPrivate: repositoryNode.isPrivate
    }
  });

  const pullRequest = await prisma.pullRequest.upsert({
    where: {
      githubId: pullRequestNode.id
    },
    update: {
      repositoryId: repository.id,
      number: pullRequestNode.number,
      title: pullRequestNode.title,
      url: pullRequestNode.url,
      authorLogin: pullRequestNode.author?.login,
      state: pullRequestNode.state,
      baseRefName: pullRequestNode.baseRefName,
      headRefName: pullRequestNode.headRefName,
      mergedAt: toDateOrNull(pullRequestNode.mergedAt),
      githubCreatedAt: toDateOrNull(pullRequestNode.createdAt),
      githubUpdatedAt: toDateOrNull(pullRequestNode.updatedAt),
      syncedAt: new Date()
    },
    create: {
      githubId: pullRequestNode.id,
      repositoryId: repository.id,
      number: pullRequestNode.number,
      title: pullRequestNode.title,
      url: pullRequestNode.url,
      authorLogin: pullRequestNode.author?.login,
      state: pullRequestNode.state,
      baseRefName: pullRequestNode.baseRefName,
      headRefName: pullRequestNode.headRefName,
      mergedAt: toDateOrNull(pullRequestNode.mergedAt),
      githubCreatedAt: toDateOrNull(pullRequestNode.createdAt),
      githubUpdatedAt: toDateOrNull(pullRequestNode.updatedAt),
      syncedAt: new Date()
    }
  });

  const issueComments = pullRequestNode.comments.nodes.map((comment) => ({
    githubId: comment.id,
    authorLogin: comment.author?.login,
    body: comment.body,
    path: null,
    line: null,
    url: comment.url,
    githubCreatedAt: toDateOrNull(comment.createdAt),
    githubUpdatedAt: toDateOrNull(comment.updatedAt)
  }));

  const reviewComments = pullRequestNode.reviewThreads.nodes.flatMap((thread) =>
    thread.comments.nodes.map((comment) => ({
      githubId: comment.id,
      authorLogin: comment.author?.login,
      body: comment.body,
      path: comment.path ?? thread.path,
      line: comment.line ?? thread.line,
      url: comment.url,
      githubCreatedAt: toDateOrNull(comment.createdAt),
      githubUpdatedAt: toDateOrNull(comment.updatedAt)
    }))
  );

  await Promise.all(
    [...issueComments, ...reviewComments].map((comment) =>
      prisma.pullRequestComment.upsert({
        where: {
          githubId: comment.githubId
        },
        update: {
          pullRequestId: pullRequest.id,
          ...comment
        },
        create: {
          pullRequestId: pullRequest.id,
          ...comment
        }
      })
    )
  );

  await Promise.all(
    pullRequestNode.commits.nodes.map(({ commit }) =>
      prisma.commit.upsert({
        where: {
          pullRequestId_oid: {
            pullRequestId: pullRequest.id,
            oid: commit.oid
          }
        },
        update: {
          githubId: commit.id,
          messageHeadline: commit.messageHeadline,
          messageBody: commit.messageBody,
          authorName: commit.author?.name,
          authorEmail: commit.author?.email,
          committedAt: toDateOrNull(commit.committedDate),
          url: commit.url
        },
        create: {
          githubId: commit.id,
          pullRequestId: pullRequest.id,
          oid: commit.oid,
          messageHeadline: commit.messageHeadline,
          messageBody: commit.messageBody,
          authorName: commit.author?.name,
          authorEmail: commit.author?.email,
          committedAt: toDateOrNull(commit.committedDate),
          url: commit.url
        }
      })
    )
  );

  return {
    repositoryId: repository.id,
    pullRequestId: pullRequest.id,
    syncedComments: issueComments.length + reviewComments.length,
    syncedCommits: pullRequestNode.commits.nodes.length
  };
}

function toDateOrNull(value: string | null) {
  return value ? new Date(value) : null;
}
