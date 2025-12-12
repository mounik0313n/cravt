# 🚀 PRODUCTION DEPLOYMENT CHECKLIST

**Firebase Project:** `crav-3b509`  
**Status:** ✅ READY FOR DEPLOYMENT  
**Last Updated:** Final Optimization Pass  

---

## Phase 1: Pre-Deployment Setup (Local)

### Firebase Project Configuration

- [ ] **Verify Firebase Project ID**: `crav-3b509` ✅
- [ ] **Check `.firebaserc`** contains: `{"projects":{"default":"crav-3b509"}}` ✅
- [ ] **Firebase CLI logged in**: `firebase login` ✅
- [ ] **Node.js + npm installed**: `node --version && npm --version` ✅
- [ ] **firebase-tools installed**: `firebase --version` (v15.0.0+) ✅

### Code Verification

- [ ] **All Python files pass syntax check** ✅
  ```bash
  python -m py_compile app.py backend/routes.py backend/models.py backend/config.py
  ```

- [ ] **All JavaScript files reviewed** ✅
  - `frontend/pages/customer/CustomerLoginPage.js`
  - `frontend/pages/customer/CustomerRegisterPage.js`
  - `frontend/utils/store.js`
  - `frontend/pages/customer/CustomerCheckOutPage.js`

- [ ] **All dependencies in requirements.txt** ✅
  - `firebase-admin==6.0.1`
  - `razorpay==2.0.0`
  - `Flask==3.0.3`
  - `psycopg2-binary==2.9.11`
  - `gunicorn==22.0.0`

- [ ] **Git commits pushed to GitHub** ✅
  - Latest: `d257a16` (Final optimization pass)

---

## Phase 2: Backend Deployment (Render.com Example)

### Step 1: Prepare Environment Variables

Create a `.env` file for local testing (never commit this):

```bash
# Core Flask
FLASK_ENV=production
SECRET_KEY=<GENERATE: openssl rand -base64 32>
SECURITY_PASSWORD_SALT=<GENERATE: openssl rand -base64 32>
JWT_SECRET_KEY=<GENERATE: openssl rand -base64 32>

# Database (Get URL from Render PostgreSQL addon)
DATABASE_URL=postgresql://user:password@host:5432/foodle_prod

# Firebase Frontend Config (from Firebase Console → Project Settings → Your apps)
FIREBASE_FRONTEND_CONFIG_JSON={"apiKey":"...","authDomain":"crav-3b509.firebaseapp.com","projectId":"crav-3b509",...}

# Firebase Service Account (Option 1: JSON string)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"crav-3b509",...}

# Firebase Service Account (Option 2: File path on server)
FIREBASE_SERVICE_ACCOUNT_FILE=/app/crav-3b509-firebase-adminsdk-XXXXX.json

# Razorpay (from Dashboard)
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=your_secret_key

# CORS
FRONTEND_ORIGIN=https://crav-3b509.web.app

# Optional: Redis for caching
REDIS_URL=redis://your-redis-url:6379
```

- [ ] **Generate all secret keys**
- [ ] **Collect Firebase credentials** (from Firebase Console)
- [ ] **Create PostgreSQL database** (on Render or external provider)
- [ ] **Collect Razorpay API keys** (from Razorpay Dashboard)

### Step 2: Deploy to Render

1. [ ] Go to [Render.com](https://render.com/)
2. [ ] Click **New → Web Service**
3. [ ] Connect GitHub repository: `mounik0313n/cravt`
4. [ ] Configure:
   - **Name:** `foodle-api`
   - **Runtime:** Python 3.11
   - **Build Command:** 
     ```bash
     pip install -r requirements.txt && python -m flask db upgrade
     ```
   - **Start Command:** 
     ```bash
     gunicorn app:app
     ```
   - **Environment Variables:** Add all from Step 1 above
5. [ ] Click **Create Web Service**
6. [ ] Wait for deployment (2-5 minutes)

### Step 3: Post-Deployment Backend Setup

Once deployed, run the initialization endpoint (one-time only):

```bash
curl https://your-render-url/api/admin/run-db-setup
```

Expected response:
```json
{
  "status": "success",
  "message": "Database setup complete! You can now log in with admin@crav.com / admin123"
}
```

- [ ] **Database initialized successfully**
- [ ] **Admin user created** (admin@crav.com / admin123)
- [ ] **Backend health check passes**: `curl https://your-render-url/health`
- [ ] **Firebase config endpoint works**: `curl https://your-render-url/api/config/firebase`

---

## Phase 3: Frontend Deployment (Firebase Hosting)

### Step 1: Update Firebase Authorized Domains

1. [ ] Go to [Firebase Console](https://console.firebase.google.com/project/crav-3b509)
2. [ ] Navigate to **Authentication → Sign-in method**
3. [ ] Scroll to **Authorized domains**
4. [ ] Add these domains:
   - `localhost` (for local testing)
   - `crav-3b509.web.app` (Firebase Hosting)
   - `crav-3b509.firebaseapp.com` (alternate Firebase domain)
   - Any custom domain you plan to use

- [ ] **Firebase Authorized Domains updated**

### Step 2: Deploy Frontend to Firebase Hosting

```bash
cd D:\cm\frontend

# (Optional) Build step if using build tools
# npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Expected output:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/crav-3b509
Hosting URL: https://crav-3b509.web.app
```

- [ ] **Frontend deployed successfully**
- [ ] **Hosting URL accessible**: `https://crav-3b509.web.app`

### Step 3: Update Backend URL (if needed)

If frontend needs to call backend API:

1. [ ] Update `frontend/utils/apiService.js` if backend URL changed
2. [ ] Rebuild and re-deploy: `firebase deploy --only hosting`

- [ ] **Frontend can reach backend API**

---

## Phase 4: Verification & Testing

### Backend Checks

```bash
# 1. Health check
curl https://your-render-url/health

# Expected output: {"status": "healthy"}
```

- [ ] **Health check passes**

```bash
# 2. Firebase config check
curl https://your-render-url/api/config/firebase

# Expected output: JSON with Firebase config
```

- [ ] **Firebase config endpoint works**

```bash
# 3. Test sign-in endpoint
curl -X POST https://your-render-url/api/auth/firebase \
  -H "Content-Type: application/json" \
  -d '{"idToken":"test_token"}'

# Expected: Error about invalid token (this is OK, means endpoint exists)
```

- [ ] **Firebase auth endpoint is reachable**

### Frontend Checks

1. [ ] Visit `https://crav-3b509.web.app`
2. [ ] Should see Foodle homepage
3. [ ] Click "Sign Up" → "Sign up with Google"
4. [ ] Complete Google OAuth flow
5. [ ] Should create account and redirect to home
6. [ ] Check browser console for errors (should be none)
7. [ ] Try placing an order (if user has restaurants)

- [ ] **Homepage loads**
- [ ] **Sign-up flow works**
- [ ] **No console errors**
- [ ] **Order flow works**

### CORS Verification

In browser console on `https://crav-3b509.web.app`, run:

```javascript
fetch('https://your-render-url/health')
  .then(r => r.json())
  .then(d => console.log('CORS OK:', d))
  .catch(e => console.error('CORS Error:', e));
```

- [ ] **CORS errors resolved**
- [ ] **API is accessible from frontend**

---

## Phase 5: Performance & Security

### Security Checklist

- [ ] **Database URL** is PostgreSQL (production-grade)
- [ ] **All secrets** are in environment variables (not in code)
- [ ] **HTTPS enabled** (automatic on Render + Firebase)
- [ ] **CORS configured** correctly
- [ ] **JWT tokens** are properly validated
- [ ] **Firebase tokens** are verified with Admin SDK
- [ ] **Passwords hashed** (using Flask-Security-Too)

### Performance Checklist

- [ ] **Frontend loads in < 3 seconds**
- [ ] **API responses in < 500ms**
- [ ] **No console warnings** in browser
- [ ] **Images optimized** (Firebase Hosting compresses)
- [ ] **Caching configured** (Redis or SimpleCache)

---

## Phase 6: Post-Launch Monitoring

### Set Up Logging

- [ ] **Check Render logs** regularly: `https://dashboard.render.com`
- [ ] **Check Firebase logs**: `firebase hosting:log`
- [ ] **Set up error alerts** (Sentry recommended)

### Monitor Metrics

- [ ] **Daily active users** (Firebase Analytics)
- [ ] **API response times** (Render metrics)
- [ ] **Database connections** (PostgreSQL admin)
- [ ] **Error rates** (Logs)

### Backup Plan

- [ ] **Database backups enabled** on Render
- [ ] **GitHub commits regular** (code backup)
- [ ] **Firebase Firestore backups** (if using)

---

## Phase 7: Future Enhancements

### Short-term (Week 1-2)

- [ ] Test all user flows end-to-end
- [ ] Monitor for bugs and errors
- [ ] Gather user feedback
- [ ] Fix any reported issues

### Medium-term (Month 1-3)

- [ ] Implement email notifications (SendGrid)
- [ ] Add SMS alerts (Twilio)
- [ ] Set up real-time order tracking (Socket.IO)
- [ ] Enable caching for frequently accessed data

### Long-term (Month 3+)

- [ ] Multi-restaurant support
- [ ] Advanced analytics (Google Analytics)
- [ ] Mobile app (React Native)
- [ ] Loyalty programs
- [ ] Social features (reviews, ratings)

---

## ⚠️ Important Notes

1. **Change Default Admin Password** (if created via `/api/admin/run-db-setup`)
   - Email: `admin@crav.com`
   - Password: `admin123`
   - Change ASAP after login

2. **Firebase Service Account File**
   - Keep `crav-3b509-firebase-adminsdk-XXXXX.json` secure
   - Upload to server securely (use `FIREBASE_SERVICE_ACCOUNT_FILE` env var)
   - Or use `FIREBASE_SERVICE_ACCOUNT_JSON` env var instead (simpler, no file needed)

3. **Database Migrations**
   - Backend auto-runs migrations on deploy (via Build Command)
   - If manual migration needed: `python -m flask db upgrade`
   - Check migration status: `python -m flask db current`

4. **Razorpay Test Mode**
   - Use test API keys first
   - Switch to live keys only in production
   - Test payment flow thoroughly

---

## Quick Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com/project/crav-3b509 |
| Firebase Hosting | https://console.firebase.google.com/project/crav-3b509/hosting |
| Render Dashboard | https://dashboard.render.com |
| GitHub Repository | https://github.com/mounik0313n/cravt |
| Live Frontend | https://crav-3b509.web.app |
| Live Backend | https://your-render-url/ |

---

## Getting Help

- **Firebase Docs:** https://firebase.google.com/docs
- **Render Docs:** https://render.com/docs
- **Flask Docs:** https://flask.palletsprojects.com
- **Vue.js Docs:** https://vuejs.org

---

## Final Checklist

- [ ] All environment variables set on backend host
- [ ] Database migrations completed
- [ ] Backend deployment successful
- [ ] Frontend deployed to Firebase Hosting
- [ ] All verification checks passed
- [ ] No console errors or warnings
- [ ] User can sign-up, sign-in, and place orders
- [ ] Monitoring and logging configured
- [ ] Backups enabled
- [ ] Team notified of go-live

---

**🎉 YOU ARE NOW READY TO LAUNCH!**

---

*Last Updated: Final Optimization Pass*  
*Firebase Project: `crav-3b509`*  
*Status: ✅ PRODUCTION READY*
