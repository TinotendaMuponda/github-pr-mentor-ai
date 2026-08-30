const requiredValues = [
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GITHUB_OAUTH_REDIRECT_URI"
];

export default function AuthSetupPage() {
  return (
    <main className="shell compact-shell">
      <section className="intro compact-intro" aria-labelledby="setup-title">
        <div className="eyebrow">GitHub OAuth setup</div>
        <h1 id="setup-title">Finish your GitHub app settings</h1>
        <p>
          The sign-in route is working, but it needs real GitHub OAuth
          credentials before it can redirect to GitHub.
        </p>
        <div className="setup-panel">
          <h2>Required local values</h2>
          <ul>
            {requiredValues.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
        <div className="setup-panel">
          <h2>Use these GitHub settings</h2>
          <dl>
            <div>
              <dt>Homepage URL</dt>
              <dd>http://localhost:3000</dd>
            </div>
            <div>
              <dt>Authorization callback URL</dt>
              <dd>http://localhost:3000/api/auth/github/callback</dd>
            </div>
          </dl>
        </div>
        <a className="secondary-action" href="/">
          Back to home
        </a>
      </section>
    </main>
  );
}
