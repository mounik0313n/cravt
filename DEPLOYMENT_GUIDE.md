# Foodle Deployment Guide

**Project ID:** `crav-3b509`

This guide covers deploying the Foodle application (Flask backend + Vue.js frontend) with Firebase authentication to production.

## Overview

- **Frontend**: Vue.js SPA hosted on Firebase Hosting
- **Backend**: Flask app hosted on Render, Fly.io, or similar
- **Auth**: Google Firebase OAuth2 (sign-in/sign-up)
- **Database**: PostgreSQL (production-grade)
- **Payments**: Razorpay (integrated)
- **Firebase Project**: `crav-3b509`

---

## Part 1: Firebase Project Setup

### 1.1 Your Firebase Project Details

```
Project name: crav
Project ID: crav-3b509
Project number: 687400550130
Public-facing name: project-687400550130
```

✅ **Already created** — No need to create a new project.

### 1.2 Enable Authentication (If Not Already Done)

1. Go to [Firebase Console](https://console.firebase.google.com/project/crav-3b509)
2. Navigate to **Authentication** → **Sign-in method**
3. Ensure **Google** is enabled
4. Go to **Authorized domains** and add:
   - `localhost` (local testing on `127.0.0.1:10000`)
   - Your production domain (e.g., `foodle.example.com`)
   - Firebase Hosting domain: `crav-3b509.web.app`

### 1.3 Get Firebase Credentials

#### For Frontend (Required)
1. Go to **Project Settings** (⚙️ icon top-left) → **Your apps**
2. Select or create a **Web** app
3. Copy the config object (contains `apiKey`, `authDomain`, `projectId`, `appId`, etc.)

**Example config:**
```json
{
  "apiKey": "AIzaSyAzaeAJY6yKW4ujOFktp26q-zdt6Wo5hLM",
  "authDomain": "crav-3b509.firebaseapp.com",
  "projectId": "crav-3b509",
  "storageBucket": "crav-3b509.appspot.com",
  "messagingSenderId": "687400550130",
  "appId": "YOUR_APP_ID"
}
```

**Set as env var** (single-line JSON):
```powershell
$env:FIREBASE_FRONTEND_CONFIG_JSON = '{"apiKey":"AIzaSyAzaeAJY6yKW4ujOFktp26q-zdt6Wo5hLM","authDomain":"crav-3b509.firebaseapp.com","projectId":"crav-3b509","storageBucket":"crav-3b509.appspot.com","messagingSenderId":"687400550130","appId":"YOUR_APP_ID"}'
```

#### For Backend (Required for token verification)
1. Go to **Project Settings** → **Service Accounts** tab
2. Click **Generate New Private Key** → downloads `crav-3b509-firebase-adminsdk-XXXXX.json`
3. Store securely (keep out of version control)

---

## Part 2: Backend Deployment (Flask)

### 2.1 Database Migration (Local First)

Before deploying, test migrations locally:

```powershell
$env:FLASK_APP = 'app.py'
python -m flask db migrate -m "Add firebase fields"
python -m flask db upgrade
```

Commit the migration:
```powershell
git add migrations/
git commit -m "Add Firebase user fields to database"
git push origin main
```

### 2.2 Production Environment Variables

Set these on your hosting provider (Render, Fly.io, etc.):

```bash
# Core Flask
FLASK_ENV=production
SECRET_KEY=<generate-random: openssl rand -base64 32>
SECURITY_PASSWORD_SALT=<generate-random>
JWT_SECRET_KEY=<generate-random>

# Database
DATABASE_URL=postgresql://user:password@host:5432/foodle_prod

# Firebase
FIREBASE_FRONTEND_CONFIG_JSON={"apiKey":"...","authDomain":"crav-3b509.firebaseapp.com","projectId":"crav-3b509",...}
FIREBASE_SERVICE_ACCOUNT_FILE=/path/to/crav-3b509-firebase-adminsdk-XXXXX.json

# Razorpay
RAZORPAY_KEY_ID=<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>

# CORS
FRONTEND_ORIGIN=https://crav-3b509.web.app

# Optional: Caching
REDIS_URL=redis://your-redis-url:6379
```

### 2.3 Deploy Backend (Example: Render.com)

1. Push code to GitHub
2. Go to [Render.com](https://render.com/) → Create New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `pip install -r requirements.txt && python -m flask db upgrade`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables**: Add all from section 2.2
5. Click **Deploy**

### 2.4 Post-Deploy Setup

After first deployment, initialize the database (run once):

```bash
curl https://your-backend-url/api/admin/run-db-setup
```

This creates default roles and admin user.

---

## Part 3: Frontend Deployment (Firebase Hosting)

### 3.1 Local Firebase Configuration

Update `.firebaserc` (already configured):

```json
{
  "projects": {
    "default": "crav-3b509"
  }
}
```

✅ **Already configured** — No changes needed.

### 3.2 Deploy Frontend

```powershell
cd D:\cm\frontend
firebase deploy --only hosting
```

**Expected output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/crav-3b509
Hosting URL: https://crav-3b509.web.app
```

### 3.3 Verify Deployment

Visit `https://crav-3b509.web.app`:
1. Should load the Foodle homepage
2. Click "Sign Up" → "Sign up with Google"
3. Complete Google OAuth flow
4. Should create account and redirect to home

---

## Part 4: Testing Checklist

- [ ] Backend is live: `curl https://your-backend-url/health` returns `{"status": "healthy"}`
- [ ] Firebase config endpoint works: `curl https://your-backend-url/api/config/firebase` returns JSON
- [ ] Frontend loads at `https://crav-3b509.web.app`
- [ ] Google sign-in popup appears on login page
- [ ] Can create account via Google OAuth
- [ ] Orders can be placed
- [ ] Razorpay integration works (if enabled)
- [ ] No CORS errors in browser console

---

## Part 5: Troubleshooting

### "Firebase not configured on server"
**Cause**: Backend can't read `FIREBASE_FRONTEND_CONFIG_JSON`  
**Fix**: Verify env var is set correctly on your hosting provider

### "Unauthorized domain" (Google sign-in fails)
**Cause**: App domain not in Firebase Authorized domains  
**Fix**: Add domain to Firebase → Authentication → Authorized domains

### Google Sign-In Popup Blocked
**Cause**: Browser popup blocker  
**Fix**: Allow popups for your domain; check browser console for errors

### Database Migration Failed
**Cause**: Connection issues or missing migrations  
**Fix**: Run `python -m flask db upgrade` manually on server

### Service Account File Not Found
**Cause**: `FIREBASE_SERVICE_ACCOUNT_FILE` path incorrect  
**Fix**: Upload file to server and set correct absolute path, or use `FIREBASE_SERVICE_ACCOUNT_JSON` env var instead

---

## Part 6: Updating the App

### Backend Changes
```powershell
git add -A
git commit -m "Your changes"
git push origin main
# Render auto-deploys on push

# If database changes added:
# - Test locally first: python -m flask db migrate
# - Commit migration file
# - Backend runs migrations automatically on deploy
```

### Frontend Changes
```powershell
git add -A
git commit -m "Your changes"
git push origin main

cd D:\cm\frontend
firebase deploy --only hosting
```

---

## Part 7: Monitoring

### Useful Links
- **Firebase Console**: https://console.firebase.google.com/project/crav-3b509
- **Firebase Hosting**: https://console.firebase.google.com/project/crav-3b509/hosting
- **Backend Logs**: Check your Render/Fly.io dashboard
- **Database**: Connect using your PostgreSQL client

### Health Checks
```bash
# Backend health
curl https://your-backend-url/health

# Firebase config (should return JSON)
curl https://your-backend-url/api/config/firebase

# Firebase hosting
curl https://crav-3b509.web.app
```

---

## Quick Reference

| Item | Value |
|------|-------|
| Firebase Project ID | `crav-3b509` |
| Firebase Hosting URL | `https://crav-3b509.web.app` |
| Firebase Console | https://console.firebase.google.com/project/crav-3b509 |
| Auth Provider | Google OAuth2 |
| Database | PostgreSQL |
| Payment Gateway | Razorpay |
| Backend Tech | Flask + Gunicorn |
| Frontend Tech | Vue.js + Firebase Hosting |

---

## Support

Refer to official documentation:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Flask Deployment](https://flask.palletsprojects.com/deployment/)
- [Render Docs](https://render.com/docs)

