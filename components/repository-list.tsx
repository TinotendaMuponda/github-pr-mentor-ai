"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type PullRequestSummary = {
  id: string;
  number: number;
  title: string;
  url: string;
  state: string;
  updatedAt: string;
};

type RepositorySummary = {
  id: string;
  name: string;
  nameWithOwner: string;
  url: string;
  isPrivate: boolean;
  updatedAt: string;
  pullRequests: {
    nodes: PullRequestSummary[];
  };
};

type RepositoriesResponse = {
  viewer: {
    repositories: {
      nodes: RepositorySummary[];
    };
  };
  rateLimit: {
    cost: number;
    remaining: number;
    resetAt: string;
  };
};

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: RepositoriesResponse };

const dateFormatter = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

export function RepositoryList() {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading"
  });

  async function requestRepositories(): Promise<RepositoriesResponse> {
    const response = await fetch("/api/github/repositories?first=10", {
      cache: "no-store"
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "Could not load repositories.");
    }

    return payload as RepositoriesResponse;
  }

  async function refreshRepositories() {
    setFetchState({ status: "loading" });

    try {
      setFetchState({
        status: "success",
        data: await requestRepositories()
      });
    } catch (error) {
      setFetchState({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Could not load repositories."
      });
    }
  }

  useEffect(() => {
    let shouldIgnoreResponse = false;

    async function loadInitialRepositories() {
      try {
        const data = await requestRepositories();

        if (!shouldIgnoreResponse) {
          setFetchState({
            status: "success",
            data
          });
        }
      } catch (error) {
        if (!shouldIgnoreResponse) {
          setFetchState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Could not load repositories."
          });
        }
      }
    }

    void loadInitialRepositories();

    return () => {
      shouldIgnoreResponse = true;
    };
  }, []);

  if (fetchState.status === "loading") {
    return (
      <section
        className="repo-section"
        aria-busy="true"
        aria-labelledby="repo-list-title"
      >
        <RepositoryListHeader onRefresh={refreshRepositories} />
        <div
          className="repo-grid"
          aria-label="Loading repositories"
          aria-live="polite"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="repo-skeleton" key={index} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (fetchState.status === "error") {
    return (
      <section className="repo-section" aria-labelledby="repo-list-title">
        <RepositoryListHeader onRefresh={refreshRepositories} />
        <div className="repo-status error-status" role="alert">
          <strong>Repository sync failed</strong>
          <p>{fetchState.message}</p>
          <button
            className="secondary-action"
            type="button"
            onClick={refreshRepositories}
          >
            Retry request
          </button>
        </div>
      </section>
    );
  }

  const repositories = fetchState.data.viewer.repositories.nodes;

  return (
    <section className="repo-section" aria-labelledby="repo-list-title">
      <RepositoryListHeader onRefresh={refreshRepositories} />

      <div className="repo-meta" aria-label="GitHub API rate limit">
        <span>GraphQL cost {fetchState.data.rateLimit.cost}</span>
        <span>{fetchState.data.rateLimit.remaining} requests remaining</span>
        <span>
          Resets{" "}
          <time dateTime={fetchState.data.rateLimit.resetAt}>
            {formatDate(fetchState.data.rateLimit.resetAt)}
          </time>
        </span>
      </div>

      {repositories.length === 0 ? (
        <div className="repo-status" aria-live="polite">
          <strong>No repositories returned</strong>
          <p>
            GitHub returned an empty repository list for this token and request.
          </p>
        </div>
      ) : (
        <div className="repo-grid">
          {repositories.map((repository) => (
            <article className="repo-card" key={repository.id}>
              <div className="repo-card-header">
                <div>
                  <h3>{repository.name}</h3>
                  <p>{repository.nameWithOwner}</p>
                </div>
                <span className="repo-visibility">
                  {repository.isPrivate ? "Private" : "Public"}
                </span>
              </div>

              <div className="repo-stats">
                <span>
                  Updated{" "}
                  <time dateTime={repository.updatedAt}>
                    {formatDate(repository.updatedAt)}
                  </time>
                </span>
                <span>{repository.pullRequests.nodes.length} open PRs</span>
              </div>

              <div className="repo-card-actions">
                <a
                  className="secondary-action"
                  href={repository.url}
                  aria-label={`Open ${repository.nameWithOwner} on GitHub`}
                >
                  Open GitHub
                </a>
              </div>

              <PullRequestList repository={repository} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RepositoryListHeader({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="repo-section-header">
      <div>
        <p className="section-label">Repository picker</p>
        <h2 id="repo-list-title">Repositories</h2>
      </div>
      <div className="repo-toolbar">
        <button className="secondary-action" type="button" onClick={onRefresh}>
          Refresh
        </button>
        <a className="secondary-action" href="/api/github/repositories">
          View JSON
        </a>
      </div>
    </div>
  );
}

function PullRequestList({ repository }: { repository: RepositorySummary }) {
  if (repository.pullRequests.nodes.length === 0) {
    return (
      <div className="repo-pr-list">
        <p className="repo-pr-label">Open pull requests</p>
        <p className="repo-empty">No open pull requests.</p>
      </div>
    );
  }

  const [owner, repo] = repository.nameWithOwner.split("/");

  return (
    <div className="repo-pr-list">
      <p className="repo-pr-label">Open pull requests</p>
      <ul>
        {repository.pullRequests.nodes.map((pullRequest) => (
          <li key={pullRequest.id}>
            <a href={pullRequest.url}>
              <span>#{pullRequest.number}</span>
              {pullRequest.title}
            </a>
            <a
              className="pr-json-link"
              href={pullRequest.url}
            >
              Open GitHub PR
            </a>
            <Link
              className="pr-json-link"
              href={`/dashboard/${encodeURIComponent(owner)}/${encodeURIComponent(
                repo
              )}/pull/${pullRequest.number}`}
            >
              Review in app
            </Link>
            <a
              className="pr-json-link"
              href={`/api/github/pull-request?owner=${encodeURIComponent(
                owner
              )}&repo=${encodeURIComponent(repo)}&number=${pullRequest.number}`}
            >
              Inspect JSON
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}
