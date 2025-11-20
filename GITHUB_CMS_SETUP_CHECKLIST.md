# GitHub CMS Setup Checklist

Complete these steps to enable the full GitHub CMS workflow.

## Quick Setup (30 minutes)

### Phase 1: GitHub Token (5 minutes)
- [ ] Generate GitHub Personal Access Token at https://github.com/settings/tokens
  - Scopes: `repo`, `workflow`
  - Name: `ailodi-cms-token`
- [ ] Copy token (save it somewhere safe!)
- [ ] Create `.env.local` file in project root:
  ```
  GITHUB_TOKEN=ghp_xxxxx...
  GITHUB_OWNER=your_github_username
  GITHUB_REPO=ailodi-wtih-cmx
  GITHUB_BRANCH=main
  ```

### Phase 2: Cloudflare Configuration (10 minutes)
- [ ] Go to Cloudflare Pages → Your Project → Settings
- [ ] Add Environment Variables (both Production & Preview):
  - [ ] `GITHUB_TOKEN` = [your token from Phase 1]
  - [ ] `GITHUB_OWNER` = your GitHub username
  - [ ] `GITHUB_REPO` = ailodi-wtih-cmx
  - [ ] `GITHUB_BRANCH` = main
  - [ ] `ADMIN_PASSWORD` = your-secure-password

### Phase 3: GitHub Actions Secrets (10 minutes)
- [ ] Get Cloudflare API Token from https://dash.cloudflare.com/profile/api-tokens
- [ ] Get Cloudflare Account ID from account home
- [ ] Go to GitHub Repo → Settings → Secrets and variables → Actions
- [ ] Add secrets:
  - [ ] `CLOUDFLARE_API_TOKEN` = [your API token]
  - [ ] `CLOUDFLARE_ACCOUNT_ID` = [your account ID]

### Phase 4: Verify Workflows (5 minutes)
- [ ] Check `.github/workflows/deploy.yml` exists
- [ ] Check `.github/workflows/deploy-content.yml` exists
- [ ] Commit both files to `main` branch
- [ ] Go to GitHub Actions tab - workflows should show up

## Testing

### Local Test
- [ ] Run `npm run dev`
- [ ] Go to `http://localhost:3000/dashboard`
- [ ] Login with admin password
- [ ] Go to Content → Create Post
- [ ] Fill form and click "Publish & Deploy"
- [ ] Watch progress indicator
- [ ] Check GitHub Actions for workflow run

### Production Test
- [ ] Wait 1-2 minutes for deployment
- [ ] Visit your live site
- [ ] Verify new post appears
- [ ] Check post content is correct

## After Setup

### Ongoing Tasks
- [ ] Monitor GitHub Actions tab for failed deployments
- [ ] Review post metadata is correct
- [ ] Check site builds in < 2 minutes
- [ ] Verify posts are searchable

### Maintenance
- [ ] Rotate GitHub token annually (Settings → Developer Settings)
- [ ] Review and update Cloudflare permissions
- [ ] Keep Next.js and dependencies updated
- [ ] Monitor Cloudflare analytics

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| "GitHub config missing" | Check `.env.local` and Cloudflare vars |
| Workflow fails to run | Verify `.github/workflows/` files are in main branch |
| Post not appearing | Wait 2 min, clear cache, check GitHub Actions |
| Authentication error | Clear cookies, re-login, check `ADMIN_PASSWORD` |
| Cloudflare deploy fails | Check API token and account ID in GitHub secrets |

## Files Modified/Created

✅ Created:
- `.github/workflows/deploy.yml` - Main deployment workflow
- `.github/workflows/deploy-content.yml` - Content-only deployment
- `GITHUB_CMS_SETUP.md` - Full setup guide (this file)

✅ Updated:
- `wrangler.toml` - Added GitHub environment variables
- `functions/api/posts/create.js` - Integrated GitHub API push
- `app/dashboard/content/create/page.tsx` - Enhanced UI with deployment status

✅ Already Exists:
- `lib/github.ts` - GitHub API integration (was already in project)

## Next Steps

1. Complete the checklist above
2. Test in local development
3. Deploy to production
4. Create your first post!

## Need Help?

See `GITHUB_CMS_SETUP.md` for detailed instructions and troubleshooting.
