# Foodle Deployment Guide

This guide covers deploying the Foodle application (Flask backend + Vue.js frontend) with Firebase authentication to production.

## Overview

- **Frontend**: Vue.js SPA hosted on Firebase Hosting
- **Backend**: Flask app hosted on Render, Fly.io, or similar
- **Auth**: Google Firebase (OAuth2 sign-in/sign-up)
- **Database**: PostgreSQL (production-grade)
- **Payments**: Razorpay (integrated)

---

## Part 1: Firebase Project Setup

### 1.1 Create or Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** (lowercase, e.g., `foodle-app-123`)

### 1.2 Enable Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Google** sign-in provider
3. Go to **Authorized domains** and add your hosting domains:
   - `localhost` (for local testing)
   - Your production domain (e.g., `foodle.example.com`)
   - Firebase automatically adds your Firebase Hosting domain

### 1.3 Get Firebase Credentials

#### For Frontend (Required for all environments)
1. Go to **Project Settings** → **Your apps** → Create a Web app (if not exists)
2. Copy the config JSON (contains `apiKey`, `authDomain`, `projectId`, `appId`, etc.)
3. Set as env var:
   ```powershell
   $env:FIREBASE_FRONTEND_CONFIG_JSON = '{"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}'
   ```

#### For Backend (Required for token verification)
1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate New Private Key** → JSON file downloads
3. Store this file securely (e.g., `serviceAccount.json` in project root)
4. Set env var on your server:
   ```bash
   export FIREBASE_SERVICE_ACCOUNT_FILE=/path/to/serviceAccount.json
   ```

---

## Part 2: Backend Deployment (Flask)

### 2.1 Prerequisites

- Python 3.8+
- PostgreSQL database (create a new database for production)
- Hosting provider account (Render, Fly.io, Heroku, etc.)

### 2.2 Database Migration

Before deploying, run migrations locally to ensure they work:

```powershell
$env:FLASK_APP = 'app.py'
python -m flask db migrate -m "Add firebase fields"
python -m flask db upgrade
```

Commit the migration file to git:
```powershell
git add migrations/
git commit -m "Add Firebase user fields"
```

### 2.3 Environment Variables for Production

Set these on your hosting provider (Render, Fly.io settings):

```
# Core Flask
FLASK_ENV=production
SECRET_KEY=<generate-a-random-secret-key>
SECURITY_PASSWORD_SALT=<generate-a-random-salt>
JWT_SECRET_KEY=<generate-a-random-jwt-key>

# Database
DATABASE_URL=postgresql://user:password@host:5432/foodle_prod

# Firebase
FIREBASE_SERVICE_ACCOUNT_FILE=/path/to/serviceAccount.json
FIREBASE_FRONTEND_CONFIG_JSON={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}

# Razorpay (if using payments)
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>

# CORS
FRONTEND_ORIGIN=https://your-frontend-domain.com

# Caching (optional)
REDIS_URL=redis://your-redis-url:6379
```

### 2.4 Deploy Backend (Example: Render)

1. Push code to GitHub
2. Go to [Render.com](https://render.com/) → Create New → Web Service
3. Connect GitHub repo
4. Set:
   - **Build Command**: `pip install -r requirements.txt && python -m flask db upgrade`
   - **Start Command**: `gunicorn app:app`
   - **Environment**: Add all env vars above
5. Click Deploy

### 2.5 Run Initial Database Setup (Post-Deploy)

After first deployment, run the setup endpoint once:

```bash
curl https://your-backend-url.render.com/api/admin/run-db-setup
```

This creates default roles and admin user.

---

## Part 3: Frontend Deployment (Firebase Hosting)

### 3.1 Link Firebase Project Locally

From the project root (`d:\cm`):

```powershell
firebase use --add
# Select your project ID from the list
# This updates .firebaserc with your project
```

Or manually edit `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

### 3.2 Upload Service Account File (One-time)

If you want the backend to read the service account from a file:

1. Upload `serviceAccount.json` to your backend server/host
2. Set `FIREBASE_SERVICE_ACCOUNT_FILE=/path/to/serviceAccount.json`

Or use the JSON env var approach (simpler, not storing files):

```powershell
# Read the file content and set as env var
$content = Get-Content -Path serviceAccount.json -Raw
$env:FIREBASE_SERVICE_ACCOUNT_FILE = $content
```

### 3.3 Deploy Frontend to Firebase Hosting

```powershell
cd D:\cm\frontend
firebase deploy --only hosting
```

**Output example:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project-id
Hosting URL: https://your-project-id.web.app
```

### 3.4 Verify Deployment

Visit `https://your-project-id.web.app`:
1. Click "Sign Up"
2. Click "Sign up with Google"
3. Complete Google sign-in flow
4. Should redirect to home page after successful auth

---

## Part 4: Post-Deployment Checklist

- [ ] Firebase Hosting URL is live and loads the app
- [ ] Backend API is accessible and health check passes: `curl https://backend-url/health`
- [ ] Google sign-in works on login/signup pages
- [ ] Backend logs show "Firebase admin initialized from file..." or similar
- [ ] Users can create accounts via Google sign-in
- [ ] Database is populated and orders can be placed
- [ ] Razorpay payments work (if enabled)
- [ ] CORS is configured correctly (no cross-origin errors in browser console)

---

## Part 5: Monitoring & Troubleshooting

### Common Issues

**"Firebase not configured on server"**
- Check: Backend `GET /api/config/firebase` returns valid JSON
- Fix: Ensure `FIREBASE_FRONTEND_CONFIG_JSON` is set on backend

**Google Sign-In Popup Blocked**
- Fix: Add domain to Firebase Authorized Domains (Part 1.2 step 3)
- Test: Open DevTools → Console to see error message

**"Unauthorized domain" error**
- Fix: Same as above — add domain to Firebase Authorized Domains

**Database Migrations Failed**
- Fix: Run `python -m flask db upgrade` manually on the server
- Check: Database URL is correct and accessible

**CORS Errors in Browser**
- Fix: Ensure `FRONTEND_ORIGIN` env var is set correctly on backend
- Example: `FRONTEND_ORIGIN=https://your-project-id.web.app`

### Useful Commands

```powershell
# Check Firebase deployment status
firebase hosting:channel:list

# View Firebase Hosting logs
firebase hosting:log

# View backend app logs (Render example)
curl https://api.render.com/v1/services/{service-id}/logs --header "authorization: Bearer YOUR_API_TOKEN"

# SSH into backend server (Fly.io example)
fly ssh console
```

---

## Part 6: Updating the App

### Deploy Backend Changes

```powershell
git add -A
git commit -m "Your changes"
git push origin main
# Render auto-deploys on push

# If migrations added:
# - Run locally to test
# - Commit migration file
# - Backend will auto-run migrations on deploy
```

### Deploy Frontend Changes

```powershell
git add -A
git commit -m "Your changes"
git push origin main

cd frontend
firebase deploy --only hosting
```

---

## Part 7: Securing Production

1. **Change Admin Credentials** (if used default from DB setup)
2. **Enable HTTPS** (automatic on Firebase Hosting and Render)
3. **Set Strong Secrets** in all env vars
4. **Enable Database Backups** (configure on your host)
5. **Monitor Logs** for errors and suspicious activity
6. **Set up Alerts** for uptime and errors

---

## Questions?

Refer to:
- [Firebase Console](https://console.firebase.google.com/)
- [Render Docs](https://render.com/docs)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Flask Deployment](https://flask.palletsprojects.com/deployment/)
