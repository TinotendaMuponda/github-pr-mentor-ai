const buildSteps = [
  {
    title: "Connect GitHub",
    detail: "Sign in with GitHub OAuth and request only the permissions needed to read PR context."
  },
  {
    title: "Read Pull Requests",
    detail: "Use GitHub GraphQL to load comments, review threads, commits, files, and check results."
  },
  {
    title: "Explain The Signal",
    detail: "Send structured PR context to OpenAI from the server and return beginner-friendly guidance."
  },
  {
    title: "Remember Patterns",
    detail: "Store PRs, explanations, and embeddings in Postgres with Prisma and pgvector."
  }
];

const learningPrinciples = [
  "Small checkpoints before big features",
  "Server-side secrets only",
  "Typed data at every boundary",
  "Tests for parsing, API calls, and user flows"
];

export default function Home() {
  return (
    <main className="shell">
      <section className="intro" aria-labelledby="page-title">
        <div className="eyebrow">Lesson 1 · Project foundation</div>
        <h1 id="page-title">GitHub PR Mentor AI</h1>
        <p>
          We are building a Next.js app that connects to GitHub, reads pull
          request activity, and explains comments, failed checks, commits, and
          conflicts in plain English.
        </p>
        <div className="actions" aria-label="Current setup status">
          <span>Next.js</span>
          <span>TypeScript</span>
          <span>Learning-first build</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="map-title">
        <div>
          <p className="section-label">Build map</p>
          <h2 id="map-title">How the app will grow</h2>
        </div>
        <div className="step-grid">
          {buildSteps.map((step, index) => (
            <article className="step" key={step.title}>
              <span className="step-number">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="learning" aria-labelledby="principles-title">
        <h2 id="principles-title">How we will learn it</h2>
        <ul>
          {learningPrinciples.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
