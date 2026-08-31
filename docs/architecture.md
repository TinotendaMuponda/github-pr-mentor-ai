# Application Architecture

GitHub PR Mentor AI is a full-stack Next.js app. Next.js owns the UI and backend routes, Prisma owns typed database access, Postgres stores durable records, pgvector stores searchable embeddings, GitHub provides pull request data, and OpenAI generates explanations.

## System Overview

```mermaid
flowchart TD
  User[User] --> Browser[Browser]
  Browser --> NextUI[Next.js UI routes]
  Browser --> NextAPI[Next.js API routes]

  NextUI --> Page[app/page.tsx]
  NextAPI --> Health[app/api/health/route.ts]
  NextAPI --> Auth[Future GitHub OAuth routes]
  NextAPI --> GitHubSync[Future GitHub sync routes]
  NextAPI --> Explain[Future AI explanation routes]

  Health --> PrismaClient[lib/prisma.ts]
  Auth --> PrismaClient
  GitHubSync --> PrismaClient
  Explain --> PrismaClient

  PrismaClient --> Postgres[(Postgres)]
  Postgres --> Pgvector[pgvector extension]

  Auth --> GitHubOAuth[GitHub OAuth]
  GitHubSync --> GitHubGraphQL[GitHub GraphQL API]
  Explain --> OpenAI[OpenAI API]
```

## Current Architecture

This is what exists right now.

```mermaid
flowchart LR
  Browser[Browser] --> Home[app/page.tsx]
  Browser --> Health[app/api/health/route.ts]
  Browser --> Auth[app/api/auth routes]
  Browser --> GitHubAPI[app/api/github routes]
  Browser --> Dashboard[app/dashboard/page.tsx]
  Health --> Prisma[lib/prisma.ts]
  Auth --> Prisma
  GitHubAPI --> Prisma
  Dashboard --> Prisma
  Auth --> GitHub[GitHub OAuth]
  GitHubAPI --> GitHubGraphQL[GitHub GraphQL API]
  Prisma --> Database[(Local Postgres)]
  Database --> Vector[pgvector enabled]
```

Current behavior:

```txt
GET /
renders the learning homepage.

GET /api/health
checks Prisma can query Postgres.

GET /api/auth/github/start
starts the GitHub OAuth redirect.

GET /api/auth/github/callback
validates state, exchanges code, stores the GitHub account, and creates a session.

GET /api/auth/me
returns the current signed-in user or logged-out state.

POST /api/auth/logout
deletes the current app session.

GET /api/github/viewer
uses the stored GitHub token to fetch the authenticated GitHub viewer.

GET /api/github/repositories
uses the stored GitHub token to fetch recent owner repositories.

GET /api/github/pull-request?owner=OWNER&repo=REPO&number=NUMBER
fetches a PR overview from GitHub and stores the first comments and commits.
```

## Future Architecture

This is the target architecture as the app grows.

```mermaid
flowchart TD
  User[User] --> App[Next.js App]

  App --> OAuth[GitHub OAuth]
  OAuth --> Session[Session cookie]
  OAuth --> Account[GitHubAccount table]

  App --> PullRequestView[Pull request screen]
  PullRequestView --> SyncRoute[GitHub sync API route]
  SyncRoute --> GraphQL[GitHub GraphQL API]
  GraphQL --> Normalize[Normalize GitHub response]

  Normalize --> Repos[Repository table]
  Normalize --> PRs[PullRequest table]
  Normalize --> Comments[PullRequestComment table]
  Normalize --> Checks[CheckRun table]
  Normalize --> Commits[Commit table]
  Normalize --> Conflicts[MergeConflict table]

  Comments --> Chunking[Chunk useful text]
  Checks --> Chunking
  Commits --> Chunking
  Conflicts --> Chunking

  Chunking --> EmbeddingModel[Embedding model]
  EmbeddingModel --> Embeddings[Embedding table with pgvector]

  User --> Question[Ask a question]
  Question --> Retrieval[Similarity search]
  Embeddings --> Retrieval
  Retrieval --> Prompt[Grounded prompt]
  PRs --> Prompt
  Comments --> Prompt
  Checks --> Prompt
  Commits --> Prompt
  Conflicts --> Prompt

  Prompt --> ExplanationModel[OpenAI explanation model]
  ExplanationModel --> Answer[Answer in UI]
  Answer --> SavedExplanation[Explanation table]
  SavedExplanation --> Chunking
```

## Request Flow: Database Health Check

```mermaid
sequenceDiagram
  participant Browser
  participant Route as app/api/health/route.ts
  participant Prisma as lib/prisma.ts
  participant DB as Postgres

  Browser->>Route: GET /api/health
  Route->>Prisma: import prisma client
  Prisma->>DB: SELECT 1 AS ok
  Route->>DB: count users, repositories, pull requests
  DB-->>Route: query results
  Route-->>Browser: JSON status and counts
```

## Request Flow: Future GitHub OAuth

```mermaid
sequenceDiagram
  participant User
  participant App as Next.js app
  participant GitHub
  participant DB as Postgres via Prisma

  User->>App: Click sign in with GitHub
  App->>GitHub: Redirect with client_id, scope, state
  GitHub-->>App: Redirect callback with code and state
  App->>App: Validate state
  App->>GitHub: Exchange code for access token
  GitHub-->>App: Return access token
  App->>GitHub: Fetch GitHub user profile
  App->>DB: Upsert User and GitHubAccount
  App-->>User: Set session and redirect to dashboard
```

## Request Flow: Future PR Explanation

```mermaid
sequenceDiagram
  participant User
  participant App as Next.js app
  participant GitHub
  participant DB as Postgres and pgvector
  participant OpenAI

  User->>App: Open PR or ask a question
  App->>GitHub: Fetch PR comments, checks, commits, files
  GitHub-->>App: Return PR data
  App->>DB: Store exact PR facts
  App->>OpenAI: Embed useful text chunks
  OpenAI-->>App: Return vectors
  App->>DB: Store vectors in pgvector
  App->>DB: Search similar chunks
  DB-->>App: Return relevant context
  App->>OpenAI: Send grounded prompt
  OpenAI-->>App: Return explanation
  App->>DB: Store explanation
  App-->>User: Show explanation
```

## Layer Responsibilities

```txt
Next.js UI
- Screens the user sees
- Routes like /, /dashboard, /pulls/[number]

Next.js API routes
- Backend endpoints
- OAuth callbacks
- GitHub sync
- AI explanation requests

Prisma
- Typed reads and writes
- Database model access
- Migrations through Prisma CLI

Postgres
- Exact durable facts
- Users, repositories, PRs, comments, checks, commits, explanations

pgvector
- Embedding vectors
- Similarity search over meaning

GitHub APIs
- OAuth identity
- Pull request data from GraphQL

OpenAI APIs
- Embeddings for retrieval
- Explanations for user-facing answers
```
