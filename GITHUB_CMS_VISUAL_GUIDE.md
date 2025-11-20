# GitHub CMS - Visual Setup Guide

## Step-by-Step Visual Walkthrough

---

## PHASE 1: GitHub Token Setup (5 minutes)

### Step 1.1: Generate Token

```
Browser
└─ Go to: https://github.com/settings/tokens
   │
   └─ Click "Generate new token (classic)"
      │
      ├─ Token name: ailodi-cms-token
      ├─ Expiration: 90 days
      └─ Scopes: ✓ repo, ✓ workflow
         │
         └─ Click "Generate token"
            │
            └─ 📋 COPY THE TOKEN
               (You won't see it again!)
```

### Step 1.2: Create .env.local

```
Your Project Root/
│
└─ Create file: .env.local
   │
   ├─ GITHUB_TOKEN = ghp_xxxxx...
   ├─ GITHUB_OWNER = your_username
   ├─ GITHUB_REPO = ailodi-wtih-cmx
   ├─ GITHUB_BRANCH = main
   └─ ADMIN_PASSWORD = your_password
```

---

## PHASE 2: Cloudflare Configuration (10 minutes)

### Step 2.1: Add Environment Variables

```
Cloudflare Dashboard
└─ Pages > Your Project > Settings
   │
   ├─ Environment Variables
   │  │
   │  ├─ Production:
   │  │  ├─ GITHUB_TOKEN
   │  │  ├─ GITHUB_OWNER
   │  │  ├─ GITHUB_REPO
   │  │  ├─ GITHUB_BRANCH
   │  │  └─ ADMIN_PASSWORD
   │  │
   │  └─ Preview:
   │     ├─ GITHUB_TOKEN
   │     ├─ GITHUB_OWNER
   │     ├─ GITHUB_REPO
   │     ├─ GITHUB_BRANCH
   │     └─ ADMIN_PASSWORD
   │
   └─ Save all variables
```

---

## PHASE 3: GitHub Actions Secrets (10 minutes)

### Step 3.1: Get Cloudflare API Token

```
Cloudflare Dashboard
└─ Profile > API Tokens
   │
   ├─ Click "Create Token"
   ├─ Choose "Edit Cloudflare Workers"
   ├─ Configure permissions
   │  ├─ Account: Workers Scripts - Edit
   │  └─ Account: Account Settings - Read
   │
   └─ Copy token → Save it!
```

### Step 3.2: Get Account ID

```
Cloudflare Dashboard
└─ Account Home
   │
   └─ Right sidebar
      │
      └─ Account ID (copy this!)
```

### Step 3.3: Add GitHub Secrets

```
GitHub Repository
└─ Settings > Secrets and variables > Actions
   │
   ├─ New repository secret
   │  ├─ Name: CLOUDFLARE_API_TOKEN
   │  └─ Value: (paste from Step 3.1)
   │
   ├─ New repository secret
   │  ├─ Name: CLOUDFLARE_ACCOUNT_ID
   │  └─ Value: (paste from Step 3.2)
   │
   └─ Save both
```

---

## PHASE 4: Verify Setup (5 minutes)

### Step 4.1: Check Workflow Files

```
GitHub Repository
└─ Your project root
   │
   └─ .github/workflows/
      │
      ├─ ✅ deploy.yml exists?
      └─ ✅ deploy-content.yml exists?
```

### Step 4.2: Check Environment Variables

```
Cloudflare Dashboard
└─ Pages > Your Project > Settings > Environment Variables
   │
   ├─ Production section
   │  ├─ ✅ GITHUB_TOKEN set?
   │  ├─ ✅ GITHUB_OWNER set?
   │  ├─ ✅ GITHUB_REPO set?
   │  ├─ ✅ GITHUB_BRANCH set?
   │  └─ ✅ ADMIN_PASSWORD set?
   │
   └─ Preview section
      ├─ ✅ All variables set?
      └─ ✅ Values match?
```

### Step 4.3: Check GitHub Secrets

```
GitHub Repository
└─ Settings > Secrets and variables > Actions
   │
   ├─ ✅ CLOUDFLARE_API_TOKEN exists?
   ├─ ✅ CLOUDFLARE_ACCOUNT_ID exists?
   └─ ✅ Both have values?
```

---

## TESTING: Create Your First Post

### Local Testing (Development)

```
Terminal
└─ npm run dev
   │
   └─ Browser: http://localhost:3000/dashboard
      │
      ├─ Login with ADMIN_PASSWORD
      │
      ├─ Click "Content" in sidebar
      │
      ├─ Click "Create New Post"
      │
      ├─ Fill in form:
      │  ├─ Title: "My First Post"
      │  ├─ Content: "Hello World"
      │  └─ Meta Description: "First post"
      │
      ├─ Click "Publish & Deploy"
      │
      └─ Watch progress indicators
         │
         └─ ✅ Success? Check GitHub!
```

### Check GitHub

```
GitHub Repository
└─ Click "Actions" tab
   │
   └─ You should see workflow running
      │
      ├─ Job: "deploy"
      │  ├─ Checkout ✅
      │  ├─ Setup Node ✅
      │  ├─ Install deps ✅
      │  ├─ Build ✅
      │  └─ Deploy ✅
      │
      └─ Wait for completion (1-2 minutes)
```

### Verify on Production

```
Your Live Site
└─ Visit https://your-site.com
   │
   ├─ Check homepage for new post
   ├─ Check blog page
   ├─ Click on post
   └─ ✅ Post content displays?
```

---

## Dashboard Walkthrough

### Dashboard Home

```
http://localhost:3000/dashboard

┌─────────────────────────────────────┐
│         AI LODI DASHBOARD           │
├─────────────────────────────────────┤
│                                     │
│  Sidebar:                           │
│  ├─ Dashboard (home)                │
│  ├─ Content                         │
│  │  ├─ All Posts (view list)       │
│  │  └─ Create Post (new post)      │
│  ├─ Settings                        │
│  └─ Logout                          │
│                                     │
└─────────────────────────────────────┘
```

### Create Post Page

```
Content → Create New Post

┌──────────────────────────────────────────┐
│  CREATE NEW POST                         │
├──────────────────────────────────────────┤
│                                          │
│  POST INFORMATION                        │
│  ├─ Title: ________________ (required)   │
│  ├─ Slug: _________________ (auto-gen)   │
│  └─ Author: _______________ (optional)   │
│                                          │
│  CONTENT                                 │
│  ├─ Write content...                    │
│  │ (Markdown supported)                 │
│  │                                      │
│  │                                      │
│  └─ ________________                    │
│                                          │
│  SEO                                     │
│  ├─ Meta Description: ______ (160 max)  │
│  │                          (145/160)    │
│  └─                                      │
│                                          │
│  METADATA                                │
│  ├─ Category: ▼ [Blog]                  │
│  └─ Image URL: _____________            │
│                                          │
│  GITHUB CMS WORKFLOW                     │
│  Post saves as markdown → commits to     │
│  GitHub → Cloudflare rebuilds → live     │
│                                          │
│  [Cancel]  [Publish & Deploy]           │
│                                          │
└──────────────────────────────────────────┘
```

### During Publication

```
┌──────────────────────────────────────────┐
│  PUBLISHING POST                         │
├──────────────────────────────────────────┤
│                                          │
│  ⏳ Validating post                      │
│  ✅ Pushing to GitHub                    │
│  ⏳ Triggering build                     │
│  ⏳ Deploying to Cloudflare              │
│                                          │
└──────────────────────────────────────────┘
```

### Success Message

```
┌──────────────────────────────────────────┐
│  ✅ POST CREATED SUCCESSFULLY!           │
├──────────────────────────────────────────┤
│                                          │
│  Post created successfully!              │
│                                          │
│  Your post has been pushed to GitHub     │
│  and Cloudflare Pages is building        │
│  your site. The deployment should        │
│  complete in 1-2 minutes.                │
│                                          │
│  Post: my-first-post.md                  │
│                                          │
│  [View commit on GitHub]                │
│                                          │
└──────────────────────────────────────────┘
```

---

## Troubleshooting Visual Guide

### Issue: "GitHub configuration missing"

```
❌ ERROR: GitHub configuration missing

↓ Check These:
├─ .env.local has GITHUB_TOKEN?
├─ GITHUB_OWNER is your username?
├─ GITHUB_REPO is correct name?
├─ Cloudflare has these variables?
└─ Any typos in names?

✅ FIX:
├─ Update .env.local
├─ Restart: npm run dev
└─ Try again
```

### Issue: Workflow doesn't run

```
❌ No workflow appearing in GitHub Actions

↓ Check These:
├─ .github/workflows/deploy.yml exists?
├─ Is it in main branch?
├─ Did you commit the file?
└─ Is GitHub Actions enabled?

✅ FIX:
├─ Add workflow file if missing
├─ Commit to main branch
├─ Wait 1 minute
└─ Try creating post again
```

### Issue: Post not on live site

```
❌ Post created but not visible on site

↓ Check These:
├─ Waited 1-2 minutes?
├─ Cleared browser cache?
├─ GitHub workflow succeeded?
└─ Cloudflare deployment finished?

✅ FIX:
├─ Wait 2 minutes
├─ Hard refresh (Ctrl+Shift+R)
├─ Check GitHub Actions for errors
└─ Try creating another post
```

---

## Summary: 30-Minute Setup

```
⏱️  Total Time: ~30 minutes

├─ 5 min:  Generate GitHub token
├─ 10 min: Add Cloudflare variables
├─ 10 min: Add GitHub Actions secrets
├─ 5 min:  Verify setup
│
└─ ✅ READY TO USE!
```

---

## Quick Status Checklist

Use this to track your progress:

```
SETUP TRACKING:

Phase 1: GitHub Token
└─ ☐ Generated token
   ☐ Created .env.local
   ☐ Copied all values

Phase 2: Cloudflare
└─ ☐ Added Production variables
   ☐ Added Preview variables
   ☐ All values correct

Phase 3: GitHub Actions
└─ ☐ Got API token
   ☐ Got Account ID
   ☐ Added both secrets

Phase 4: Verification
└─ ☐ Workflow files exist
   ☐ Cloudflare vars set
   ☐ GitHub secrets set

TESTING:
└─ ☐ Local dev works
   ☐ Created test post
   ☐ Post appears on site

✅ ALL DONE! Ready to create posts!
```

---

This visual guide helps you through each step. Use it alongside the main documentation!
