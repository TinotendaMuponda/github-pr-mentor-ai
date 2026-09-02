# Lesson 6: Pull Request Detail Page

## What We Added

We added an app page for reviewing one pull request:

```txt
/dashboard/[owner]/[repo]/pull/[number]
```

Example:

```txt
/dashboard/TinotendaMuponda/github-pr-mentor-ai/pull/3
```

This page turns the GitHub GraphQL pull request response into a real workspace instead of only showing JSON.

## Why This Page Matters

The repository list tells the user which repositories and open PRs exist.

The PR detail page answers the next question:

```txt
What is actually inside this pull request?
```

It shows:

- PR title
- source and target branches
- PR state and mergeability
- changed files
- issue comments
- review threads
- commits
- database sync result
- a placeholder for the future AI explanation panel

## Dynamic Route Meaning

This route:

```txt
app/dashboard/[owner]/[repo]/pull/[number]/page.tsx
```

uses dynamic segments.

That means Next.js reads these URL parts:

```txt
[owner]  -> GitHub owner or organization
[repo]   -> repository name
[number] -> pull request number
```

Then the page uses those values to ask GitHub for the exact PR.

## Shared Data Helper

We moved the PR fetching workflow into:

```txt
lib/github/pull-request-overview.ts
```

That helper does the full backend workflow:

```txt
user id
  -> load encrypted GitHub access token
  -> call GitHub GraphQL
  -> validate response with Zod
  -> sync PR data into Postgres with Prisma
  -> return clean data to the page or API route
```

This is better than duplicating the same logic in multiple places.

Now both of these can use the same workflow:

```txt
/api/github/pull-request
/dashboard/[owner]/[repo]/pull/[number]
```

## Why The Page Is Server-Side

The PR detail page is a server component because it needs secure backend access:

- it checks the signed session
- it loads the GitHub token from Postgres
- it calls GitHub GraphQL
- it syncs data into the database

Those things should not happen directly in browser code.

The browser only receives the rendered page.

## What Comes Next

The next feature is the real AI explanation workflow:

```txt
selected PR
  -> chunk useful PR text
  -> create embeddings
  -> store vectors in pgvector
  -> retrieve related context
  -> send context plus question to OpenAI
  -> render explanation in the PR detail page
```
