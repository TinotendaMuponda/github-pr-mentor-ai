"use client";

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

export function RepositoryList() {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading"
  });

  async function loadRepositories() {
    setFetchState({ status: "loading" });

    try {
      const response = await fetch("/api/github/repositories?first=10", {
        cache: "no-store"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Could not load repositories.");
      }

      setFetchState({
        status: "success",
        data: payload as RepositoriesResponse
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
    void loadRepositories();
  }, []);

  if (fetchState.status === "loading") {
    return (
      <section className="repo-section" aria-labelledby="repo-list-title">
        <RepositoryListHeader />
        <div className="repo-status">Loading repositories...</div>
      </section>
    );
  }

  if (fetchState.status === "error") {
    return (
      <section className="repo-section" aria-labelledby="repo-list-title">
        <RepositoryListHeader />
        <div className="repo-status error-status">
          <p>{fetchState.message}</p>
          <button className="secondary-action" type="button" onClick={loadRepositories}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  const repositories = fetchState.data.viewer.repositories.nodes;

  return (
    <section className="repo-section" aria-labelledby="repo-list-title">
      <RepositoryListHeader />

      <div className="repo-meta">
        <span>Request cost: {fetchState.data.rateLimit.cost}</span>
        <span>Remaining: {fetchState.data.rateLimit.remaining}</span>
      </div>

      {repositories.length === 0 ? (
        <div className="repo-status">No repositories were returned.</div>
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

              <div className="repo-card-actions">
                <a className="secondary-action" href={repository.url}>
                  Open on GitHub
                </a>
              </div>

              <div className="repo-pr-list">
                <p className="repo-pr-label">Open pull requests</p>
                {repository.pullRequests.nodes.length === 0 ? (
                  <p className="repo-empty">No open pull requests.</p>
                ) : (
                  <ul>
                    {repository.pullRequests.nodes.map((pullRequest) => (
                      <li key={pullRequest.id}>
                        <a href={pullRequest.url}>
                          #{pullRequest.number} {pullRequest.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RepositoryListHeader() {
  return (
    <div className="repo-section-header">
      <div>
        <p className="section-label">Lesson 6 · Repository picker</p>
        <h2 id="repo-list-title">Your GitHub repositories</h2>
      </div>
      <a className="secondary-action" href="/api/github/repositories">
        View JSON
      </a>
    </div>
  );
}
