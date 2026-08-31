# GitHub PR Mentor AI

A learning-first Next.js app that will connect to GitHub and explain pull request comments, failed checks, commits, and conflicts.

## Architecture

Read the system diagrams:

```txt
docs/architecture.md
```

## Lesson 1: Project Foundation

This checkpoint creates the smallest real app shell:

- `Next.js` gives us the web app framework.
- `TypeScript` lets us catch mistakes before the app runs.
- `app/layout.tsx` defines shared page metadata and wraps every route.
- `app/page.tsx` is the first route, rendered at `/`.
- `app/globals.css` contains site-wide styling.
- `.env.example` lists secrets and local settings without storing real values.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Check TypeScript:

```bash
npm run typecheck
```

Build the app:

```bash
npm run build
```

## Learning Rule

Every feature should answer four questions:

1. What problem does this solve?
2. What file owns the behavior?
3. How do we know it works?
4. What secret, permission, or external API risk does it introduce?

## Lesson 2: Database Foundation

This checkpoint adds local Postgres, Prisma, and pgvector.

Read the lesson notes:

```txt
docs/lessons/02-database-foundation.md
```

The short version:

```bash
npm run db:up
npm run db:migrate -- --name init
npm run db:generate
npm run dev
curl http://localhost:3000/api/health
```

## Lesson 3: AI and RAG Workflow

This checkpoint explains the AI vocabulary and the retrieve-then-generate workflow we will use later.

Read the lesson notes:

```txt
docs/lessons/03-ai-rag-workflow.md
```

## Lesson 4: GitHub OAuth

This checkpoint adds the sign-in foundation.

Read the lesson notes:

```txt
docs/lessons/04-github-oauth.md
```

## Lesson 5: GitHub GraphQL Foundation

This checkpoint uses the stored GitHub OAuth token to query GitHub's GraphQL API.

Read the lesson notes:

```txt
docs/lessons/05-github-graphql.md
```
