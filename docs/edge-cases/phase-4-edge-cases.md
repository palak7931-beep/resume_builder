# Phase 4 Edge Cases — Validation and Guardrails

**Phase goal:** Truthfulness checks, schema repair, review gates, export blocking for risky content.  
**Reference:** [implementation-plan.md](../implementation-plan.md#phase-4-validation-and-guardrails)

---

## Quick checklist before leaving Phase 4

- [ ] New technology in tailored bullet triggers `riskFlag` or revert
- [ ] New numeric metric in tailored bullet flagged or reverted
- [ ] All gaps have `canSafelyAdd: false` in API responses
- [ ] Export blocked until low-confidence / risk bullets confirmed
- [ ] LLM JSON repair attempted twice before fallback/error
- [ ] Match score fallback works when LLM scoring fails
- [ ] Disclaimer text identical on export page and comparison PDF

---

## Truthfulness module (`lib/truthfulness.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-TRU-01 | 🔴 | Tailored adds "Kubernetes" not in original or skills | `detectUnsupportedClaims` returns flag; revert or risk | `truthfulness.ts` | Unit |
| P4-TRU-02 | 🔴 | Tailored adds "40% improvement" — number not in original | Flag metric inflation | `truthfulness.ts` | Unit |
| P4-TRU-03 | 🟡 | Same number preserved ("10 users" → "10 users") | No false positive | `truthfulness.ts` | Unit |
| P4-TRU-04 | 🟡 | Synonym tech ("JS" in resume, "JavaScript" in tailored) | Allow if in `resume.skills` or rawText | `truthfulness.ts` | Unit |
| P4-TRU-05 | 🟡 | Case change only ("api" → "API") | No flag | `truthfulness.ts` | Unit |
| P4-TRU-06 | 🟡 | Seniority inflation "intern" → "led engineering org" | Flag seniority pattern | `truthfulness.ts` | Unit |
| P4-TRU-07 | 🟡 | "Expert" or "deep expertise" added without support | Flag via keyword list | `truthfulness.ts` | Unit |
| P4-TRU-08 | 🟡 | Team size added ("team of 5") not in original | Flag new number + leadership pattern | `truthfulness.ts` | Unit |
| P4-TRU-09 | 🟡 | Technology in parentheses added `(AWS)` | Check against resume evidence | `truthfulness.ts` | Unit |
| P4-TRU-10 | 🟡 | Skill reorder adds skill from projects only | Allow if token in full `rawText` | `verifySkillReorder` | Unit |
| P4-TRU-11 | 🔴 | Skill reorder adds entirely new skill | Reject reorder; restore original order | Tailoring pipeline | Unit |
| P4-TRU-12 | 🟢 | Punctuation-only bullet change | No flag | `truthfulness.ts` | Unit |
| P4-TRU-13 | 🟡 | Acronym expansion truthful ("ML" → "machine learning") | Allow if expansion appears elsewhere in resume | Heuristic | Unit |
| P4-TRU-14 | 🟡 | Multiple issues on one bullet | Return all flags; highest severity wins revert | Pipeline | Unit |

---

## Tailoring pipeline integration

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-TAIL-01 | 🔴 | High-severity claim detected | Revert to `original`; set `riskFlag: 'Reverted — unsupported claim detected'` | `tailoring-engine.ts` | Integration |
| P4-TAIL-02 | 🟡 | Medium-severity claim | Keep tailored; `confidence: low`; `riskFlag` set | Pipeline | Integration |
| P4-TAIL-03 | 🟡 | LLM sets `confidence: high` but detector flags | Detector overrides to low + risk | Pipeline | Unit |
| P4-TAIL-04 | 🟡 | Reverted bullet still counted in tailored score | Re-score uses original text for that bullet | `/api/tailor-run` | Integration |
| P4-TAIL-05 | 🟡 | All bullets reverted | Tailored score ≈ original; UI explains | UI message | Manual |
| P4-TAIL-06 | 🟡 | Batch rewrite partially fails validation | Individual bullet fallback to original | Engine | MSW |

---

## Schema repair (`llm/structured-output.ts`)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-SCH-01 | 🟡 | First repair succeeds | Return valid object; log 1 repair | `structured-output.ts` | MSW |
| P4-SCH-02 | 🟡 | Two repairs fail | Throw `LLM_VALIDATION_FAILED` | `structured-output.ts` | MSW |
| P4-SCH-03 | 🟡 | Repair introduces invalid data | Second validation catches | Zod | Integration |
| P4-SCH-04 | 🟡 | Score field string `"72"` instead of number | Zod coerce or repair | Schema `.coerce.number()` | Unit |
| P4-SCH-05 | 🟢 | Nested Zod path errors | Include path in repair prompt | Repair builder | Unit |

---

## Match engine fallback

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-MAT-01 | 🟡 | LLM explanation empty after repair | Use template: "Score based on skill and keyword overlap." | `match-engine.ts` | MSW |
| P4-MAT-02 | 🟡 | LLM score wildly differs from deterministic | Blend or prefer deterministic for sub-scores | Document weighting | Unit |
| P4-MAT-03 | 🟡 | User sees false precision | Round all displayed scores to integers | UI + schema | Manual |

---

## Gap engine hardening

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-GAP-01 | 🔴 | LLM returns `canSafelyAdd: true` | Force `false` at service layer | `gap-engine.ts` | Unit |
| P4-GAP-02 | 🟡 | Gap "Python" but resume has "python" in bullet | Clear gap or mark weak with evidence quote | Text search | Unit |
| P4-GAP-03 | 🟡 | Gap "communication skills" subjective | Keep with low/medium importance | — | Manual |
| P4-GAP-04 | 🟡 | False gap due to abbreviation | Synonym map optional (K8s/Kubernetes) | Gap verify | Unit |
| P4-GAP-05 | 🟡 | `suggestedAction` empty | Schema reject or default action | `ResumeGapSchema` | Unit |
| P4-GAP-06 | 🟡 | Gap name duplicates | Dedupe by normalized key | Post-process | Unit |

---

## UI review gates

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-UI-01 | 🔴 | Export with unconfirmed low-confidence bullet | Block download; list pending bullets | `/export` | E2E |
| P4-UI-02 | 🔴 | Export with unconfirmed `riskFlag` bullet | Same as P4-UI-01 | `/export` | E2E |
| P4-UI-03 | 🟡 | User confirms then toggles off | Export blocked again | Review state | Manual |
| P4-UI-04 | 🟡 | High confidence, no risk — no toggle needed | Export allowed with disclaimer only | `/review` | Manual |
| P4-UI-05 | 🟡 | 10 risky bullets — UX overwhelm | Banner with count + scroll to first unconfirmed | `/review` | Manual |
| P4-UI-06 | 🟡 | `userConfirmed` not persisted on refresh | Restore from sessionStorage or re-require confirm | Store | Manual |
| P4-UI-07 | 🟡 | User edits tailored text manually (if allowed) | Out of MVP scope — disable inline edit or re-run | Document | — |
| P4-UI-08 | 🟢 | Reverted bullets shown in review | Show original in both columns + revert badge | `SideBySideDiff` | Manual |

---

## Disclaimer enforcement

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-DIS-01 | 🔴 | Mismatch disclaimer web vs PDF | Single source constant `DISCLAIMER_TEXT` | `lib/constants.ts` | Unit string equal |
| P4-DIS-02 | 🟡 | User checks disclaimer without reading | Still required — legal UX pattern | Checkbox | Product |
| P4-DIS-03 | 🟡 | PDF regenerated without disclaimer after template edit | Snapshot test includes disclaimer | PDF test | Automated |

---

## Critical automated tests (architecture Section 18)

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-TST-01 | 🔴 | Tech absent from resume appears in tailored | Test fails build | Integration test | CI |
| P4-TST-02 | 🟡 | Remove required skill from resume text | Score decreases | `scoring.test.ts` | CI |
| P4-TST-03 | 🟡 | Gap with no resume evidence | `resumeEvidence === ''` | Gap test | CI |
| P4-TST-04 | 🔴 | Invalid LLM JSON | Repair then error — no partial UI state | MSW test | CI |

---

## Ethical / product edge cases

| ID | Severity | Scenario | Expected behavior | Handle in | Test |
|---|---|---|---|---|---|
| P4-PRD-01 | 🔴 | User expects guaranteed ATS pass | Disclaimer: no ATS guarantee | Copy on landing/export | Manual |
| P4-PRD-02 | 🔴 | User exports without reviewing | Checkbox + risky bullet gates | Export flow | E2E |
| P4-PRD-03 | 🟡 | Tailored score much higher but gaps remain | Show gaps prominently; score is not promise | UI layout | Manual |
| P4-PRD-04 | 🟡 | User asks system to add fake job | Prompt refuses; gap suggests "add if true" only | Prompts | Manual red team |

---

## Related documents

- Previous: [phase-3-edge-cases.md](./phase-3-edge-cases.md)
- Next: [phase-5-edge-cases.md](./phase-5-edge-cases.md)
- Architecture: [architecture.md](../architecture.md#13-truthfulness-and-guardrails)
