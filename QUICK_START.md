# ⚡ QUICK START - PRODUCTION DEPLOYMENT

**Firebase Project:** `crav-3b509`  
**Repository:** https://github.com/mounik0313n/cravt  
**Status:** ✅ READY TO DEPLOY  

---

## 🏃 5-Minute Quick Start

### 1. Gather Your Credentials

```
📱 Firebase Project ID: crav-3b509
🔑 Firebase Service Account: Download from Firebase Console → Project Settings → Service Accounts
💳 Razorpay Keys: From Razorpay Dashboard
🗄️ PostgreSQL: Create a PostgreSQL database (Render addon or external)
```

### 2. Backend Deployment (Render)

```bash
# 1. Go to https://render.com
# 2. New → Web Service
# 3. Connect: mounik0313n/cravt

# 4. Set Build & Start Commands:
# Build: pip install -r requirements.txt && python -m flask db upgrade
# Start: gunicorn app:app

# 5. Environment Variables (copy & paste):
FLASK_ENV=production
SECRET_KEY=<openssl rand -base64 32>
SECURITY_PASSWORD_SALT=<openssl rand -base64 32>
JWT_SECRET_KEY=<openssl rand -base64 32>
DATABASE_URL=postgresql://user:pass@host:5432/foodle_prod
FIREBASE_FRONTEND_CONFIG_JSON={"apiKey":"...","authDomain":"crav-3b509.firebaseapp.com",...}
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"crav-3b509",...}
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_ORIGIN=https://crav-3b509.web.app

# 6. Click Deploy → Wait 2-5 minutes
```

### 3. Initialize Database

```bash
# After backend is deployed, run (one-time):
curl https://your-render-url/api/admin/run-db-setup
```

### 4. Frontend Deployment (Firebase)

```bash
cd D:\cm\frontend

# Deploy:
firebase deploy --only hosting

# Visit: https://crav-3b509.web.app ✅
```

### 5. Test It!

```
✅ Visit https://crav-3b509.web.app
✅ Click "Sign Up" → "Sign up with Google"
✅ Complete Google sign-in
✅ See homepage
✅ Try placing an order
```

---

## 📚 Detailed Guides

| Need | Read |
|------|------|
| **Full backend setup** | `DEPLOYMENT_GUIDE.md` |
| **Step-by-step verification** | `DEPLOYMENT_CHECKLIST.md` |
| **Code quality review** | `OPTIMIZATION_REPORT.md` |
| **Complete overview** | `FINAL_DELIVERY_SUMMARY.md` |

---

## 🆘 Troubleshooting

### Issue: "Firebase not configured"
**Fix:** Verify `FIREBASE_FRONTEND_CONFIG_JSON` is set on Render dashboard

### Issue: "Unauthorized domain" (Google sign-in)
**Fix:** Add domain to Firebase Console → Authentication → Authorized Domains

### Issue: Database connection error
**Fix:** Check `DATABASE_URL` env var, verify PostgreSQL is accessible

### Issue: CORS errors in browser
**Fix:** Ensure `FRONTEND_ORIGIN=https://crav-3b509.web.app` is set on backend

---

## 🔐 Security Checklist

- [ ] Change default admin password (admin@crav.com / admin123)
- [ ] Enable HTTPS (automatic on Render + Firebase)
- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Never commit `.env` file
- [ ] Use production Razorpay keys (not test keys)
- [ ] Database backups enabled

---

## 📊 Key URLs

```
Firebase Console:  https://console.firebase.google.com/project/crav-3b509
Render Dashboard:  https://dashboard.render.com
GitHub Repo:       https://github.com/mounik0313n/cravt
Live Frontend:     https://crav-3b509.web.app
Live Backend:      https://your-render-url/
```

---

## 💾 Essential Commands

```bash
# Check Python syntax
python -m py_compile app.py backend/routes.py backend/models.py

# Test backend locally
$env:FLASK_APP = 'app.py'
python -m flask run

# Deploy frontend
firebase deploy --only hosting

# View Firebase logs
firebase hosting:log

# Check backend health
curl https://your-backend-url/health
```

---

## 🎯 Success Criteria

✅ Backend responds at https://your-backend-url/health  
✅ Firebase config at https://your-backend-url/api/config/firebase  
✅ Frontend loads at https://crav-3b509.web.app  
✅ Google sign-in opens popup  
✅ User can register and sign in  
✅ No CORS errors in browser console  
✅ Orders can be placed  

---

**Everything is ready! Just follow the steps above and you'll be live in under 1 hour. 🚀**

---

*Last Updated: Final Deployment Preparation*  
*Firebase Project: `crav-3b509`*  
*Repository: mounik0313n/cravt*
