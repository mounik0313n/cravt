bind = "0.0.0.0:10000"

# Workers: For 100 concurrent users
# Formula: (2 * CPU cores) + 1
# Render Standard: 0.5 CPU = 2 workers
# Render Pro: 2 CPU = 5 workers recommended
workers = 8  # Increase for 100 concurrent users

# Use gevent for async I/O (better for I/O-bound operations like database queries)
worker_class = "gevent"
worker_connections = 1000

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
