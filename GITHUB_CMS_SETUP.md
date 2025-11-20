# Full GitHub CMS Setup Guide

This guide will help you set up the complete GitHub CMS system where posts are created through the admin dashboard, automatically pushed to GitHub, and deployed via Cloudflare Pages.

## How It Works

```
1. Create post in admin dashboard
   ↓
2. Post sent to /api/posts/create endpoint
   ↓
3. API pushes markdown file to GitHub (content/posts/)
   ↓
4. GitHub Actions workflow detects the push
   ↓
5. Workflow builds your Next.js site
   ↓
6. Cloudflare Pages deploys the updated site
   ↓
7. Your post is live!
```

---

## Prerequisites

- ✅ GitHub account and repository
- ✅ Cloudflare account with Pages connected to GitHub
- ✅ Admin dashboard set up and working
- ✅ Node.js 18+ installed locally

---

## Step 1: Create GitHub Personal Access Token

The system needs a GitHub token to push posts to your repository.

### 1.1 Generate the Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Set token details:
   - **Token name:** `ailodi-cms-token`
   - **Expiration:** 90 days or 1 year (choose your preference)
   - **Scopes:** Select these permissions:
     - ✅ `repo` (full control of private repositories)
     - ✅ `workflow` (update GitHub Actions workflows)

4. Click **"Generate token"**
5. **COPY THE TOKEN IMMEDIATELY** - you won't see it again!

### 1.2 Store the Token Securely

- **Local development:** Create a `.env.local` file in your project root:
  ```
  GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
  GITHUB_OWNER=YOUR_GITHUB_USERNAME
  GITHUB_REPO=ailodi-wtih-cmx
  GITHUB_BRANCH=main
  ```

- **Production (Cloudflare Pages):** Add it as an environment variable:
  1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
  2. Pages → Your project → Settings → Environment variables
  3. Add for both **Production** and **Preview**:
     ```
     GITHUB_TOKEN = ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
     GITHUB_OWNER = YOUR_GITHUB_USERNAME
     GITHUB_REPO = ailodi-wtih-cmx
     GITHUB_BRANCH = main
     ```

---

## Step 2: Update wrangler.toml

The `wrangler.toml` file contains the configuration for your Cloudflare Pages deployment.

Update your `wrangler.toml`:

```toml
# wrangler.toml - Cloudflare Pages configuration
name = 'ailodi'
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

# Cloudflare Pages configuration
pages_build_output_dir = "out"

[env.production]
name = "ai-lodi-blog"
vars = { 
  ADMIN_PASSWORD = "your-secure-password-here",
  GITHUB_OWNER = "YOUR_GITHUB_USERNAME",
  GITHUB_REPO = "ailodi-wtih-cmx",
  GITHUB_BRANCH = "main"
}

[env.preview]
name = "ai-lodi-blog-preview"
vars = { 
  ADMIN_PASSWORD = "admin123",
  GITHUB_OWNER = "YOUR_GITHUB_USERNAME",
  GITHUB_REPO = "ailodi-wtih-cmx",
  GITHUB_BRANCH = "main"
}
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

---

## Step 3: Deploy GitHub Actions Workflows

Two workflow files have been created in `.github/workflows/`:

### 3.1 Main Deployment Workflow (`deploy.yml`)

Triggers on any push to these paths:
- `content/posts/**` (new posts)
- `app/**`, `components/**`, `lib/**`, `public/**` (code changes)
- `package.json`, `next.config.js`, `tsconfig.json`, etc.

### 3.2 Content-Only Deployment (`deploy-content.yml`)

Triggers specifically on content changes for faster deployments.

Both workflows are already in `.github/workflows/` and will automatically run when you push to GitHub.

### 3.3 Verify Workflows in GitHub

1. Go to your GitHub repository
2. Click on **"Actions"** tab
3. You should see:
   - `Deploy to Cloudflare Pages`
   - `Deploy on New Post (Content Only)`

If you don't see them, make sure `.github/workflows/deploy.yml` and `.github/workflows/deploy-content.yml` are committed to your `main` branch.

---

## Step 4: Configure Cloudflare Pages Deployment

### 4.1 Connect Repository (if not already done)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Pages → Connect to Git
3. Authorize GitHub and select your repository
4. Configure build settings:
   - **Framework preset:** Next.js
   - **Build command:** `npm run build:metadata`
   - **Build output directory:** `out`

### 4.2 Set Environment Variables in Cloudflare

1. In Cloudflare Pages → Your Project → Settings
2. **Environment Variables** section:
   - Click **"Add variable"** for each:
   ```
   GITHUB_TOKEN = [your-token-from-step-1]
   GITHUB_OWNER = YOUR_GITHUB_USERNAME
   GITHUB_REPO = ailodi-wtih-cmx
   GITHUB_BRANCH = main
   ADMIN_PASSWORD = your-secure-password
   ```

3. Add these for **both Production and Preview** environments

### 4.3 Add GitHub Secrets (for Actions Workflow)

For GitHub Actions to deploy to Cloudflare:

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"** and add:
   ```
   Name: CLOUDFLARE_API_TOKEN
   Value: [Your Cloudflare API Token]
   ```
   
3. Click **"New repository secret"** again:
   ```
   Name: CLOUDFLARE_ACCOUNT_ID
   Value: [Your Cloudflare Account ID]
   ```

**How to get these:**
- **API Token:** [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  - Create a custom token with "Pages deploy" permission
  
- **Account ID:** 
  - Go to Cloudflare Dashboard → Account Home
  - Find "Account ID" in the right sidebar

---

## Step 5: Test the Workflow

### 5.1 Local Testing

1. Create a `.env.local` file with your GitHub token:
   ```
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_OWNER=YOUR_GITHUB_USERNAME
   GITHUB_REPO=ailodi-wtih-cmx
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

3. Go to `http://localhost:3000/dashboard`
4. Login with your admin password
5. Navigate to **Content** → **Create Post**
6. Fill in the form and click **"Publish & Deploy"**
7. Watch the progress indicator

### 5.2 Check GitHub

After submitting:
1. Go to your GitHub repository
2. Check **"Actions"** tab - you should see a workflow running
3. The workflow will:
   - Build your Next.js site
   - Deploy to Cloudflare Pages
   - Show success or failure

### 5.3 Verify Deployment

1. The new post markdown file will appear in `content/posts/`
2. Your site will be rebuilt and deployed
3. The new post will be live at your site URL

---

## Step 6: Troubleshooting

### Issue: "GitHub configuration missing" error

**Solution:** Check that environment variables are set:
- ✅ `GITHUB_TOKEN` is valid and not expired
- ✅ `GITHUB_OWNER` matches your GitHub username
- ✅ `GITHUB_REPO` matches your repository name
- ✅ All variables are set in `.env.local` (local) AND Cloudflare Pages (production)

### Issue: "Unauthorized" when creating post

**Solution:** 
- Check admin authentication is working
- Verify session cookie is set
- Clear browser cookies and login again

### Issue: Workflow fails to deploy

**Solution:**
- Check GitHub Actions secrets are set correctly
- Verify `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are correct
- Check workflow logs in GitHub Actions tab

### Issue: Post created but site not rebuilding

**Solution:**
- Check that `.github/workflows/deploy.yml` is in `main` branch
- Verify GitHub Actions is enabled in repository settings
- Check the "Actions" tab for workflow runs and errors

### Issue: Post doesn't appear on live site

**Solution:**
- Wait 1-2 minutes for Cloudflare deployment to complete
- Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
- Check the post frontmatter format matches expected format
- Verify `createdAt` date is correct

---

## Step 7: Security Best Practices

✅ **DO:**
- Use a strong, unique `ADMIN_PASSWORD`
- Rotate your GitHub token annually
- Use Cloudflare API tokens with minimal required permissions
- Keep repository private if containing sensitive content
- Review workflow logs regularly

❌ **DON'T:**
- Commit `.env.local` to GitHub (add to `.gitignore`)
- Share your GitHub token or API tokens
- Use the same password as other services
- Set token expiration to "Never"

---

## Step 8: Workflow Files Reference

### deploy.yml
Triggers on:
- Push to `main` branch
- Changes in `content/posts/`, `app/`, `components/`, `lib/`, `public/`
- Changes to config files

### deploy-content.yml
Triggers on:
- Push to `main` branch
- ONLY changes in `content/posts/`

Both workflows:
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Build Next.js site
5. Deploy to Cloudflare Pages

---

## Step 9: Next Steps

### Customize Categories
Edit the category options in `app/dashboard/content/create/page.tsx`:
```tsx
<SelectItem value="Tutorials">Tutorials</SelectItem>
<SelectItem value="Security">Security</SelectItem>
<SelectItem value="DevOps">DevOps</SelectItem>
<SelectItem value="Blog">Blog</SelectItem>
// Add your own categories here
```

### Add Post Edit/Delete Features
- Create `/api/posts/update` endpoint
- Create `/api/posts/delete` endpoint
- Add edit pages to dashboard

### Enable Comment Management
- Integrate with Valine or Disqus
- Add moderation dashboard

### Setup Post Scheduling
- Add `scheduledAt` field to frontmatter
- Create scheduled deployment workflow
- Add calendar UI to dashboard

---

## Need Help?

Common issues and solutions are in the Troubleshooting section above.

For more information:
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js Deployment](https://nextjs.org/docs/deployment/cloudflare-pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
