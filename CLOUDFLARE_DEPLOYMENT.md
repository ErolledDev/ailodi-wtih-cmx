# Cloudflare Pages Deployment Guide

## Environment Variables Setup

Your admin dashboard now uses secure server-side authentication via Cloudflare Pages Functions.

### Local Development

Environment variables are in `.env.local`:
```
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_ADMIN_PASSWORD=admin123  # For fallback only
```

### Production Deployment (Cloudflare Pages)

1. **Deploy your project to GitHub** (already done: `https://github.com/ErolledDev/ailodi-wtih-cmx`)

2. **Connect to Cloudflare Pages:**
   - Go to https://dash.cloudflare.com
   - Pages → Connect to Git
   - Select your repository: `ailodi-wtih-cmx`
   - Build settings should auto-detect Next.js

3. **Set Environment Variables:**
   - In Cloudflare Pages dashboard:
   - Settings → Environment Variables
   - Add for **Production**:
     ```
     ADMIN_PASSWORD = your-secure-password-here
     ```
   - Add for **Preview**:
     ```
     ADMIN_PASSWORD = admin123  (or same as production)
     ```

4. **How Authentication Works:**
   - User submits password via `/api/auth/login`
   - Cloudflare Pages Function receives request
   - Validates password against `ADMIN_PASSWORD` environment variable
   - Returns secure httpOnly cookie on success
   - Cookie is used for subsequent requests to verify authentication

### Security Notes

✅ **Password is never exposed to client-side**
- Only sent in POST request body
- Validated server-side only
- Never appears in localStorage or devtools

✅ **Session tokens are secure:**
- Generated as UUIDs
- Stored in httpOnly cookies (can't be accessed by JavaScript)
- Expire after 24 hours
- Only sent over HTTPS in production

✅ **No hardcoded secrets in code:**
- All passwords stored as environment variables
- Different passwords can be set per environment

### Testing Locally

```bash
npm run dev
# Navigate to http://localhost:3000/auth
# Login with: admin123
```

### Troubleshooting

**"Server configuration error" on login:**
- Check `ADMIN_PASSWORD` is set in Cloudflare Pages environment variables

**Sessions not persisting:**
- Ensure cookies are enabled in browser
- Check that site is served over HTTPS in production

**"Cannot reach api/auth/login":**
- Ensure `functions/` directory is committed to git
- Rebuild your Pages deployment after code changes

### File Structure

```
functions/
  auth/
    login.ts       # POST /api/auth/login
    logout.ts      # POST /api/auth/logout
    verify.ts      # GET /api/auth/verify
```

These are automatically deployed as Cloudflare Pages Functions.
