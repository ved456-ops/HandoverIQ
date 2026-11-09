# HandoverIQ — Production & Custom Domain Hosting Guide

Your project (`d:\Handoveriq`) is already pre-configured with [Dockerfile](file:///d:/Handoveriq/backend/Dockerfile), [render.yaml](file:///d:/Handoveriq/render.yaml), and [vercel.json](file:///d:/Handoveriq/frontend/vercel.json) so you can deploy both the **Frontend** and **Backend** for free and attach any custom domain.

---

## Step 1 — Push Your Latest Code to GitHub

Your repository is already linked to `https://github.com/ved456-ops/HandoverIQ.git`. Run these commands in `d:\Handoveriq` (or let me run them for you):

```bash
git add .
git commit -m "Release HandoverIQ v1.0 — Built by CodeVengers team"
git push origin main
```

---

## Step 2 — Host the FastAPI Backend on Render (Free)

1. Go to **[render.com](https://render.com)** and sign in with your GitHub account.
2. Click **New +** → **Web Service** and select your **`ved456-ops/HandoverIQ`** repository.
3. Configure these settings:
   - **Name**: `handoveriq-api`
   - **Language / Runtime**: `Docker`
   - **Root Directory**: `backend`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add (optional, works even without keys):
   - `AI_PROVIDER` = `auto`
   - `GEMINI_API_KEY` = *(Your Google Gemini API key, if you have one)*
   - `GITHUB_TOKEN` = *(Optional GitHub Personal Access Token for 5,000 req/hr)*
5. Click **Deploy Web Service**.
6. Copy your live backend URL once it finishes building (for example: `https://handoveriq-api.onrender.com`).

---

## Step 3 — Host the Next.js Frontend on Vercel (Free)

1. Go to **[vercel.com](https://vercel.com)** and sign in with your GitHub account.
2. Click **Add New…** → **Project** and import **`ved456-ops/HandoverIQ`**.
3. Configure these two settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click **Edit** and select **`frontend`**
4. Expand **Environment Variables** and add:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://handoveriq-api.onrender.com` *(your Render URL from Step 2, without a trailing slash)*
5. Click **Deploy**.
6. Within ~60 seconds, your website will be live at **`https://handoveriq.vercel.app`** (or similar `.vercel.app` domain)!

---

## Step 4 — Connect Your Custom Domain (e.g., `handoveriq.com` or `handoveriq.tech`)

Once your project is deployed on Vercel:
1. Open your project dashboard on **Vercel** → click **Settings** → **Domains**.
2. Type your domain name (e.g., `handoveriq.tech` or `handoveriq.com`) and click **Add**.
3. In your domain registrar's DNS settings (Namecheap, GoDaddy, Cloudflare, Porkbun, Hostinger, etc.), add the two DNS records Vercel shows you:
   - **A Record**: Host `@` → Value `76.76.21.21`
   - **CNAME Record**: Host `www` → Value `cname.vercel-dns.com`
4. Vercel will automatically issue a free **SSL/HTTPS certificate** within 2–5 minutes, and your site will be live on your custom domain!
