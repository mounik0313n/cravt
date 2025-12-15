# Load Balancing & Scaling for 100+ Concurrent Users

## Current Configuration

### Gunicorn Workers: 8
- **Worker Class:** `gevent` (async I/O)
- **Connections per worker:** 1000
- **Total capacity:** ~8000 concurrent connections
- **Realistic concurrent users:** 100-200

### How Load Balancing Works

```
Internet → Render Load Balancer → Your App (8 Gunicorn Workers)
                                    ├── Worker 1 (handles ~12 users)
                                    ├── Worker 2 (handles ~12 users)
                                    ├── Worker 3 (handles ~12 users)
                                    ├── Worker 4 (handles ~12 users)
                                    ├── Worker 5 (handles ~12 users)
                                    ├── Worker 6 (handles ~12 users)
                                    ├── Worker 7 (handles ~12 users)
                                    └── Worker 8 (handles ~12 users)
```

## Render Plan Requirements

For 100 concurrent users, you need:

### Minimum: Render Pro Plan
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Workers:** 8 (configured)
- **Cost:** ~$25/month

### Recommended: Render Pro Plus
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Workers:** Can scale to 16
- **Cost:** ~$85/month

## Scaling Beyond 100 Users

If you need to handle more than 100 concurrent users:

### Option 1: Horizontal Scaling (Multiple Instances)
Deploy multiple instances of your app behind Render's load balancer:
- Instance 1: 8 workers (100 users)
- Instance 2: 8 workers (100 users)
- Total: 200 concurrent users

### Option 2: Database Optimization
Switch to PostgreSQL with connection pooling:
```python
# In config.py
SQLALCHEMY_ENGINE_OPTIONS = {
    "pool_size": 20,
    "max_overflow": 40,
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}
```

### Option 3: Add Redis Caching
Cache frequently accessed data:
- Restaurant lists
- Menu items
- User sessions

## Monitoring & Alerts

### Set up Render Alerts
1. Go to Render Dashboard → Your Service → Metrics
2. Set alerts for:
   - CPU > 80%
   - Memory > 80%
   - Response time > 2s

### Check Performance
```bash
# In Render logs, look for:
[INFO] Booting worker with pid: 123
[INFO] Worker timeout (pid:123)  # ⚠️ If you see this, increase timeout
```

## Load Testing

Test your app with 100 concurrent users:

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test with 100 concurrent users, 1000 requests
ab -n 1000 -c 100 https://your-app.onrender.com/api/restaurants

# Expected results:
# - Requests per second: > 50
# - Time per request: < 2000ms
# - Failed requests: 0
```

## Troubleshooting

### Issue: Workers timing out
**Solution:** Increase timeout in `gunicorn_config.py`:
```python
timeout = 180  # Increase from 120
```

### Issue: High memory usage
**Solution:** Reduce workers:
```python
workers = 4  # Reduce from 8
```

### Issue: Database connection errors
**Solution:** Add connection pooling (see Option 2 above)

### Issue: Still slow with 100 users
**Solution:** 
1. Check database indexes are created
2. Enable Redis caching
3. Upgrade to Render Pro Plus
4. Use CDN for static files

## Cost Optimization

### Free Tier (Not Recommended for Production)
- ❌ Can't handle 100 concurrent users
- ❌ Spins down after inactivity
- ❌ Limited resources

### Starter ($7/month)
- ⚠️ Can handle ~20-30 concurrent users
- Limited CPU/RAM

### Pro ($25/month) ✅ Recommended
- ✅ Can handle 100 concurrent users
- ✅ Always on
- ✅ 2 CPU cores, 4 GB RAM

### Pro Plus ($85/month)
- ✅ Can handle 200+ concurrent users
- ✅ 4 CPU cores, 8 GB RAM
- Best for growth

## Summary

With the current configuration:
- ✅ 8 Gunicorn workers with gevent
- ✅ Automatic load balancing
- ✅ Can handle 100 concurrent users
- ✅ Database indexes for fast queries
- ✅ Gzip compression for smaller responses

**Next step:** Deploy to Render Pro plan and monitor performance!
