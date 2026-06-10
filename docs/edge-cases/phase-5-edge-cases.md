# Phase 5 Edge Cases — Polish and Deploy

**Phase goal:** PDF/DOCX upload, production UX, security, E2E, deployment.  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-5-polish-and-deploy)

---

## Quick checklist before leaving Phase 5

- [ ] PDF upload garbled text shows warning + paste fallback
- [ ] File > 5 MB rejected before upload completes
- [ ] Rate limit returns friendly message on `/api/tailor-run`
- [ ] Production smoke test completes with sample data
- [ ] E2E passes in CI (mock LLM if no API key)
- [ ] Mobile review page usable (stacked columns)
- [ ] No PII in production logs

---

## Document upload (`services/document-ingestion.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-UPL-01 | 🔴 | File > 5 MB | Reject before parse; clear error | API + client | Integration |
| P5-UPL-02 | 🔴 | Wrong MIME (`.exe` renamed `.pdf`) | Validate magic bytes / MIME | Ingestion | Integration |
| P5-UPL-03 | 🟡 | Empty PDF (0 pages text) | Error "Could not extract text" | `pdf-parse` | Unit |
| P5-UPL-04 | 🟡 | Scanned PDF (image only, no OCR) | Empty or garbage text; warn use paste | Ingestion | Manual |
| P5-UPL-05 | 🔴 | Multi-column resume PDF | Garbled line order; show `warnings[]` + paste suggestion | Ingestion heuristics | Manual fixture |
| P5-UPL-06 | 🟡 | Password-protected PDF | Parse fails; message to remove password or paste | `pdf-parse` error | Manual |
| P5-UPL-07 | 🟡 | DOCX with complex tables | Partial text; warnings | `mammoth` | Manual |
| P5-UPL-08 | 🟡 | DOCX macros / embedded objects | Strip to text only; ignore macros | `mammoth` | Security review |
| P5-UPL-09 | 🟡 | `fileBase64` corrupted / invalid | `400 INVALID_FILE` | API | Integration |
| P5-UPL-10 | 🟡 | Base64 inflates memory | Stream or size check pre-decode | API | Unit |
| P5-UPL-11 | 🟢 | `.doc` legacy format | Reject with "use DOCX or paste" | API | Manual |
| P5-UPL-12 | 🟡 | UTF-16 or odd encoding in DOCX | Normalize to UTF-8 | Ingestion | Unit |
| P5-UPL-13 | 🟡 | User uploads JD as resume by mistake | Parser runs; low quality — user can fix on input | UX | Manual |
| P5-UPL-14 | 🟡 | Garbled text detection heuristic | High non-alpha ratio → warning flag | `document-ingestion.ts` | Unit |

---

## Garbled text heuristics

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-GAR-01 | 🟡 | `"c o m p a n y"` spaced letters | Flag low confidence | Heuristic | Unit |
| P5-GAR-02 | 🟡 | Random symbols `▢▢▢` > 10% of chars | Warning banner | Heuristic | Unit |
| P5-GAR-03 | 🟡 | Text order reversed lines | Warning; suggest paste | Heuristic optional | Manual |

---

## UX polish

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-UX-01 | 🟡 | Long analyze — no progress | Step indicator: Parsing → Scoring → Tailoring → Finalizing | UI | Manual |
| P5-UX-02 | 🟡 | Retry after error duplicates state | Clear previous error; new run ID | Store | Manual |
| P5-UX-03 | 🟡 | Sample data button on slow network | Disable during load | Landing/input | Manual |
| P5-UX-04 | 🟡 | Score delta negative | Show down arrow honestly; no "improvement" badge | UI | Manual |
| P5-UX-05 | 🟡 | Mobile side-by-side unreadable | Stack columns vertically < md breakpoint | `SideBySideDiff` | Responsive |
| P5-UX-06 | 🟢 | Toast spam on multiple errors | Deduplicate error toasts | Error handler | Manual |
| P5-UX-07 | 🟡 | User edits resume on review (if re-run enabled) | Invalidate tailor; partial re-run | Optional feature | Manual |
| P5-UX-08 | 🟡 | Keyboard-only navigation | Focus order on form and export | a11y pass | Manual |

---

## SSE streaming (optional)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-SSE-01 | 🟡 | Client disconnects mid-stream | Server stops LLM calls if possible | SSE route | Manual |
| P5-SSE-02 | 🟡 | Proxy buffers SSE (nginx) | Document headers `X-Accel-Buffering: no` | Deploy docs | Production |
| P5-SSE-03 | 🟡 | Out-of-order events | Client applies monotonic step guard | Client | Unit |

---

## Caching (optional)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-CAC-01 | 🟡 | Same resume+JD hash | Return cached `TailoringRun` | Cache layer | Integration |
| P5-CAC-02 | 🟡 | Resume whitespace change | Different hash — cache miss | `hash.ts` normalize | Unit |
| P5-CAC-03 | 🟡 | Stale cache after prompt change | Version cache key with prompt version | Cache | Unit |

---

## Security and rate limiting

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-SEC-01 | 🔴 | Abuse: 100 analyze requests/min | Rate limit 10/hour/IP; `429 RATE_LIMITED` | Middleware | Integration |
| P5-SEC-02 | 🟡 | Shared NAT IP (office/campus) | Document limitation; optional API key for demo | README | — |
| P5-SEC-03 | 🔴 | `GROQ_API_KEY` in client bundle | Verify production build | Build audit | CI script |
| P5-SEC-04 | 🟡 | XSS in pasted resume rendered as HTML | Render as text only; never `dangerouslySetInnerHTML` | Components | Code review |
| P5-SEC-05 | 🟡 | CSRF on API routes | Same-origin fetch; SameSite cookies if added | Next.js defaults | Manual |
| P5-SEC-06 | 🟡 | Security headers missing | `X-Frame-Options`, `X-Content-Type-Options` | `next.config.js` | Security scan |
| P5-SEC-07 | 🔴 | Uploaded file executed on server | Parse only; never shell out to file | Ingestion | Code review |
| P5-SEC-08 | 🟡 | Log injection via resume newline | Sanitize log fields | Logger | Unit |

---

## Deployment (Vercel / production)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-DEP-01 | 🔴 | Env vars not set in Vercel | Build succeeds but API 500 — document required vars | README, deploy checklist | Smoke test |
| P5-DEP-02 | 🟡 | Serverless timeout during tailor-run | Pro plan or optimize; show timeout message | Vercel config | Production |
| P5-DEP-03 | 🟡 | Serverless timeout during PDF gen | Increase timeout or edge vs node runtime | Config | Production |
| P5-DEP-04 | 🟡 | Cold start + 90s analyze | First request slow; loading copy | UX | Manual |
| P5-DEP-05 | 🟡 | `GROQ_API_KEY` quota exceeded | User message; log error code | LLM client | Manual |
| P5-DEP-06 | 🟢 | Wrong region latency | Document optional region pinning | README | — |
| P5-DEP-07 | 🟡 | Preview deployment exposes app publicly | OK for portfolio; rate limit still apply | Vercel | — |

---

## E2E testing (Playwright)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-E2E-01 | 🟡 | CI has no `GROQ_API_KEY` | Mock `/api/tailor-run` in E2E | Playwright route | CI |
| P5-E2E-02 | 🟡 | Flaky analyze timeout | Increase test timeout; mock API | Playwright config | CI |
| P5-E2E-03 | 🟡 | Download PDF in headless | Verify download event or API response size > 0 | Playwright | CI |
| P5-E2E-04 | 🟡 | sessionStorage cleared between steps | Seed state in test | Playwright | CI |
| P5-E2E-05 | 🟢 | Visual regression on review page | Optional snapshot | Playwright | Optional |

---

## Demo and documentation

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-DEM-01 | 🟡 | Demo JD removed from web | Fixtures still work offline | `fixtures/` | Demo rehearsal |
| P5-DEM-02 | 🟡 | Demo takes > 2 minutes | Pre-warm cache or mock mode for live demo | `DEMO.md` | Rehearsal |
| P5-DEM-03 | 🟡 | Portfolio reviewer uses mobile | Core flow works mobile | Responsive | Manual |
| P5-DEM-04 | 🟢 | Sample resume doesn't match sample JD well | Update fixtures for compelling score delta | Fixtures | Manual |

---

## FastAPI fallback (if Node parsing fails)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P5-FA-01 | 🟡 | FastAPI service down | Fallback to paste text path | Orchestrator | Integration |
| P5-FA-02 | 🟡 | Schema mismatch Node ↔ Python | Shared JSON schema contract | Both services | Contract test |

---

## Post-MVP edge cases (document only — do not block Phase 5)

| ID | Scenario | Note |
|---|---|---|
| P5-FUT-01 | User expects cover letter | Out of MVP scope |
| P5-FUT-02 | URL job posting scrape | Phase 5+ enhancement |
| P5-FUT-03 | Multi-user accounts | Requires DB auth |
| P5-FUT-04 | Perfect ATS layout match | Non-goal per problem statement |

---

## Related documents

- Previous: [phase-4-edge-cases.md](./phase-4-edge-cases.md)
- [implementation-plan.md](../implementation-plan.md#phase-5-polish-and-deploy)
- [problemstatement.md](../problemstatement.md) Section 17 — Risks and Edge Cases
