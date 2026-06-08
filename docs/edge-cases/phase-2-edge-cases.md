# Phase 2 Edge Cases — LLM Integration

**Phase goal:** Real parsing, scoring, tailoring, gaps via `/api/tailor-run`.  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-2-llm-integration)

---

## Quick checklist before leaving Phase 2

- [ ] Empty/whitespace-only input returns `400 INVALID_INPUT`
- [ ] LLM timeout retries then returns structured error (not hang)
- [ ] Invalid LLM JSON triggers repair then fails visibly
- [ ] Partial pipeline failure returns `TailoringRun` with `status: 'failed'` + preserved artifacts
- [ ] API key never in client bundle or logs
- [ ] Tailored score computed from rebuilt resume, not copied from mock
- [ ] Resume with no bullets completes without crash (empty tailor output)

---

## API input validation

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-API-01 | 🔴 | Missing `resumeText` or `jdText` in body | `400` `{ code: 'INVALID_INPUT' }` | `/api/tailor-run` | Integration |
| P2-API-02 | 🔴 | Body not JSON / malformed JSON | `400` clear error | All API routes | Integration |
| P2-API-03 | 🟡 | Text only whitespace/newlines | `400` "Content required" | Input validator | Unit |
| P2-API-04 | 🟡 | Resume or JD < 100 characters | `400` with min length message | Shared validator | Unit |
| P2-API-05 | 🔴 | Resume or JD > `MAX_*_CHARS` | `400` or truncate with warning — document choice | `llm/client.ts` truncation | Unit |
| P2-API-06 | 🟡 | Wrong HTTP method (GET on POST route) | `405` | Route handlers | Integration |
| P2-API-07 | 🟡 | Extremely large JSON body (DoS) | Reject at size limit before parse | Next.js config / middleware | Integration |
| P2-API-08 | 🟢 | Extra unknown fields in request | Ignore or strip | Route Zod input schema | Unit |

---

## LLM client (`llm/client.ts`, `llm/structured-output.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-LLM-01 | 🔴 | `OPENAI_API_KEY` missing at runtime | `500` `{ code: 'CONFIG_ERROR' }`; no stack trace to client | API routes | Integration without key |
| P2-LLM-02 | 🔴 | OpenAI 429 rate limit | Retry 2x exponential backoff; then user-friendly error | `llm/client.ts` | MSW mock 429 |
| P2-LLM-03 | 🔴 | OpenAI 500 / network timeout | Retry; then `{ code: 'LLM_UNAVAILABLE' }` | `llm/client.ts` | MSW |
| P2-LLM-04 | 🔴 | Response truncated mid-JSON | Zod fail → repair prompt → fail with error | `structured-output.ts` | Mock truncated JSON |
| P2-LLM-05 | 🟡 | LLM wraps JSON in markdown code fences | Strip fences before `JSON.parse` | `structured-output.ts` | Unit |
| P2-LLM-06 | 🟡 | LLM returns array instead of object | Validation fails; repair or error | `structured-output.ts` | MSW |
| P2-LLM-07 | 🟡 | Empty LLM content string | Treat as failure; retry once | `llm/client.ts` | MSW |
| P2-LLM-08 | 🟡 | Model returns valid JSON wrong shape | Zod error paths sent to repair prompt | `structured-output.ts` | Integration |
| P2-LLM-09 | 🟡 | Token limit hit on long resume | Section-aware truncation; log warning count | Truncation helper | Unit with 40k chars |
| P2-LLM-10 | 🟢 | Wrong model name in env | Fail fast with config error | `llm/client.ts` | Manual |
| P2-LLM-11 | 🔴 | API key leaked in error response | Sanitize errors; never echo env | Error middleware | Inspect response body |
| P2-LLM-12 | 🟡 | Concurrent requests exhaust rate limit | Serialize or queue bullet batches | `tailoring-engine.ts` | Load test optional |

---

## Resume parsing (`services/resume-parser.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-RPAR-01 | 🟡 | Non-standard section headers ("Work History", "Employment") | Heuristic + LLM still extract experience | Heuristic pass | Fixture variants |
| P2-RPAR-02 | 🟡 | Resume with no clear sections (wall of text) | LLM extraction; may be low quality — preserve `rawText` | Parser | Manual |
| P2-RPAR-03 | 🟡 | Multiple jobs same company | Separate entries or merged — document LLM behavior | Parser prompt | Manual |
| P2-RPAR-04 | 🟡 | Dates as "Present", "Current", "2020–" | Parse as optional strings; no date validation strictness | Schema | Unit |
| P2-RPAR-05 | 🟡 | Academic CV (long publications) | Truncate for LLM; warn if truncated | Truncation | Manual |
| P2-RPAR-06 | 🟡 | Skills inline in bullets vs dedicated section | Merge into `skills[]` where possible | Parser prompt | Manual |
| P2-RPAR-07 | 🔴 | LLM invents employer not in text | Prompt forbids; post-validate company names ⊆ rawText tokens | Truthfulness Phase 4 | Spot check |
| P2-RPAR-08 | 🟡 | Contact info missing | Empty `contact` object; UI handles | Schema defaults | Unit |
| P2-RPAR-09 | 🟡 | LinkedIn/GitHub URLs broken across lines | Preserve in `links[]` best effort | Parser | Manual |
| P2-RPAR-10 | 🟢 | Resume in non-English language | Best effort parse; scores may degrade — no crash | Parser | Manual optional |

---

## JD parsing (`services/jd-parser.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-JPAR-01 | 🟡 | Vague JD ("rockstar ninja") | Extract weak signals; `seniorityLevel: unknown` | JD parser + fallback | Fixture |
| P2-JPAR-02 | 🟡 | JD is mostly legal/EEO boilerplate | LLM filters; skills list may be empty | JD prompt | Manual |
| P2-JPAR-03 | 🟡 | Duplicate skills different casing ("Python", "python") | Dedupe case-insensitive post-process | `jd-parser.ts` | Unit |
| P2-JPAR-04 | 🟡 | No company name in pasted text | `company` optional / undefined | Schema | Unit |
| P2-JPAR-05 | 🟡 | JD lists 50+ required skills | Cap display; store all or top N — document | Parser post-process | Manual |
| P2-JPAR-06 | 🟡 | "Required" vs "Preferred" not labeled clearly | LLM may misclassify — gap engine compensates | Prompt tuning | Manual |
| P2-JPAR-07 | 🟢 | JD paste includes HTML from website | Strip tags in ingestion | `document-ingestion.ts` | Unit |
| P2-JPAR-08 | 🟡 | Same keyword in skills and responsibilities | Dedupe in `keywords[]` | Post-process | Unit |

---

## Match engine (`services/match-engine.ts`, `lib/scoring.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-MAT-01 | 🟡 | Tailored score lower than original | Allowed — display both honestly | UI `ScoreCard` | Integration |
| P2-MAT-02 | 🟡 | LLM scoring fails after retries | Fall back to deterministic score + generic explanation (Phase 4 full) | `match-engine.ts` | MSW fail |
| P2-MAT-03 | 🟡 | All required skills missing | Low score; `criticalMissingRequirements` populated | Scoring | Unit |
| P2-MAT-04 | 🟡 | Synonym mismatch (K8s vs Kubernetes) | Partial credit with fuzzy map (optional) | `scoring.ts` | Unit |
| P2-MAT-05 | 🔴 | Score implies false precision (e.g. 73.842) | Integer scores only in schema | `MatchScoreSchema` | Unit |
| P2-MAT-06 | 🟡 | Empty explanation string | Reject LLM output or inject default | Schema `.min(1)` on explanation | Unit |
| P2-MAT-07 | 🟡 | Seniority mismatch (entry resume, staff JD) | Low `seniorityScore`; mention in explanation | Scoring | Manual |
| P2-MAT-08 | 🟡 | Re-score tailored resume built incorrectly | Rebuild profile from `tailored` bullets only | `/api/tailor-run` step 6 | Integration |

---

## Tailoring engine (`services/tailoring-engine.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-TAI-01 | 🔴 | LLM adds technology not in original bullet | Prompt constraint; Phase 4 reverts — log in Phase 2 | Prompt + later guard | Manual review |
| P2-TAI-02 | 🔴 | LLM adds metrics (" increased 40%") | Prompt forbids; flag in Phase 4 | Prompt | Manual |
| P2-TAI-03 | 🟡 | Bullet already well-aligned | May return minimal change; `original === tailored` OK | Engine | Unit |
| P2-TAI-04 | 🟡 | Zero rewrite candidates | Return original bullets as `tailored` with high confidence | Engine | Empty overlap case |
| P2-TAI-05 | 🟡 | 40+ bullets — long latency | Batch 5–8; show progress Phase 5 | Batching | Timing |
| P2-TAI-06 | 🟡 | One bullet in batch fails validation | Retry bullet individually or skip with original | Engine | MSW |
| P2-TAI-07 | 🟡 | Skills reorder adds new skill | Only reorder existing; validate against resume text | Engine | Unit Phase 4 |
| P2-TAI-08 | 🟡 | Summary rewrite unsupported by bullets | Omit summary change or low confidence | Prompt | Manual |
| P2-TAI-09 | 🟢 | Project bullets ignored | Document MVP focus on experience; projects optional | Engine scope | Manual |
| P2-TAI-10 | 🟡 | `changeReason` empty | Schema reject | `BulletRewriteSchema` | Unit |

---

## Gap engine (`services/gap-engine.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-GAP-01 | 🟡 | LLM flags gap already in resume (synonym) | Deterministic verify clears false gap | Gap service | Unit |
| P2-GAP-02 | 🟡 | No gaps found | Return `{ gaps: [] }`; UI empty state | Engine | Integration |
| P2-GAP-03 | 🟡 | LLM sets `canSafelyAdd: true` | Override to `false` in Phase 4; allow in Phase 2 but fix before export | Gap service | Unit Phase 4 |
| P2-GAP-04 | 🟡 | Weakly represented vs missing | `resumeEvidence` partial quote vs empty | Prompt + verify | Manual |
| P2-GAP-05 | 🟡 | JD requirement is soft skill ("communication") | Category `skill`; subjective gap OK | Schema | Manual |
| P2-GAP-06 | 🟢 | Duplicate gap names | Dedupe by normalized name | Post-process | Unit |

---

## Pipeline orchestration (`/api/tailor-run`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-PIPE-01 | 🔴 | Resume parse succeeds, JD parse fails | `status: 'failed'`; include error; no orphan data | Orchestrator | MSW partial fail |
| P2-PIPE-02 | 🔴 | Scoring succeeds, tailoring fails | Return partial `TailoringRun` with original score + gaps | Orchestrator | MSW |
| P2-PIPE-03 | 🟡 | Client aborts fetch mid-request | Server completes or cancels — accept waste for MVP | — | Manual |
| P2-PIPE-04 | 🟡 | Duplicate analyze clicks | Idempotent new run ID each time; disable button client-side | UI + API | Manual |
| P2-PIPE-05 | 🟡 | `runId` collision | Use UUID or hash + timestamp | `lib/hash.ts` | Unit |
| P2-PIPE-06 | 🟡 | Parallel parse one throws | Fail fast or return first error | `Promise.all` handling | Integration |

---

## Frontend integration (Phase 2)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-FE-01 | 🔴 | 90s pipeline — user thinks app frozen | Loading skeleton + message "May take up to 2 minutes" | `/analyze` | Manual |
| P2-FE-02 | 🟡 | API returns 500 | Alert + retry; preserve input text | Error banner | Manual |
| P2-FE-03 | 🟡 | Network offline | Catch fetch error; friendly message | `/input` handler | Manual |
| P2-FE-04 | 🟡 | `tailoringRun` too large for sessionStorage | Catch quota error; suggest shorter resume | Store | Manual |
| P2-FE-05 | 🟡 | User navigates away during analyze | Optional abort controller Phase 5 | fetch | Manual |
| P2-FE-06 | 🟢 | Scores render before gaps in slow response | Single response — all render together | API design | — |

---

## Logging and security

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-LOG-01 | 🔴 | Full resume logged on error | Log hashes + runId only | All services | Code review |
| P2-LOG-02 | 🟡 | LLM raw response logged in production | Dev only or redacted | `structured-output.ts` | Env check |
| P2-SEC-01 | 🔴 | Client calls OpenAI directly | All LLM calls server-side only | Architecture | Network tab audit |

---

## Document ingestion (Phase 2: text only)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P2-DOC-01 | 🟡 | CRLF vs LF in pasted text | Normalize to `\n` | `document-ingestion.ts` | Unit |
| P2-DOC-02 | 🟡 | Null bytes in paste | Strip or reject | Ingestion | Unit |
| P2-DOC-03 | 🟢 | Tab-separated columns in paste | May parse as single lines — PDF upload Phase 5 | — | Manual |

---

## Related documents

- Previous: [phase-1-edge-cases.md](./phase-1-edge-cases.md)
- Next: [phase-3-edge-cases.md](./phase-3-edge-cases.md)
- Architecture risks: [architecture.md](../architecture.md#20-risks-and-mitigations)
