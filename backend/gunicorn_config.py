"""
Gunicorn configuration file for production deployment
"""
import multiprocessing
import os

# Server socket
bind = "127.0.0.1:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 120
keepalive = 5

# Logging
accesslog = "/var/www/ShopZen/ShopZen/backend/logs/gunicorn_access.log"
errorlog = "/var/www/ShopZen/ShopZen/backend/logs/gunicorn_error.log"
loglevel = "info"
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s"'

# Process naming
proc_name = "ShopZen_api"

# Server mechanics
daemon = False
pidfile = "/var/www/ShopZen/ShopZen/backend/gunicorn.pid"
user = None
group = None
tmp_upload_dir = None

# SSL (if needed, but we'll use Nginx for SSL termination)
# keyfile = None
# certfile = None
