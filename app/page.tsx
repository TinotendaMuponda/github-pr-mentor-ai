import { AppFooter, AppHeader } from "@/components/app-chrome";

const buildSteps = [
  {
    label: "01",
    title: "Connect GitHub",
    detail:
      "Authenticate with OAuth, store the account connection, and keep access tokens encrypted on the server."
  },
  {
    label: "02",
    title: "Read PR Context",
    detail:
      "Load repositories, pull requests, review threads, commits, file changes, and checks through GitHub GraphQL."
  },
  {
    label: "03",
    title: "Retrieve Signal",
    detail:
      "Store useful PR text, search related context with pgvector, and send only the best evidence to the model."
  },
  {
    label: "04",
    title: "Explain Clearly",
    detail:
      "Return practical explanations that help developers understand comments, failures, conflicts, and next actions."
  }
];

const learningPrinciples = [
  "Server-side secrets only",
  "Runtime validation at API boundaries",
  "Small, testable checkpoints",
  "Readable code that teaches the architecture"
];

export default function Home() {
  return (
    <>
      <AppHeader actionHref="/api/auth/github/start" actionLabel="Sign in" />
      <main className="page-shell">
        <section className="hero-layout" aria-labelledby="page-title">
          <div className="hero-copy">
            <p className="eyebrow">Developer workflow mentor</p>
            <h1 id="page-title">GitHub PR Mentor AI</h1>
            <p>
              A focused workspace for connecting GitHub pull request activity
              to plain-English explanations of comments, failed checks, commits,
              and conflicts.
            </p>
            <div className="actions" aria-label="Start actions">
              <a className="primary-action" href="/api/auth/github/start">
                Sign in with GitHub
              </a>
              <a className="secondary-action" href="/api/auth/me">
                Check session JSON
              </a>
            </div>
          </div>

          <aside className="workflow-panel" aria-label="Current product flow">
            <div className="panel-heading">
              <span className="status-dot" aria-hidden="true" />
              <span>Current architecture</span>
            </div>
            <ol className="workflow-list">
              <li>
                <span>OAuth</span>
                <strong>GitHub account connected</strong>
              </li>
              <li>
                <span>GraphQL</span>
                <strong>Repositories and PRs requested server-side</strong>
              </li>
              <li>
                <span>Validation</span>
                <strong>Zod checks response shape before UI render</strong>
              </li>
              <li>
                <span>RAG path</span>
                <strong>Embeddings and explanations come next</strong>
              </li>
            </ol>
          </aside>
        </section>

        <section className="section-block" aria-labelledby="map-title">
          <div className="section-heading">
            <p className="section-label">Build map</p>
            <h2 id="map-title">A production-minded learning path</h2>
          </div>
          <div className="step-grid">
            {buildSteps.map((step) => (
              <article className="step" key={step.title}>
                <span className="step-number">{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="learning" aria-labelledby="principles-title">
          <div>
            <p className="section-label">Engineering standards</p>
            <h2 id="principles-title">Built to explain itself</h2>
          </div>
          <ul>
            {learningPrinciples.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </section>
      </main>
      <AppFooter />
    </>
  );
}
