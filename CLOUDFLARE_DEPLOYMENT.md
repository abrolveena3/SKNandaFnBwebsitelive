# Cloudflare Pages Deployment Guide for SK Nanda Catering

This project is architected with a native **Cloudflare Pages `functions/` directory**. You do **not** need Express, Docker, or Cloud Run.

---

### Step 1: Push to GitHub
Commit and push the codebase to your GitHub repository:
```bash
git add .
git commit -m "Deploy SK Nanda Catering with Cloudflare Functions"
git push origin main
```

---

### Step 2: Connect to Cloudflare Pages
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub repository.
4. Set the build configuration:
   * **Framework preset**: `Vite` (or `None`)
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`
5. Click **Save and Deploy**.

---

### Step 3: Add Your Gemini API Key in Cloudflare
1. Go to your Pages project in Cloudflare Dashboard.
2. Click **Settings** > **Environment variables**.
3. Under **Production** (and **Preview** if desired), click **Add variable**:
   * **Variable name**: `GEMINI_API_KEY`
   * **Value**: `<Your Google Gemini API Key>`
   * (Encrypt / Save)
4. Trigger a deployment or redeploy.

---

### Model Architecture & Safeguards Included
* **Primary Model**: `gemini-2.5-flash-lite`
* **Backup 1**: `gemini-2.5-flash`
* **Backup 2**: `gemini-flash-latest`
* **Header**: Passed securely via `x-goog-api-key` header (never exposed in post bodies, query parameters, or client error responses).
* **Max Output Tokens**: 2048 tokens.
* **Timeout**: 20 seconds.
* **Thinking Budget**: 0 (instantaneous high-throughput responses).
* **Dual Fallback**: If offline or if no API key is provided, the concierge automatically answers from the built-in SK Nanda luxury catering knowledge base.
