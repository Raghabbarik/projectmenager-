# My Journey — Web Application

Your life. Your progress. Your story. A private personal growth, activity tracking, client management, and project timeline application.

---

## ⚡ Centralized Redis Shared Cache

This application implements a **Centralized Shared Redis Cache** to eliminate redundant database queries across servers, edge functions, and clients:

- **Shared Cache Layer**: Pulls shared public CMS data, project milestones, ideas, and activities from a single, fast Redis instance instead of duplicating queries.
- **Team Presence**: Redis heartbeats track active team members with automatic TTL expiration.
- **Upstash Redis Integration**: Uses `@upstash/redis` via HTTP/REST — zero TCP connection pool limits, native compatibility with Vercel serverless/edge.
- **Built-in Fallback Simulator**: Runs automatically in development and offline without requiring Redis setup.
- **UI Management Panel**: Manage, test latency, warm cache, and flush Redis keys directly in the **Settings** page.

---

## 🚀 Deploying to Vercel

This repository is pre-configured for one-click deployment on [Vercel](https://vercel.com).

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Push this repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Vercel automatically detects **Vite** with the included [`vercel.json`](./vercel.json):
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the following **Environment Variables** in the Vercel project settings:
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Public Key
   - `VITE_REDIS_REST_URL`: *(Optional)* Your Upstash Redis REST URL
   - `VITE_REDIS_REST_TOKEN`: *(Optional)* Your Upstash Redis REST Token
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for AI Assistant
5. Click **Deploy**. Your app will be live with full SPA routing, asset caching, and centralized Redis caching.

### Option 2: Deploy via Vercel CLI

```bash
# 1. Install or run Vercel CLI
npx vercel

# 2. Follow prompts to link project
# 3. Deploy to production
npx vercel --prod
```

---

## 💻 Local Development

**Prerequisites:** Node.js (v18+)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables (copy from .env.example)
cp .env.example .env

# 3. Start local development server
npm run dev

# 4. Validate TypeScript and build bundle
npm run lint
npm run build
```

---

## 📁 Key Files & Configuration

- `vercel.json` — Vercel routing rules, SPA fallbacks, and HTTP security headers.
- `vite.config.ts` — Vite configuration with Tailwind CSS and ESM path aliases.
- `src/lib/redis.ts` — Redis client configuration supporting Upstash REST and runtime credentials.
- `src/services/redisService.ts` — Centralized Redis caching operations, TTL management, and team presence.
- `src/components/redis/RedisCachePanel.tsx` — Real-time Redis monitor, cache metrics, key browser, and flush controls.
- `.env.example` — Reference template for all environment variables.
- `supabase_schema.sql` — Database migration and table schemas for Supabase.
