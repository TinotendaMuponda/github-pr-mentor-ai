# GitHub PR Mentor AI

A learning-first Next.js app that will connect to GitHub and explain pull request comments, failed checks, commits, and conflicts.

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
