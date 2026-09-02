import { redirect } from "next/navigation";
import { AppFooter, AppHeader } from "@/components/app-chrome";
import { RepositoryList } from "@/components/repository-list";
import { getCurrentUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <>
      <AppHeader actionHref="/api/github/viewer" actionLabel="Viewer JSON" />
      <main className="page-shell dashboard-shell">
        <section className="dashboard-header" aria-labelledby="dashboard-title">
          <div>
            <p className="eyebrow">Authenticated workspace</p>
            <h1 id="dashboard-title">Welcome, {user.name ?? user.login}</h1>
            <p>
              Choose a repository, inspect open pull requests, and prepare the
              context that the AI explanation workflow will use next.
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button className="secondary-action" type="submit">
              Sign out
            </button>
          </form>
        </section>

        <section className="dashboard-layout" aria-label="Pull request workspace">
          <RepositoryList />

          <aside className="insight-panel" aria-labelledby="insight-title">
            <p className="section-label">Coming next</p>
            <h2 id="insight-title">PR explanation panel</h2>
            <p>
              This area will summarize selected pull request comments, failed
              checks, commits, and conflicts with retrieved context.
            </p>
            <div className="insight-queue">
              <span>Comments</span>
              <span>Checks</span>
              <span>Commits</span>
              <span>Conflicts</span>
            </div>
          </aside>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
