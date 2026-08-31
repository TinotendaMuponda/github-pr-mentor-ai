import Link from "next/link";

type AppHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
};

export function AppHeader({ actionHref, actionLabel }: AppHeaderProps) {
  return (
    <header className="app-header">
      <Link className="brand-mark" href="/">
        <span className="brand-icon" aria-hidden="true">
          PR
        </span>
        <span>
          <strong>GitHub PR Mentor AI</strong>
          <small>Pull request understanding workspace</small>
        </span>
      </Link>

      <nav className="header-nav" aria-label="Primary navigation">
        <Link href="/">Overview</Link>
        <Link href="/dashboard">Dashboard</Link>
        {actionHref && actionLabel && actionHref.startsWith("/api/") ? (
          <a className="header-action" href={actionHref}>
            {actionLabel}
          </a>
        ) : actionHref && actionLabel ? (
          <Link className="header-action" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </nav>
    </header>
  );
}

export function AppFooter() {
  return (
    <footer className="app-footer">
      <p>
        Built as a learning-first portfolio project with Next.js, GitHub
        GraphQL, Prisma, Postgres, pgvector, and OpenAI.
      </p>
    </footer>
  );
}
