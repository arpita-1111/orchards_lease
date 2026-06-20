Vercel deployment notes

Problem: If the frontend is hosted on Vercel (e.g. https://orchardslease.vercel.app) and the backend is hosted elsewhere, requests to `/api/v1/...` will go to the frontend origin and return 404.

Two recommended solutions:

1) Set `VITE_API_URL` in Vercel environment variables (recommended)

- In your Vercel project dashboard > Settings > Environment Variables, add:
  - Key: `VITE_API_URL`
  - Value: `https://api.example.com/api/v1` (replace with your API base)
  - Environment: Production
- Re-deploy the frontend. The built bundle will use the provided API base.

2) Use Vercel rewrites to proxy `/api/*` to your backend

Create `vercel.json` at the project root (example):

{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.example.com/api/:path*" }
  ]
}

Notes:
- If you use cookies for authentication (refresh tokens), ensure backend CORS allows the frontend origin and that cookies use `SameSite=None` and `Secure` in production.
- Backend env vars to set:
  - `CLIENT_URL=https://orchardslease.vercel.app`
  - `NODE_ENV=production`
  - Optionally `COOKIE_DOMAIN` (e.g. `.example.com`) if sharing cookies across subdomains.

Quick checklist:
- [ ] Set `VITE_API_URL` in Vercel to your API base and redeploy, OR add `vercel.json` rewrite and redeploy.
- [ ] Confirm backend `CLIENT_URL` and CORS allow the frontend origin and `credentials: true`.
- [ ] Verify `Set-Cookie` response contains `SameSite=None; Secure` and that browser sends cookie with requests.

If you want, I can prepare a ready-to-deploy `vercel.json` with your API domain inserted.