import { AppFooter, AppHeader } from "@/components/app-chrome";

const requiredValues = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_OAUTH_REDIRECT_URI"
];

export default function AuthSetupPage() {
  return (
    <>
      <AppHeader actionHref="/" actionLabel="Back home" />
      <main className="page-shell narrow-shell">
        <section className="setup-hero" aria-labelledby="setup-title">
          <p className="eyebrow">GitHub OAuth setup</p>
          <h1 id="setup-title">Connect the local app to GitHub</h1>
          <p>
            The sign-in route is ready. Add the OAuth credentials below so
            localhost can redirect through GitHub and return to this app.
          </p>
        </section>

        <section className="setup-grid" aria-label="OAuth setup details">
          <article className="setup-panel">
            <div>
              <p className="section-label">Environment</p>
              <h2>Required local values</h2>
            </div>
            <ul className="code-list">
              {requiredValues.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </ul>
          </article>

          <article className="setup-panel">
            <div>
              <p className="section-label">GitHub OAuth App</p>
              <h2>Callback settings</h2>
            </div>
            <dl className="settings-list">
              <div>
                <dt>Homepage URL</dt>
                <dd>http://localhost:3000</dd>
              </div>
              <div>
                <dt>Authorization callback URL</dt>
                <dd>http://localhost:3000/api/auth/github/callback</dd>
              </div>
            </dl>
          </article>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
