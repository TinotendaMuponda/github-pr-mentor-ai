import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RepositoryList } from "@/components/repository-list";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <main className="shell compact-shell">
      <section className="intro compact-intro" aria-labelledby="dashboard-title">
        <div className="eyebrow">Lesson 4 · GitHub OAuth</div>
        <h1 id="dashboard-title">Welcome, {user.name ?? user.login}</h1>
        <p>
          The app has created a signed session cookie and stored your GitHub
          account record in Postgres. Next we will use the encrypted GitHub token
          to read pull request data through GitHub GraphQL.
        </p>
        <div className="actions" aria-label="GitHub GraphQL test links">
          <a className="secondary-action" href="/api/github/viewer">
            View GitHub viewer JSON
          </a>
          <a className="secondary-action" href="/api/github/repositories">
            View repositories JSON
          </a>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="primary-action" type="submit">
            Sign out
          </button>
        </form>
      </section>

      <RepositoryList />
    </main>
  );
}
