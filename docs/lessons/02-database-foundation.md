# Lesson 2: Database Foundation

This app needs a database because GitHub and OpenAI calls are expensive, rate-limited, and easier to understand when their results are stored.

## The Mental Model

Postgres is the durable storage layer. Prisma is the typed TypeScript client we use to read and write that storage. pgvector is a Postgres extension that lets us store embeddings for similarity search later.

In this lesson:

- `docker-compose.yml` runs Postgres locally with pgvector installed.
- `.env` stores the local database connection string.
- `prisma/schema.prisma` describes the application data model.
- `prisma/migrations/.../migration.sql` turns that model into real database tables.
- `lib/prisma.ts` creates one reusable Prisma Client instance for the app.
- `app/api/health/route.ts` proves the app can query the database.

## Why These Tables Exist

- `User`: the person using the app.
- `GitHubAccount`: the user's GitHub OAuth account and token metadata.
- `Repository`: a GitHub repository we have synced.
- `PullRequest`: the core review object we are explaining.
- `PullRequestComment`: review and discussion comments from a PR.
- `CheckRun`: CI jobs and their statuses.
- `Commit`: commits included in the PR.
- `MergeConflict`: files or conflict snippets that need explanation.
- `Explanation`: AI-generated guidance for a PR, comment, check, commit, or conflict.
- `Embedding`: vector representation of explanation text for similarity search.

## Commands

Start Postgres:

```bash
npm run db:up
```

Apply migrations:

```bash
npm run db:migrate -- --name init
```

Generate Prisma Client:

```bash
npm run db:generate
```

Run the app:

```bash
npm run dev
```

Check the database route:

```bash
curl http://localhost:3000/api/health
```

Expected result:

```json
{
  "status": "ok",
  "database": "connected",
  "counts": {
    "users": 0,
    "repositories": 0,
    "pullRequests": 0
  }
}
```

## Best Practices

- Do not commit `.env`; commit `.env.example` instead.
- Store OAuth tokens encrypted, not as plain text.
- Keep GitHub IDs unique so repeated syncs update existing rows.
- Use indexes on fields we will filter by often, like PR state and check conclusion.
- Use raw SQL for pgvector operations until Prisma fully models vector columns.
