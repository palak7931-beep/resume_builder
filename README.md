# Resume Shapeshifter

JD-to-resume tailoring engine with match scoring, gap analysis, and side-by-side PDF proof.

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables (required starting Phase 2):

```bash
cp .env.local.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page links to `/input`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project docs

- [Problem statement](./docs/problemstatement.md)
- [Architecture](./docs/architecture.md)
- [Implementation plan](./docs/implementation-plan.md)
- [Edge cases by phase](./docs/edge-cases/README.md)

## Phase status

**Phase 0 (complete):** Next.js foundation, folder skeleton, shadcn/ui, fixtures, Vitest, Playwright stub.

**Phase 1 (next):** Zod schemas, mock UI flow, client state.

## Fixtures

Sample data for demo mode and tests:

- `fixtures/sample-resume.txt`
- `fixtures/sample-jd.txt`
