CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "githubId" TEXT NOT NULL,
  "login" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GitHubAccount" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "accessTokenCiphertext" TEXT,
  "tokenScope" TEXT,
  "tokenType" TEXT,
  "expiresAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "GitHubAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Repository" (
  "id" TEXT NOT NULL,
  "githubId" TEXT NOT NULL,
  "owner" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "nameWithOwner" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "isPrivate" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PullRequest" (
  "id" TEXT NOT NULL,
  "githubId" TEXT NOT NULL,
  "repositoryId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "authorLogin" TEXT,
  "state" TEXT NOT NULL,
  "baseRefName" TEXT NOT NULL,
  "headRefName" TEXT NOT NULL,
  "mergedAt" TIMESTAMPTZ(6),
  "githubCreatedAt" TIMESTAMPTZ(6),
  "githubUpdatedAt" TIMESTAMPTZ(6),
  "syncedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PullRequestComment" (
  "id" TEXT NOT NULL,
  "githubId" TEXT NOT NULL,
  "pullRequestId" TEXT NOT NULL,
  "authorLogin" TEXT,
  "body" TEXT NOT NULL,
  "path" TEXT,
  "line" INTEGER,
  "url" TEXT,
  "githubCreatedAt" TIMESTAMPTZ(6),
  "githubUpdatedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "PullRequestComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CheckRun" (
  "id" TEXT NOT NULL,
  "githubId" TEXT,
  "pullRequestId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "conclusion" TEXT,
  "detailsUrl" TEXT,
  "summary" TEXT,
  "startedAt" TIMESTAMPTZ(6),
  "completedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "CheckRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Commit" (
  "id" TEXT NOT NULL,
  "githubId" TEXT,
  "pullRequestId" TEXT NOT NULL,
  "oid" TEXT NOT NULL,
  "messageHeadline" TEXT NOT NULL,
  "messageBody" TEXT,
  "authorName" TEXT,
  "authorEmail" TEXT,
  "committedAt" TIMESTAMPTZ(6),
  "url" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "Commit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MergeConflict" (
  "id" TEXT NOT NULL,
  "pullRequestId" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'detected',
  "oursSnippet" TEXT,
  "theirsSnippet" TEXT,
  "resolvedAt" TIMESTAMPTZ(6),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "MergeConflict_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Explanation" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "pullRequestId" TEXT,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "question" TEXT,
  "summary" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "promptTokens" INTEGER,
  "completionTokens" INTEGER,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Explanation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Embedding" (
  "id" TEXT NOT NULL,
  "explanationId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector(1536),
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
CREATE UNIQUE INDEX "GitHubAccount_providerAccountId_key" ON "GitHubAccount"("providerAccountId");
CREATE INDEX "GitHubAccount_userId_idx" ON "GitHubAccount"("userId");
CREATE UNIQUE INDEX "Repository_githubId_key" ON "Repository"("githubId");
CREATE UNIQUE INDEX "Repository_nameWithOwner_key" ON "Repository"("nameWithOwner");
CREATE UNIQUE INDEX "PullRequest_githubId_key" ON "PullRequest"("githubId");
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");
CREATE INDEX "PullRequest_repositoryId_idx" ON "PullRequest"("repositoryId");
CREATE INDEX "PullRequest_state_idx" ON "PullRequest"("state");
CREATE UNIQUE INDEX "PullRequestComment_githubId_key" ON "PullRequestComment"("githubId");
CREATE INDEX "PullRequestComment_pullRequestId_idx" ON "PullRequestComment"("pullRequestId");
CREATE INDEX "PullRequestComment_path_idx" ON "PullRequestComment"("path");
CREATE UNIQUE INDEX "CheckRun_githubId_key" ON "CheckRun"("githubId");
CREATE INDEX "CheckRun_pullRequestId_idx" ON "CheckRun"("pullRequestId");
CREATE INDEX "CheckRun_status_idx" ON "CheckRun"("status");
CREATE INDEX "CheckRun_conclusion_idx" ON "CheckRun"("conclusion");
CREATE UNIQUE INDEX "Commit_githubId_key" ON "Commit"("githubId");
CREATE UNIQUE INDEX "Commit_pullRequestId_oid_key" ON "Commit"("pullRequestId", "oid");
CREATE INDEX "Commit_pullRequestId_idx" ON "Commit"("pullRequestId");
CREATE UNIQUE INDEX "MergeConflict_pullRequestId_path_key" ON "MergeConflict"("pullRequestId", "path");
CREATE INDEX "MergeConflict_pullRequestId_idx" ON "MergeConflict"("pullRequestId");
CREATE INDEX "Explanation_userId_idx" ON "Explanation"("userId");
CREATE INDEX "Explanation_pullRequestId_idx" ON "Explanation"("pullRequestId");
CREATE INDEX "Explanation_targetType_idx" ON "Explanation"("targetType");
CREATE UNIQUE INDEX "Embedding_explanationId_key" ON "Embedding"("explanationId");

ALTER TABLE "GitHubAccount" ADD CONSTRAINT "GitHubAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PullRequestComment" ADD CONSTRAINT "PullRequestComment_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CheckRun" ADD CONSTRAINT "CheckRun_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Commit" ADD CONSTRAINT "Commit_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MergeConflict" ADD CONSTRAINT "MergeConflict_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Explanation" ADD CONSTRAINT "Explanation_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_explanationId_fkey" FOREIGN KEY ("explanationId") REFERENCES "Explanation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
