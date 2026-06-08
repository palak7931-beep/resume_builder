# Phase 3 Edge Cases — PDF Export

**Phase goal:** Tailored resume PDF + side-by-side comparison PDF (proof artifact).  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-3-pdf-export)

---

## Quick checklist before leaving Phase 3

- [ ] Export blocked without disclaimer checkbox
- [ ] Comparison PDF always includes disclaimer + both scores
- [ ] Filename safe for OS (no `/`, `:`, etc.)
- [ ] Empty sections omitted gracefully in tailored PDF
- [ ] Large gap list does not crash PDF render
- [ ] Invalid `tailoringRun` in export body returns `400`

---

## Export API (`POST /api/export/pdf`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-API-01 | 🔴 | Missing `tailoringRun` in body | `400 INVALID_INPUT` | Export route | Integration |
| P3-API-02 | 🔴 | Invalid `tailoringRun` (schema fail) | `400` with validation details (dev) / generic (prod) | `TailoringRunSchema` | Unit |
| P3-API-03 | 🟡 | `type` not `'tailored'` or `'comparison'` | `400` | Export route | Integration |
| P3-API-04 | 🟡 | `status: 'failed'` run exported | Block or warn — document: block comparison if incomplete | Export route | Integration |
| P3-API-05 | 🟡 | Missing `tailoredResume` on tailored export | `400` "Tailoring incomplete" | Export route | Integration |
| P3-API-06 | 🔴 | PDF generation throws | `500` `{ code: 'PDF_GENERATION_FAILED' }` | `pdf-generator.ts` | Mock throw |
| P3-API-07 | 🟡 | Client sends tampered scores in body | Regenerate PDF from provided run as-is; scores are display-only | Document trust model | Manual |
| P3-API-08 | 🟢 | Double export click | Idempotent download; disable button while loading | UI | Manual |

---

## Filename and headers

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-FN-01 | 🟡 | Job title `"Senior / Staff Engineer (Remote)"` | Sanitize to filesystem-safe slug | Export route | Unit |
| P3-FN-02 | 🟡 | Unicode job title (Japanese, emoji) | ASCII slug or encode; no crash | Slug helper | Unit |
| P3-FN-03 | 🟡 | Missing `jobTitle` | Fallback filename `resume-shapeshifter-comparison.pdf` | Export route | Unit |
| P3-FN-04 | 🟡 | Very long job title (200 chars) | Truncate slug to ~50 chars | Slug helper | Unit |
| P3-FN-05 | 🟢 | `Content-Disposition` filename encoding | RFC 5987 `filename*` for unicode optional | Headers | Manual |

---

## Tailored resume PDF (`templates/tailored-resume-pdf.tsx`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-TPL-01 | 🟡 | No summary section | Omit summary block | Template | Unit render |
| P3-TPL-02 | 🟡 | Empty skills array | Omit skills section | Template | Unit |
| P3-TPL-03 | 🟡 | No education / certifications | Omit empty sections | Template | Unit |
| P3-TPL-04 | 🟡 | Bullet contains `&`, `<`, special chars | Escape properly in React PDF Text | Template | Unit |
| P3-TPL-05 | 🟡 | Very long bullet wraps poorly | Word wrap; max width set | Template | Visual |
| P3-TPL-06 | 🟡 | 10+ page resume | Multi-page break; no clipped text | Template | Manual |
| P3-TPL-07 | 🟢 | Missing contact fields | Render available only; no "undefined" | Template | Unit |
| P3-TPL-08 | 🟡 | Project section empty but experience full | Render experience only | Template | Unit |
| P3-TPL-09 | 🟡 | Uses `original` bullet by mistake | Only `tailored` strings in output | Code review | Snapshot |

---

## Comparison PDF (`templates/comparison-pdf.tsx`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-CMP-01 | 🔴 | Disclaimer missing | Always render fixed footer text | Template | Automated string check |
| P3-CMP-02 | 🔴 | Only one score shown | Header shows `original → tailored` | Template | Visual |
| P3-CMP-03 | 🟡 | No bullets changed | Columns identical; optional note "No bullet changes" | Template | Manual |
| P3-CMP-04 | 🟡 | Changed bullet index mismatch | `getChangedBulletIndices` uses stable key (company+index) | `pdf-generator.ts` | Unit |
| P3-CMP-05 | 🟡 | More tailored bullets than original | Should not happen — validate equal count | Pre-render assert | Unit |
| P3-CMP-06 | 🟡 | Highlight colors not visible in B&W print | Use border or bold in addition to background | Template | Print preview |
| P3-CMP-07 | 🟡 | 30+ gaps — table overflow | Paginate gap table; smaller font | Template | Manual |
| P3-CMP-08 | 🟡 | Long `jdEvidence` in gap table | Truncate with ellipsis in PDF | Template | Visual |
| P3-CMP-09 | 🟡 | Missing `gapAnalysis` | Omit gap section or show "Not available" | Template | Unit |
| P3-CMP-10 | 🟡 | Missing `company` in header | Show job title only | Template | Unit |
| P3-CMP-11 | 🟢 | `changeReason` per bullet in PDF | Appendix or footnote — optional MVP | Template | Manual |
| P3-CMP-12 | 🟡 | Two-column layout too narrow on A4 | Adjust font 9–10pt; reduce padding | Template | Visual |

---

## PDF generator service (`services/pdf-generator.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-GEN-01 | 🟡 | `@react-pdf/renderer` font not registered | Register standard fonts at init | Generator setup | Smoke test |
| P3-GEN-02 | 🟡 | Render returns empty buffer | Throw `PDF_GENERATION_FAILED` | Service | Mock |
| P3-GEN-03 | 🟡 | Memory spike on large document | Stream or chunk; limit gap rows | Service | Manual |
| P3-GEN-04 | 🟢 | Serverless function timeout (Vercel 10s) | Optimize render; increase timeout plan Phase 5 | Deploy config | Production test |

---

## Frontend export page

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-FE-01 | 🔴 | Download without checkbox | Buttons disabled until checked | `/export` | E2E |
| P3-FE-02 | 🟡 | Blob download blocked by browser | Use `URL.createObjectURL` + anchor click | `PDFExportButton` | Manual |
| P3-FE-03 | 🟡 | Safari iOS download behavior | Open in new tab or share sheet fallback | UI note | Manual mobile |
| P3-FE-04 | 🟡 | Loading spinner stuck on error | Reset loading state in `finally` | Export handler | Manual |
| P3-FE-05 | 🟡 | `tailoringRun` missing on export page | Redirect `/input` | Route guard | Manual |
| P3-FE-06 | 🟢 | User checks box then unchecks | Disable download again | Checkbox state | Manual |

---

## React PDF / platform quirks

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-RPDF-01 | 🟡 | Flexbox differences vs browser | Test layout in React PDF preview | Template | Visual |
| P3-RPDF-02 | 🟡 | Emoji in resume bullets | May not render — strip or replace | Template optional | Manual |
| P3-RPDF-03 | 🟡 | Hyperlinks in contact | Render as plain text for ATS PDF | Template | Visual |

---

## Playwright fallback (if used)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P3-PW-01 | 🟡 | Headless Chrome missing in CI | Document install; skip PDF E2E in CI or use React PDF only | CI config | Pipeline |
| P3-PW-02 | 🟡 | HTML template CSS not applied in PDF | Inline critical CSS | HTML template | Visual |

---

## Related documents

- Previous: [phase-2-edge-cases.md](./phase-2-edge-cases.md)
- Next: [phase-4-edge-cases.md](./phase-4-edge-cases.md)
- Architecture: [architecture.md](../architecture.md#12-pdf-generation-architecture)
