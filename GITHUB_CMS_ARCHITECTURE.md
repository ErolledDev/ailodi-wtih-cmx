# GitHub CMS Architecture Diagrams

## Complete Workflow

```
┌────────────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                                 │
│                 /dashboard/content/create                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Create Post Form                                            │  │
│  │  - Title (auto-generates slug)                              │  │
│  │  - Content (Markdown)                                       │  │
│  │  - Meta Description (160 chars)                             │  │
│  │  - Category, Author, Image URL                              │  │
│  │  - [Publish & Deploy] Button                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ Form Submit
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE PAGES FUNCTION                         │
│               /api/posts/create (POST)                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. Validate authentication (session cookie)                 │  │
│  │ 2. Validate post data (required fields)                     │  │
│  │ 3. Get env variables:                                        │  │
│  │    - GITHUB_TOKEN                                           │  │
│  │    - GITHUB_OWNER                                           │  │
│  │    - GITHUB_REPO                                            │  │
│  │    - GITHUB_BRANCH                                          │  │
│  │ 4. Create markdown content with frontmatter                 │  │
│  │ 5. Base64 encode content                                    │  │
│  │ 6. Call GitHub API v3                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ HTTP PUT
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    GITHUB API                                      │
│     PUT /repos/{owner}/{repo}/contents/{path}                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Authorization: Bearer {GITHUB_TOKEN}                        │  │
│  │ Body:                                                        │  │
│  │  {                                                          │  │
│  │    "message": "feat: add blog post...",                     │  │
│  │    "content": "base64_encoded_markdown",                    │  │
│  │    "branch": "main"                                         │  │
│  │  }                                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ File Created
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                    GITHUB REPOSITORY                               │
│                  content/posts/{slug}.md                           │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ---                                                          │  │
│  │ title: Your Post Title                                     │  │
│  │ slug: your-post-slug                                       │  │
│  │ metaDescription: SEO description                           │  │
│  │ category: Blog                                             │  │
│  │ author: Admin                                              │  │
│  │ createdAt: 2024-11-20                                      │  │
│  │ ---                                                         │  │
│  │                                                             │  │
│  │ # Your post content in markdown                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ Push Detected
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│              GITHUB ACTIONS WORKFLOW                               │
│           .github/workflows/deploy.yml                             │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Event: on.push.paths:                                        │  │
│  │   - content/posts/**                                        │  │
│  │   - app/**                                                  │  │
│  │   - package.json                                           │  │
│  │                                                             │  │
│  │ Steps:                                                      │  │
│  │  1. Checkout repository                                    │  │
│  │  2. Setup Node.js v20                                      │  │
│  │  3. npm ci (install deps)                                  │  │
│  │  4. npm run build:metadata                                 │  │
│  │  5. wrangler pages deploy out                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ Build Succeeds
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│            CLOUDFLARE PAGES DEPLOYMENT                             │
│               Auto-Deploy from GitHub                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 1. Build Next.js application                               │  │
│  │ 2. Generate static files & build info                      │  │
│  │ 3. Upload to Cloudflare CDN                                │  │
│  │ 4. Update DNS to point to new build                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────────┘
                             │ Deployment Complete
                             ▼
                        ✨ LIVE ✨
```

---

## Deployment Timeline

```
Time  Action                          Status
────  ──────────────────────────────  ──────
0s    User clicks "Publish & Deploy"  ⏳ Loading
1s    API validates post              ✅ Done
3s    GitHub API push                 ✅ Done
5s    GitHub Actions triggered        ⏳ Running
10s   Build starts                    ⏳ Building
30s   Build completes                 ✅ Done
45s   Cloudflare deployment starts    ⏳ Deploying
120s  Deployment complete             ✅ LIVE

Total: ~2 minutes from dashboard to live site
```

---

## Data Flow

```
Dashboard Form
    │
    ├─ title
    ├─ slug
    ├─ content
    ├─ author
    ├─ metaDescription
    ├─ category
    └─ featuredImageUrl
         │
         ▼
    /api/posts/create
         │
         ├─ Validate inputs
         ├─ Get GITHUB_TOKEN from env
         ├─ Create frontmatter
         ├─ Base64 encode
         └─ POST to GitHub API
              │
              ▼
         GitHub Repository
         content/posts/{slug}.md
              │
              ├─ Frontmatter (YAML)
              └─ Content (Markdown)
                   │
                   ▼
              GitHub Actions
              Detects file change
                   │
                   ├─ checkout
                   ├─ build
                   ├─ test
                   └─ deploy
                        │
                        ▼
                   Cloudflare Pages
                   Deploy to CDN
                        │
                        ▼
                   Live Website
                   Post is visible
```

---

## Environment Setup

```
Development (.env.local)
├─ GITHUB_TOKEN
├─ GITHUB_OWNER
├─ GITHUB_REPO
├─ GITHUB_BRANCH
└─ ADMIN_PASSWORD
     │
     Used by: API endpoint during local dev

Production (Cloudflare Pages)
├─ GITHUB_TOKEN
├─ GITHUB_OWNER
├─ GITHUB_REPO
├─ GITHUB_BRANCH
└─ ADMIN_PASSWORD
     │
     Used by: API endpoint on Cloudflare

GitHub Actions (Repo Secrets)
├─ CLOUDFLARE_API_TOKEN
└─ CLOUDFLARE_ACCOUNT_ID
     │
     Used by: GitHub Actions workflow for deployment
```

---

## File Structure

```
Project Root
├── .github/
│   └── workflows/
│       ├── deploy.yml                    ← Main workflow
│       └── deploy-content.yml            ← Content-only
├── app/
│   └── dashboard/
│       └── content/
│           ├── page.tsx                  ← Content list
│           └── create/
│               └── page.tsx              ← Create form
├── content/
│   └── posts/
│       ├── getting-started.md            ← Example post
│       ├── authentication.md
│       └── your-post.md                  ← Your posts go here
├── functions/
│   └── api/
│       ├── auth/
│       │   ├── login.js
│       │   └── logout.js
│       └── posts/
│           └── create.js                 ← POST /api/posts/create
├── lib/
│   ├── github.ts                         ← GitHub integration
│   ├── auth.ts
│   └── content.ts
├── .env.example                          ← Copy to .env.local
├── wrangler.toml                         ← Cloudflare config
├── next.config.js
└── package.json
```

---

## Authentication Flow

```
User visits /dashboard
    │
    ▼
Check session cookie
    │
    ├─ Cookie exists? ──→ Redirect to dashboard
    │
    └─ Cookie missing? ──→ Redirect to /auth
                              │
                              ▼
                          Login form
                          Enter password
                              │
                              ▼
                          POST /api/auth/login
                              │
                              ├─ Match password vs env var
                              │
                              ├─ Password correct? ──→ Set session cookie
                              │                           │
                              │                           ▼
                              │                       Redirect to /dashboard
                              │                           │
                              │                           ▼
                              │                       Can now create posts
                              │
                              └─ Wrong password? ──→ Show error
                                                      Re-prompt for password
```

---

## Error Handling

```
Create Post Flow
    │
    ├─ Missing GitHub token?
    │  └─ Error: "GitHub configuration missing"
    │
    ├─ Invalid post data?
    │  └─ Error: "Missing required fields"
    │
    ├─ Unauthorized (no session)?
    │  └─ Error: "Unauthorized"
    │
    ├─ GitHub API error?
    │  └─ Error: GitHub API error message
    │
    ├─ Network error?
    │  └─ Error: Network failure
    │
    └─ Success? ──→ Show commit info
                     Display GitHub link
                     Redirect to content list
```

---

These diagrams help visualize how the GitHub CMS system works end-to-end.
