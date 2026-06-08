# Phase 1 Edge Cases — Static Prototype

**Phase goal:** Full UI flow with mock data, Zod schemas, session state — no LLM.  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-1-static-prototype)

---

## Quick checklist before leaving Phase 1

- [ ] Invalid mock data fails Zod parse in tests
- [ ] Refresh on `/review` restores state from `sessionStorage`
- [ ] Direct URL to `/analyze` without state redirects to `/input`
- [ ] Scores clamped 0–100 in schema
- [ ] Empty textarea blocks Analyze with inline message
- [ ] Side-by-side handles resume with zero experience bullets

---

## Zod schemas (`lib/schemas.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-SCH-01 | 🔴 | `overallScore` is 150 or -5 | Schema rejects; clamp or `.min(0).max(100)` | `MatchScoreSchema` | Unit: invalid scores |
| P1-SCH-02 | 🟡 | LLM returns `confidence: "HIGH"` (wrong case) | Use `z.enum(['high','medium','low'])`; fail parse | `BulletRewriteSchema` | Unit |
| P1-SCH-03 | 🟡 | Missing optional fields (`summary`, `company`) | Parse succeeds with defaults (`skills: []`) | Schemas use `.default([])` where needed | Unit |
| P1-SCH-04 | 🟡 | Extra unknown JSON keys from future LLM | `.strict()` or `.strip()` — document choice | All object schemas | Unit |
| P1-SCH-05 | 🟡 | Empty `experience` array | Valid `ResumeProfile`; UI must handle empty state | `ResumeProfileSchema` | UI + unit |
| P1-SCH-06 | 🟡 | `bullets` array with empty strings | Reject or filter empty strings in preprocess | `ExperienceEntrySchema` | Unit |
| P1-SCH-07 | 🟢 | Very long single bullet (>500 chars) | Allow in schema; truncate display in UI optional | Schema + component | Manual |
| P1-SCH-08 | 🟡 | `seniorityLevel` invalid enum | Reject or coerce to `'unknown'` | `JobDescriptionProfileSchema` | Unit |
| P1-SCH-09 | 🟡 | Duplicate skills in arrays | Dedupe in Phase 2; schema allows duplicates in Phase 1 mock | Note for Phase 2 | — |
| P1-SCH-10 | 🔴 | `TailoringRun` missing `originalMatchScore` | Required field; mock must always include | `TailoringRunSchema` | Mock data test |

---

## Mock data (`lib/mock-data.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-MCK-01 | 🟡 | Mock `TailoringRun` fails schema after schema change | Export mock through `TailoringRunSchema.parse()` in test | `lib/mock-data.ts` | Unit |
| P1-MCK-02 | 🟡 | Mock tailored score lower than original | Allowed — UI must not assume improvement | `ScoreCard` | Visual: show both |
| P1-MCK-03 | 🟡 | No bullets changed in mock | Side-by-side still renders; no highlights | `SideBySideDiff` | Manual |
| P1-MCK-04 | 🟢 | Mock gap list empty | Show empty state: "No major gaps detected" | `GapAnalysis` | Manual |
| P1-MCK-05 | 🟡 | Bullet count mismatch original vs tailored columns | Same number of bullets per experience entry | Mock structure | Unit assert lengths |

---

## Client state and sessionStorage

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-SS-01 | 🔴 | `sessionStorage` quota exceeded (~5 MB) | Catch `QuotaExceededError`; show message to shorten input | Store persist helper | Manual with huge paste |
| P1-SS-02 | 🟡 | Corrupted JSON in sessionStorage | Try/catch parse; clear storage; redirect `/input` | Hydration on app load | Manual: inject bad JSON |
| P1-SS-03 | 🟡 | User opens two tabs | Last write wins; accept for MVP; document limitation | Store | Manual |
| P1-SS-04 | 🟡 | Private/incognito session cleared on close | Expected; no error | — | Manual |
| P1-SS-05 | 🟡 | SSR reads sessionStorage | Only hydrate on client (`useEffect`); no hydration mismatch | Store init | No console hydration errors |
| P1-SS-06 | 🟢 | User navigates back after clearing storage | Route guard redirects to `/input` | Page guards | E2E Phase 5 |

---

## Input validation (client)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-IN-01 | 🔴 | Resume or JD only whitespace | Block Analyze; message "Please enter content" | `/input` validation | Unit + manual |
| P1-IN-02 | 🟡 | Resume < 100 characters | Block or warn per architecture min input | `ResumeInput` | Manual |
| P1-IN-03 | 🟡 | JD < 100 characters | Same as resume | `JDInput` | Manual |
| P1-IN-04 | 🟢 | Paste includes `\r\n` vs `\n` | Normalize line endings before store | Input handlers | Unit |
| P1-IN-05 | 🟡 | Unicode names (é, 中文, emoji) | Accept; display correctly | Textareas, fonts | Manual |
| P1-IN-06 | 🟡 | Only resume filled, JD empty | Block Analyze; highlight empty field | Form validation | Manual |
| P1-IN-07 | 🟢 | Character count at exactly max | Show count; no crash (max enforced Phase 2) | Character counter | Manual |

---

## Routing and navigation

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-NAV-01 | 🔴 | User bookmarks `/export` without `tailoringRun` | Redirect to `/input` with toast | Route guard | Manual |
| P1-NAV-02 | 🟡 | Browser back from `/review` to `/analyze` | State preserved; no duplicate mock runs | Navigation | Manual |
| P1-NAV-03 | 🟡 | Double-click Analyze | Debounce or disable button while loading | `/input` | Manual |
| P1-NAV-04 | 🟢 | "Try sample" then navigate away mid-load | Cancel or complete; no orphan loading state | Sample loader | Manual |
| P1-NAV-05 | 🟡 | Step indicator out of sync with URL | Step derived from pathname | Layout component | Manual |

---

## UI components

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-UI-01 | 🟡 | Long `explanation` overflows ScoreCard | Scroll or clamp with "read more" | `ScoreCard` | Manual |
| P1-UI-02 | 🟡 | 20+ gaps in mock | Scrollable list; importance badges readable | `GapAnalysis` | Manual |
| P1-UI-03 | 🟡 | `riskFlag` very long string | Wrap text; don't break layout | `BulletChangeCard` | Manual |
| P1-UI-04 | 🟢 | Missing `company` in JD | Show job title only in summary panel | `JDSummaryPanel` | Mock variant |
| P1-UI-05 | 🟡 | Experience entry with 15 bullets | Scroll in column; performance OK | `SideBySideDiff` | Manual |
| P1-UI-06 | 🟡 | Mobile viewport side-by-side | Stack columns or horizontal scroll (full fix Phase 5) | `SideBySideDiff` | Responsive check |
| P1-UI-07 | 🟢 | PDF export button clicked (stub) | Tooltip "Coming in Phase 3"; no crash | `PDFExportButton` | Manual |

---

## Deterministic scoring stub (`lib/scoring.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-SCR-01 | 🟡 | Skill "JS" vs "JavaScript" no match | Document as limitation; fuzzy match Phase 2+ | `scoring.ts` comment | Unit: known miss |
| P1-SCR-02 | 🟡 | Case sensitivity in keyword match | Normalize to lowercase for comparison | `scoring.ts` | Unit |
| P1-SCR-03 | 🟡 | Empty `requiredSkills` in JD | Skill coverage score defaults sensibly (100 or N/A) | `scoring.ts` | Unit |
| P1-SCR-04 | 🟡 | Division by zero when no skills | Guard denominator | `scoring.ts` | Unit |
| P1-SCR-05 | 🟢 | Punctuation in skills ("C++", "Node.js") | Tokenize carefully | `scoring.ts` | Unit |

---

## Accessibility and UX (Phase 1 baseline)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P1-A11Y-01 | 🟡 | Loading state has no screen reader text | `aria-busy` or live region on Analyze | `/input` | Manual a11y |
| P1-A11Y-02 | 🟢 | Color-only importance badges | Include text label (High/Medium/Low) | `GapAnalysis` | Manual |

---

## Related documents

- Previous: [phase-0-edge-cases.md](./phase-0-edge-cases.md)
- Next: [phase-2-edge-cases.md](./phase-2-edge-cases.md)
