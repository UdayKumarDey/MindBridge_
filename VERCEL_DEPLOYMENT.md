# Deploying MindBridge on Vercel

MindBridge builds its Vite client into `dist/public` and exposes the existing Express OAuth and tRPC routes through `api/index.ts`. Vercel serves the compiled client and invokes the same application API for `/api/*` traffic. The included `vercel.json` also rewrites client routes to the Vite entry file so direct visits to pages such as `/dashboard` continue to work.

| Vercel setting | Value |
| --- | --- |
| Framework preset | Other |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` |
| Output directory | `dist/public` |
| Node.js version | 22.x |

Set the variables listed in `.env.example` in **Project Settings → Environment Variables** for the Production, Preview, and Development environments that require access. Keep `DATABASE_URL` and `JWT_SECRET` server-only. Any `VITE_*` variable is bundled into the browser and therefore must never contain sensitive information.

Before promoting a deployment, use the production domain to register the OAuth callback URL below with the identity provider. The callback must match exactly, including the `https` protocol.

```
https://YOUR_DOMAIN/api/oauth/callback
```

Connect a managed MySQL or TiDB instance reachable from Vercel, set `DATABASE_URL`, and run the generated migration in `drizzle/0001_serious_eternity.sql` against that database before the first production sign-in. The migration creates the `checkins`, `conversations`, and `login_activity` tables. The authentication callback updates the account’s `lastSignedIn` field and creates one durable `login_activity` row for each successful OAuth sign-in.

Vercel runs Express as a function rather than a permanent WebSocket process. This implementation uses request/response tRPC mutations with query invalidation for immediate persisted updates. For a future multi-user live-presence or push-chat feature, add a managed realtime provider designed for serverless runtimes rather than assuming a long-lived in-process WebSocket server.

## Deployment sequence

1. Export the repository to GitHub, then import that repository into Vercel.
2. Add the required environment variables and configure the OAuth callback URL.
3. Create the production database and apply the reviewed Drizzle migration.
4. Deploy from the Vercel dashboard, then complete a sign-in, check-in, and companion message smoke test.

## References

Vercel documents Express deployment, Node.js functions, and SPA route rewrites in its current guides: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express), [Node.js runtime](https://vercel.com/docs/functions/runtimes/node-js), and [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite).
