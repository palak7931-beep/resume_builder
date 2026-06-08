# Edge Cases — Phase Index

Reference these documents while implementing each phase of [implementation-plan.md](../implementation-plan.md). Each file lists scenarios, expected behavior, where to handle them in code, and suggested tests.

| Phase | Document | When to use |
|---|---|---|
| **0** | [phase-0-edge-cases.md](./phase-0-edge-cases.md) | Project setup, tooling, folder skeleton |
| **1** | [phase-1-edge-cases.md](./phase-1-edge-cases.md) | Schemas, mock UI, client state, routing |
| **2** | [phase-2-edge-cases.md](./phase-2-edge-cases.md) | LLM pipeline, API routes, parsing, scoring |
| **3** | [phase-3-edge-cases.md](./phase-3-edge-cases.md) | PDF generation and export |
| **4** | [phase-4-edge-cases.md](./phase-4-edge-cases.md) | Truthfulness guardrails, review gates |
| **5** | [phase-5-edge-cases.md](./phase-5-edge-cases.md) | Uploads, deploy, production, E2E |

## How to read each edge case

Every entry uses this format:

| Field | Meaning |
|---|---|
| **ID** | Stable reference (e.g. `P2-LLM-03`) |
| **Scenario** | What can go wrong or vary |
| **Expected behavior** | What the system should do |
| **Handle in** | File, module, or layer |
| **Test** | Unit, integration, manual, or E2E |

## Severity legend

| Tag | Meaning |
|---|---|
| 🔴 **Critical** | Data loss, security, fabrication risk, or broken core flow |
| 🟡 **Important** | Degraded UX or incorrect output that misleads user |
| 🟢 **Minor** | Cosmetic, rare, or easy workaround |

## Cross-phase edge cases

Some issues span phases — handle them where they first appear, then re-verify:

- **Session storage limits** — Phase 1 (store), Phase 2 (large `TailoringRun`), Phase 3 (export payload)
- **Empty or minimal resume/JD** — Phase 1 (validation), Phase 2 (API), Phase 5 (upload)
- **Score precision / false confidence** — Phase 2 (scoring), Phase 4 (disclaimers)
- **Truthfulness** — Phase 2 (prompts), Phase 4 (deterministic checks)

---

*Derived from [architecture.md](../architecture.md), [implementation-plan.md](../implementation-plan.md), and [problemstatement.md](../problemstatement.md)*
