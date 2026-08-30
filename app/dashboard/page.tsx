import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

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
        <form action="/api/auth/logout" method="post">
          <button className="primary-action" type="submit">
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
