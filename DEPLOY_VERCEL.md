# Paano i-deploy ang Profilig System sa Vercel

Ang **frontend** ay nasa Vercel. Ang **backend API** ay naka-host na sa Render:
`https://lguss-barangay-m5jk.onrender.com`

Hindi mo kailangang mag-set ng `VITE_API_URL` sa Vercel — ang `frontend/vercel.json` ay nagre-rewrite ng `/api` papunta sa Render.

---

## Hakbang 1: I-push ang code sa GitHub

```powershell
cd C:\Profiligsystem
git add .
git commit -m "chore: prepare frontend for Vercel deployment"
git push origin master
```

Kung wala pang repo sa GitHub, gumawa muna sa https://github.com/new (huwag lagyan ng README), tapos:

```powershell
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin master
```

**Existing repo:** `https://github.com/arisvin262005-jpg/lguss-barangay.git`

---

## Hakbang 2: Mag-import sa Vercel

1. Buksan: **https://vercel.com/new**
2. Sign in gamit ang **GitHub** account na may access sa repo.
3. Piliin ang repo: **lguss-barangay** (o ang bagong repo mo).
4. Sa **Configure Project**, itakda:

| Setting | Value |
|---------|--------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

5. **Environment Variables** — *optional*; kung gagamitin mo ang direktang backend URL imbes na rewrite:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://lguss-barangay-m5jk.onrender.com` |

6. I-click **Deploy**.

---

## Hakbang 3: Pagkatapos mag-deploy

- Makukuha mo ang URL tulad ng: `https://lguss-barangay.vercel.app`
- Subukan ang login: `admin@barangay.gov.ph` / `password123`
- Unang API call minsan **mabagal** (Render free tier cold start ~30–60s)

---

## CLI (optional)

```powershell
npm install -g vercel
cd C:\Profiligsystem\frontend
vercel login
vercel --prod
```

---

## Troubleshooting

| Problema | Solusyon |
|----------|----------|
| Blank page / 404 sa refresh | Siguraduhing may SPA rewrite sa `vercel.json` |
| Login/API hindi gumagana | Check Render backend: `/api/health` |
| CORS error | Backend `server.js` ay may `vercel.app` sa allowed origins |
