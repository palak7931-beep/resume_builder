# Vercel Deployment Guide

This project is now configured for Vercel deployment. Follow these steps to deploy.

## Files Added for Vercel

- `vercel.json`: Vercel platform configuration (function memory, timeout, environment variables)
- `.env.example`: Template for required environment variables
- `.vercelignore`: Excludes unnecessary files from Vercel builds
- `next.config.ts`: Optimized for Vercel serverless environment with API route caching headers

## Quick Start — Deploy via CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy to production:**
   ```bash
   vercel --prod
   ```

4. **Vercel will prompt you to:**
   - Link to an existing project or create a new one
   - Confirm build settings (already configured in `vercel.json`)

## Deploy via Vercel Dashboard (Recommended for First Deploy)

1. **Push your code to GitHub/GitLab/Bitbucket**
2. **Go to [vercel.com](https://vercel.com) and click "New Project"**
3. **Import your Git repository**
4. **Vercel auto-detects Next.js; confirm build command is `npm run build`**
5. **Add Environment Variables in Project Settings:**
   - Click **Settings > Environment Variables**
   - Add the following (copy from `.env.example`):
     - `GROQ_API_KEY` (your actual API key)
     - `GROQ_DATASET` (your dataset name)
     - `NEXT_DISABLE_FONT_DOWNLOAD=1` (optional, to disable external font fetches)
   - Any other secrets your app uses
6. **Deploy and monitor the build logs**

## Environment Variables

Required environment variables (set in Vercel Dashboard):

| Variable | Description | Example |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq LLM API key | `gsk_...` |
| `GROQ_DATASET` | Groq dataset identifier | `production` |
| `NEXT_DISABLE_FONT_DOWNLOAD` | (Optional) Disable external Google Fonts fetch | `1` |

## API Function Settings

The `vercel.json` configures API routes with:
- **Memory**: 1024 MB (sufficient for file parsing with `pdf-parse` and `mammoth`)
- **Max Duration**: 60 seconds (allows time for resume parsing and LLM requests)

## After Deployment

1. **Test the live app:**
   - Visit your Vercel URL (e.g., `https://resume-builder.vercel.app`)
   - Test upload and parsing: use sample files from `fixtures/`
   - Verify LLM endpoints authenticate and respond

2. **Monitor production:**
   - Check Vercel dashboard → **Functions** for logs and errors
   - Use Vercel's **Analytics** tab to track performance
   - Set up error alerts (integrate Sentry, LogRocket, etc. if needed)

3. **Preview Deploys:**
   - Every pull request automatically gets a preview deployment
   - Share preview URLs for team review before merging to main

4. **Rollback if needed:**
   - Vercel **Deployments** tab shows deployment history
   - One-click rollback to any previous production deployment

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails with font errors | Ensure `NEXT_DISABLE_FONT_DOWNLOAD=1` is set in Vercel env |
| File upload fails (413 errors) | Serverless payload limit is ~4–5MB. Implement direct-to-S3 for larger files |
| LLM endpoints return 401/403 | Verify API keys are set in Vercel env vars (not committed to code) |
| Functions timeout after 30s | Increase `maxDuration` in `vercel.json` or optimize API logic |

## Cost and Limits

- **Hobby plan**: 10 deployments/month, suitable for development
- **Pro plan**: Unlimited deployments, recommended for production
- **Function invocations**: Charged per function call (optimize LLM requests to reduce costs)
- **Bandwidth**: Unlimited

For pricing details, see [vercel.com/pricing](https://vercel.com/pricing).

---

For more details, see [docs/deployment-plan.md](../deployment-plan.md).
