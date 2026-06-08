# Phase 0 Edge Cases — Project Foundation

**Phase goal:** Runnable Next.js app, folder skeleton, fixtures, tooling.  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-0-project-foundation)

---

## Quick checklist before leaving Phase 0

- [ ] `npm run build` passes on a clean clone after `npm install`
- [ ] Path alias `@/` resolves in app and test files
- [ ] `.env.local` is gitignored; `.env.local.example` has all required keys
- [ ] Fixtures are valid UTF-8 plain text (no BOM issues on Windows)
- [ ] shadcn components compile without duplicate Tailwind config

---

## Environment and setup

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P0-ENV-01 | 🔴 | `OPENAI_API_KEY` missing during Phase 0 dev | App still runs; no crash on landing (key only needed Phase 2+) | `.env.local.example`, README | Manual: dev without key |
| P0-ENV-02 | 🟡 | Developer on Windows (OneDrive path) | No symlink or path-length build failures | Document in README; avoid deep nesting | Manual: `npm run build` |
| P0-ENV-03 | 🟡 | Node version mismatch (e.g. Node 18 vs 20) | Document minimum Node in README; engines field in `package.json` | `package.json` `"engines"` | CI matrix |
| P0-ENV-04 | 🟢 | Duplicate `.env` files (`.env`, `.env.local`) | Document precedence; example file lists vars only | README | Manual |
| P0-ENV-05 | 🔴 | Secrets committed to git | `.gitignore` includes `.env*` except `.env.local.example` | `.gitignore` | `git status` audit |

---

## Project structure and tooling

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P0-STR-01 | 🟡 | Empty stub files cause TS `isolatedModules` errors | Stubs export `{}` or `export {}` placeholder | All stub modules | `npm run build` |
| P0-STR-02 | 🟡 | `@/` alias works in Vitest but not in Next | Same `paths` in `tsconfig.json` and `vitest.config.ts` | Both configs | Import from `@/lib/constants` in test |
| P0-STR-03 | 🟢 | shadcn `components.json` path mismatch | Components land in `components/ui/` consistently | `components.json` | Render one Button |
| P0-STR-04 | 🟡 | ESLint conflicts with Prettier (if added later) | Single formatting strategy documented | ESLint config | `npm run lint` |
| P0-STR-05 | 🟡 | Playwright stub script fails in CI without browsers | E2E script optional or `playwright install` documented | `package.json`, README | CI optional job |

---

## Fixtures

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P0-FIX-01 | 🟡 | Sample resume uses smart quotes or special chars | Fixtures saved as UTF-8; no mojibake | `fixtures/*.txt` | Read file in Node test |
| P0-FIX-02 | 🟡 | Sample JD becomes stale (job closed) | Fixture is generic enough; note "representative listing" in comment | `fixtures/sample-jd.txt` header comment | Manual review |
| P0-FIX-03 | 🟢 | Empty fixture files committed by mistake | Fixtures have min length (>500 chars resume, >200 JD) | Pre-commit or README | File size check |
| P0-FIX-04 | 🟡 | Resume fixture has PII (real phone/email) | Use fictional contact info only | Fixture content review | Manual |

---

## Next.js bootstrap

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P0-NXT-01 | 🟡 | App Router pages 404 before Phase 1 | Placeholder pages export default component (even minimal) | `app/*/page.tsx` | Navigate all routes |
| P0-NXT-02 | 🟢 | Tailwind not applied to app directory | `content` paths include `./app/**/*.{ts,tsx}` | `tailwind.config.ts` | Visual check |
| P0-NXT-03 | 🟡 | Strict mode double-mount breaks future state (Phase 1) | Aware for Zustand hydration; document if needed | README note | Phase 1 verify |
| P0-NXT-04 | 🟢 | `public/` assets 404 | Only reference assets that exist | `public/` | Network tab |

---

## Documentation

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P0-DOC-01 | 🟡 | New developer skips env setup | README lists copy `.env.local.example` → `.env.local` | README | Fresh clone walkthrough |
| P0-DOC-02 | 🟢 | Links to architecture docs broken | Relative links from repo root / `docs/` | README | Click links |

---

## Do not solve in Phase 0

| Scenario | Defer to |
|---|---|
| Resume/JD validation logic | Phase 1 |
| LLM errors | Phase 2 |
| PDF rendering | Phase 3 |
| File upload | Phase 5 |

---

## Related documents

- Next: [phase-1-edge-cases.md](./phase-1-edge-cases.md)
- [implementation-plan.md](../implementation-plan.md#phase-0-project-foundation)
