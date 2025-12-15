bind = "0.0.0.0:10000"

# Workers: For 100 concurrent users
# Using sync workers (compatible with Python 3.13)
workers = 4  # 4 workers for Render Pro (2 CPU cores)

# Use sync worker class (stable and compatible)
worker_class = "sync"
worker_connections = 1000
threads = 4  # 4 threads per worker = 16 total threads

# Timeouts
timeout = 120
graceful_timeout = 30
keepalive = 5

# Logging
accesslog = "-"
errorlog = "-"
loglevel = "info"

# Performance optimizations
preload_app = True  # Load app before forking workers
max_requests = 1000  # Restart workers after 1000 requests (prevent memory leaks)
max_requests_jitter = 50  # Add randomness to prevent all workers restarting at once

# Load balancing across workers
# Gunicorn automatically load balances across workers using a pre-fork model
