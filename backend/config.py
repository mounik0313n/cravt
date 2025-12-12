import os
from dotenv import load_dotenv

# Load environment variables from a .env file (good for local development)
load_dotenv()

class Config:
    """Base configuration."""
    # These will be None if environment variables aren't set
    SECRET_KEY = os.environ.get('SECRET_KEY') 
    
    # --- Database Configuration ---
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///db.sqlite3')
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = database_url
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Caching configuration
    # If REDIS_URL is provided via environment, use RedisCache; otherwise default to simple in-memory cache.
    REDIS_URL = os.environ.get('REDIS_URL')
    if REDIS_URL:
        CACHE_TYPE = os.environ.get('CACHE_TYPE', 'RedisCache')
        CACHE_REDIS_URL = REDIS_URL
    else:
        CACHE_TYPE = os.environ.get('CACHE_TYPE', 'SimpleCache')

    # --- Flask-Security-Too Configuration ---
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
    
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-Token"
    WTF_CSRF_ENABLED = False
    SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS = True

    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours in seconds

    # Razorpay credentials (optional)
    RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')
    RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET')

    # Firebase configuration (service account JSON can be set as a JSON string in env for local/dev)
    # Example: FIREBASE_SERVICE_ACCOUNT_JSON='{ "type": "service_account", ... }'
    FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
    # Optionally, provide a path to a service account JSON file on disk
    FIREBASE_SERVICE_ACCOUNT_FILE = os.environ.get('FIREBASE_SERVICE_ACCOUNT_FILE')
    # Frontend Firebase config (for firebase.initializeApp in the browser)
    FIREBASE_FRONTEND_CONFIG_JSON = os.environ.get('FIREBASE_FRONTEND_CONFIG_JSON')


class ProductionConfig(Config):
    """Production configuration (used by Render)."""
    # Validation for these keys now happens in app.py
    DEBUG = False
    TESTING = False


class LocalDevelopmentConfig(Config):
    """Local development configuration."""
    DEBUG = True
    
    # --- 🛠️ THE FIX IS HERE ---
    # We add default keys for development mode.
    # These are NOT used in production.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-replace-if-you-want')
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT', 'dev-salt-replace-if-you-want')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-jwt-key-replace-if-you-want')
    
    # Razorpay test keys for local development
    RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', 'rzp_test_Ro0ehBTT9I1ZS1')
    RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '2aAV1Ss6G12ObEncXLJjkBWp')
    # --- END OF FIX ---

    # The .env file can still override the keys above
    # DATABASE_URL="sqlite:///./instance/local.db"
    # This will create a local.db file in an 'instance' folder.