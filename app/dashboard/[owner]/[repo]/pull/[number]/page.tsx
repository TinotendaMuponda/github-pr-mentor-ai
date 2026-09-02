import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppFooter, AppHeader } from "@/components/app-chrome";
import {
  getPullRequestOverviewForUser,
  PullRequestNotFoundError,
  type PullRequestOverviewData
} from "@/lib/github/pull-request-overview";
import { GitHubTokenError } from "@/lib/github/token";
import { getCurrentUser } from "@/lib/auth/session";

type PageProps = {
  params: Promise<{
    owner: string;
    repo: string;
    number: string;
  }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit"
});

export default async function PullRequestDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const routeParams = await params;
  const owner = decodeRouteParam(routeParams.owner);
  const repo = decodeRouteParam(routeParams.repo);
  const number = Number(routeParams.number);

  if (!owner || !repo || !Number.isInteger(number) || number < 1) {
    notFound();
  }

  const data = await loadPullRequestForPage(user.id, {
    owner,
    repo,
    number
  });

  if ("error" in data) {
    return <PullRequestError error={data.error} />;
  }

  const { repository, pullRequest, files, sync, rateLimit } = data;
  const issueComments = pullRequest.comments.nodes;
  const reviewThreads = pullRequest.reviewThreads.nodes;
  const reviewComments = reviewThreads.flatMap((thread) => thread.comments.nodes);
  const commits = pullRequest.commits.nodes.map(({ commit }) => commit);
  const changedLines = files.reduce(
    (total, file) => total + file.additions + file.deletions,
    0
  );

  return (
    <>
      <AppHeader actionHref="/dashboard" actionLabel="Dashboard" />
      <main className="page-shell pr-detail-shell">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span aria-hidden="true">/</span>
          <a href={repository.url}>{repository.nameWithOwner}</a>
          <span aria-hidden="true">/</span>
          <a href={pullRequest.url}>PR #{pullRequest.number}</a>
        </nav>

        <section className="pr-hero" aria-labelledby="pr-title">
          <div>
            <p className="eyebrow">Pull request review</p>
            <h1 id="pr-title">{pullRequest.title}</h1>
            <p>
              {repository.nameWithOwner} compares {pullRequest.headRefName} into{" "}
              {pullRequest.baseRefName}. This page turns the GraphQL response
              into the workspace the AI explanation flow will use next.
            </p>
          </div>

          <div className="pr-actions">
            <span className="repo-visibility">{pullRequest.state}</span>
            <span className="repo-visibility">{pullRequest.mergeable}</span>
            <a className="secondary-action" href={pullRequest.url}>
              Open on GitHub
            </a>
          </div>
        </section>

        <section className="pr-metrics" aria-label="Pull request summary">
          <Metric label="Files changed" value={files.length} />
          <Metric label="Changed lines" value={changedLines} />
          <Metric
            label="Comments"
            value={issueComments.length + reviewComments.length}
          />
          <Metric label="Commits" value={commits.length} />
        </section>

        <section className="pr-workspace" aria-label="Pull request details">
          <div className="pr-main-column">
            <section className="detail-panel" aria-labelledby="files-title">
              <PanelHeader
                id="files-title"
                label="Diff context"
                title="Changed files"
                count={files.length}
              />
              <ul className="file-list">
                {files.map((file) => (
                  <li key={file.path}>
                    <span>{file.path}</span>
                    <strong>{file.changeType}</strong>
                    <em>
                      +{file.additions} -{file.deletions}
                    </em>
                  </li>
                ))}
              </ul>
            </section>

            <section className="detail-panel" aria-labelledby="threads-title">
              <PanelHeader
                id="threads-title"
                label="Review context"
                title="Review threads"
                count={reviewThreads.length}
              />
              {reviewThreads.length === 0 ? (
                <EmptyPanelText text="No review threads were returned for this pull request." />
              ) : (
                <div className="thread-list">
                  {reviewThreads.map((thread) => (
                    <article className="thread-item" key={thread.id}>
                      <div className="thread-meta">
                        <span>{thread.isResolved ? "Resolved" : "Open"}</span>
                        <span>{thread.path ?? "No file path"}</span>
                        {thread.line ? <span>Line {thread.line}</span> : null}
                      </div>
                      {thread.comments.nodes.map((comment) => (
                        <CommentBlock
                          key={comment.id}
                          author={comment.author?.login ?? "Unknown author"}
                          body={comment.body}
                          createdAt={comment.createdAt}
                          url={comment.url}
                        />
                      ))}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="comments-title">
              <PanelHeader
                id="comments-title"
                label="Discussion"
                title="Issue comments"
                count={issueComments.length}
              />
              {issueComments.length === 0 ? (
                <EmptyPanelText text="No general PR comments were returned." />
              ) : (
                <div className="comment-list">
                  {issueComments.map((comment) => (
                    <CommentBlock
                      key={comment.id}
                      author={comment.author?.login ?? "Unknown author"}
                      body={comment.body}
                      createdAt={comment.createdAt}
                      url={comment.url}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="detail-panel" aria-labelledby="commits-title">
              <PanelHeader
                id="commits-title"
                label="History"
                title="Commits"
                count={commits.length}
              />
              <ul className="commit-list">
                {commits.map((commit) => (
                  <li key={commit.id}>
                    <a href={commit.url}>{commit.messageHeadline}</a>
                    <span>
                      {commit.oid.slice(0, 7)} by{" "}
                      {commit.author?.user?.login ??
                        commit.author?.name ??
                        "Unknown author"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="pr-side-column" aria-label="AI explanation preparation">
            <section className="detail-panel ai-panel">
              <p className="section-label">AI workflow</p>
              <h2>Explanation panel</h2>
              <p>
                Next we will turn this synced PR context into chunks,
                embeddings, retrieval results, and an OpenAI explanation.
              </p>
              <button className="primary-action" type="button" disabled>
                Explain this PR
              </button>
            </section>

            <section className="detail-panel">
              <p className="section-label">Sync result</p>
              <dl className="sync-list">
                <div>
                  <dt>Stored PR</dt>
                  <dd>{sync.pullRequestId}</dd>
                </div>
                <div>
                  <dt>Comments synced</dt>
                  <dd>{sync.syncedComments}</dd>
                </div>
                <div>
                  <dt>Commits synced</dt>
                  <dd>{sync.syncedCommits}</dd>
                </div>
                <div>
                  <dt>GraphQL remaining</dt>
                  <dd>{rateLimit.remaining}</dd>
                </div>
              </dl>
            </section>
          </aside>
        </section>
      </main>
      <AppFooter />
    </>
  );
}

async function loadPullRequestForPage(
  userId: string,
  params: {
    owner: string;
    repo: string;
    number: number;
  }
): Promise<PullRequestOverviewData | { error: unknown }> {
  try {
    return await getPullRequestOverviewForUser(userId, params);
  } catch (error) {
    if (error instanceof PullRequestNotFoundError) {
      notFound();
    }

    return {
      error
    };
  }
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PanelHeader({
  id,
  label,
  title,
  count
}: {
  id: string;
  label: string;
  title: string;
  count: number;
}) {
  return (
    <div className="panel-title-row">
      <div>
        <p className="section-label">{label}</p>
        <h2 id={id}>{title}</h2>
      </div>
      <span>{count}</span>
    </div>
  );
}

function CommentBlock({
  author,
  body,
  createdAt,
  url
}: {
  author: string;
  body: string;
  createdAt: string;
  url: string;
}) {
  return (
    <article className="comment-block">
      <header>
        <strong>{author}</strong>
        <time dateTime={createdAt}>{formatDateTime(createdAt)}</time>
      </header>
      <p>{body}</p>
      <a href={url}>Open comment</a>
    </article>
  );
}

function EmptyPanelText({ text }: { text: string }) {
  return <p className="empty-panel-text">{text}</p>;
}

function PullRequestError({ error }: { error: unknown }) {
  const message =
    error instanceof GitHubTokenError || error instanceof Error
      ? error.message
      : "Could not load this pull request.";

  return (
    <>
      <AppHeader actionHref="/dashboard" actionLabel="Dashboard" />
      <main className="page-shell narrow-shell">
        <section className="detail-panel error-status">
          <p className="section-label">Pull request unavailable</p>
          <h1>Could not load this pull request</h1>
          <p>{message}</p>
          <Link className="secondary-action" href="/dashboard">
            Back to dashboard
          </Link>
        </section>
      </main>
      <AppFooter />
    </>
  );
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function decodeRouteParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
