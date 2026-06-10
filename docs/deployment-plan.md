# Deployment Plan — Resume Builder Project

This document outlines a repeatable deployment plan for the Next.js resume-builder project using Vercel. It includes prerequisites, recommended Vercel settings, environment variables, deployment steps (UI and CLI), and troubleshooting notes tailored to this repo.

## Overview
- Target platform: Vercel (Next.js optimized hosting). 
- Build command: `npm run build` (project already includes this). 
- Node engine: `>=20` (ensure Vercel uses Node 20 in Project Settings or via `package.json` `engines`).

## Prerequisites
- Git repository hosted on GitHub/GitLab/Bitbucket.
- Vercel account with access to the chosen Git provider.
- Project-level secrets and API keys (LLM, GROQ, any DB) available to add in Vercel.
- Review server-side parsing libraries: `pdf-parse` and `mammoth` are used via dynamic imports in `services/document-ingestion.ts` so they run in server functions.

## Recommended Environment Variables
Create these in Vercel > Project > Settings > Environment Variables (replace placeholder names with real keys):
- `OPENAI_API_KEY` or other LLM key used in `llm/client.ts`
- `GROQ_API_KEY` and `GROQ_DATASET` (if using `groq-sdk`)
- `NEXT_DISABLE_FONT_DOWNLOAD` = `1` (optional; set to `1` if you want to avoid runtime Google Fonts fetch issues)
- Any database connection strings or third-party secrets used by services in `services/` or `lib/`

Note: Do not commit `.env` files to source control. Use Vercel environment settings for secrets.

## Vercel Settings and `vercel.json` (optional)
You can rely on Vercel auto-detection for Next.js, but add a `vercel.json` to tune server functions:

Example `vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "next.config.*", "use": "@vercel/next" }],
  "functions": {
    "app/api/**": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

- Increase `memory` and `maxDuration` for API routes that may parse files.
- Static pages under `app/` will still be optimized by Vercel.

## File Upload Considerations
- Vercel Serverless Function payload limit is small (~4–5MB). If you expect larger resume/PDF/DOCX uploads, implement direct-to-cloud-storage uploads (S3, Azure Blob, etc.) from the client and send an object reference to your API.
- For this repo, the server-side `app/api/parse/resume/route.ts` currently accepts uploads; verify request size and add a client-side flow if needed.

## Deploy via Vercel Dashboard (recommended for first deploy)
1. Push code to Git and open Vercel dashboard → New Project → Import Git repository. 
2. Vercel detects Next.js; confirm build command `npm run build` and output directory is managed by Next.
3. Add Environment Variables in Project Settings before the first deployment.
4. Deploy and monitor the logs for any build-time errors (fonts, packages).

## Deploy via Vercel CLI
1. Install CLI: `npm i -g vercel`
2. Login: `vercel login`
3. From project root, run:

```bash
vercel --prod
```

4. Use `vercel env` to add environment variables from CLI if desired:

```bash
vercel env add NEXT_DISABLE_FONT_DOWNLOAD production
```

## Post-deploy Validation Checklist
- Confirm server routes `/api/parse/resume` and `/api/tailor-run` return expected responses.
- Test resume upload end-to-end with a few sample PDFs/DOCX from `fixtures/`.
- Verify that LLM integrations authenticate and respond (if you added the LLM keys).
- Check logs for runtime errors and memory/timeouts (Vercel dashboard → Functions → Logs).

## Monitoring, Rollbacks, and Previews
- Enable PR Preview Deploys for pull-request testing (Vercel does this by default).
- Use Vercel's Deployment History to roll back a failing deploy.
- Add alerts or integrate a monitoring provider (Sentry) for runtime error tracking.

## Troubleshooting
- Build fails due to external Google Fonts fetch: set `NEXT_DISABLE_FONT_DOWNLOAD=1` in Vercel env or switch to local/inline fonts.
- `pdf-parse`/`mammoth` import errors: ensure server-only imports use dynamic `import()` (already implemented in `services/document-ingestion.ts`).
- File upload errors: likely size limits — switch to direct uploads to cloud storage.

## Security and Cost Considerations
- Limit max API execution time and memory to reasonable values to avoid cost spikes in Vercel functions.
- Sanitize inputs from uploaded documents and rate-limit endpoints that invoke LLMs.

## Recommended Next Steps (actions you can take now)
- Add the above `vercel.json` to the repo to tune function limits.
- Create a `README.deploy.md` with the exact env var names and sample `vercel env` commands (I can add this).
- Connect the repo to Vercel and perform a first deploy; I can do this if you grant access or provide the Git repo URL.

---

Last updated: 2026-06-10
