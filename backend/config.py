import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'ShopZen-secret-key-2026')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # JWT Settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'ShopZen-jwt-secret-key-2026')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 24)))
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(hours=int(os.getenv('JWT_REFRESH_TOKEN_EXPIRES', 720)))
    JWT_IDENTITY_CLAIM = 'sub'
    JWT_TOKEN_LOCATION = ['headers']
    
    # Database Settings - Build URL from components
    @staticmethod
    def get_database_uri():
        from urllib.parse import quote_plus
        
        db_type = os.getenv('DB_TYPE', 'mysql').lower()
        
        if db_type == 'sqlite':
            db_file = os.getenv('DB_FILE', 'ShopZen.db')
            return f'sqlite:///{db_file}'
        
        elif db_type == 'mysql':
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '3306')
            db_name = os.getenv('DB_NAME', 'ShopZen_pharma_db')
            db_user = os.getenv('DB_USER', 'root')
            db_password = os.getenv('DB_PASSWORD', '')
            db_charset = os.getenv('DB_CHARSET', 'utf8mb4')
            
            # URL-encode the password to handle special characters
            encoded_password = quote_plus(db_password) if db_password else ''
            
            # Build MySQL connection string
            password_part = f':{encoded_password}' if encoded_password else ''
            return f'mysql+pymysql://{db_user}{password_part}@{db_host}:{db_port}/{db_name}?charset={db_charset}'
        
        elif db_type == 'postgresql':
            db_host = os.getenv('DB_HOST', 'localhost')
            db_port = os.getenv('DB_PORT', '5432')
            db_name = os.getenv('DB_NAME', 'ShopZen_pharma_db')
            db_user = os.getenv('DB_USER', 'postgres')
            db_password = os.getenv('DB_PASSWORD', '')
            
            # URL-encode the password to handle special characters
            encoded_password = quote_plus(db_password) if db_password else ''
            
            # Build PostgreSQL connection string
            password_part = f':{encoded_password}' if encoded_password else ''
            return f'postgresql://{db_user}{password_part}@{db_host}:{db_port}/{db_name}'
        
        else:
            raise ValueError(f'Unsupported database type: {db_type}')
    
    SQLALCHEMY_DATABASE_URI = get_database_uri.__func__()
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv('SQLALCHEMY_TRACK_MODIFICATIONS', 'False').lower() == 'true'
    SQLALCHEMY_ECHO = os.getenv('SQLALCHEMY_ECHO', 'False').lower() == 'true'
    SQLALCHEMY_POOL_SIZE = int(os.getenv('DB_POOL_SIZE', 10))
    SQLALCHEMY_POOL_RECYCLE = int(os.getenv('DB_POOL_RECYCLE', 3600))
    SQLALCHEMY_POOL_TIMEOUT = int(os.getenv('DB_POOL_TIMEOUT', 30))
    SQLALCHEMY_MAX_OVERFLOW = int(os.getenv('DB_MAX_OVERFLOW', 20))
    
    # File Upload Settings
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 
                                  os.getenv('UPLOAD_FOLDER', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'png,jpg,jpeg,gif,webp').split(','))
    
    # Domain Configuration
    MAIN_DOMAIN = os.getenv('MAIN_DOMAIN', 'localhost')
    MAIN_URL = os.getenv('MAIN_URL', 'http://localhost:5173')
    ADMIN_DOMAIN = os.getenv('ADMIN_DOMAIN', 'localhost')
    ADMIN_URL = os.getenv('ADMIN_URL', 'http://localhost:5174')
    API_DOMAIN = os.getenv('API_DOMAIN', 'localhost')
    
    # API_URL: Determine based on environment
    _default_api_url = 'http://localhost:5000' if os.getenv('FLASK_ENV') == 'development' else 'https://api.shopzenventures.shop'
    API_URL = os.getenv('API_URL', _default_api_url)
    
    # Upload URL Configuration (for serving uploaded files)
    UPLOAD_BASE_URL = os.getenv('UPLOAD_BASE_URL', f"{API_URL}/uploads")
    
    # CORS Settings
    _default_cors = 'http://localhost:5173,http://localhost:5174' if os.getenv('FLASK_ENV') == 'development' else 'https://shopzenventures.shop,https://admin.shopzenventures.shop'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', _default_cors).split(',')
    CORS_SUPPORTS_CREDENTIALS = os.getenv('CORS_SUPPORTS_CREDENTIALS', 'True').lower() == 'true'
    CORS_MAX_AGE = int(os.getenv('CORS_MAX_AGE', 3600))
    
    # Helper method to get full upload URL
    @staticmethod
    def get_upload_url(filename):
        """Generate full URL for uploaded file"""
        upload_base = os.getenv('UPLOAD_BASE_URL')
        if not upload_base:
            api_url = os.getenv('API_URL', 'https://api.shopzenventures.shop')
            upload_base = f"{api_url}/uploads"
        return f"{upload_base}/{filename}"
    
    # Application Settings
    ITEMS_PER_PAGE = int(os.getenv('ITEMS_PER_PAGE', 20))
    SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT', 60))
    
    # Logging Settings
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/ShopZen.log')
    LOG_SQL_QUERIES = os.getenv('LOG_SQL_QUERIES', 'False').lower() == 'true'
    
    # PayU Payment Gateway Settings
    PAYU_MERCHANT_KEY = os.getenv('PAYU_MERCHANT_KEY', '')
    PAYU_SALT = os.getenv('PAYU_SALT', '')
    PAYU_MODE = os.getenv('PAYU_MODE', 'test')  # test or production
    
    @staticmethod
    def get_payu_url():
        """Get PayU payment URL based on mode"""
        mode = os.getenv('PAYU_MODE', 'test')
        if mode == 'production':
            return 'https://secure.payu.in/_payment'
        return 'https://test.payu.in/_payment'
    
    @staticmethod
    def get_payu_verify_url():
        """Get PayU verify payment URL based on mode"""
        mode = os.getenv('PAYU_MODE', 'test')
        if mode == 'production':
            return 'https://info.payu.in/merchant/postservice.php?form=2'
        return 'https://test.payu.in/merchant/postservice.php?form=2'
    
    PAYU_PAYMENT_URL = get_payu_url.__func__()
    PAYU_VERIFY_URL = get_payu_verify_url.__func__()
    
    # MoneyOne Payment Gateway Settings
    MONEYONE_MERCHANT_ID = os.getenv('MONEYONE_MERCHANT_ID', '')
    MONEYONE_PASSWORD = os.getenv('MONEYONE_PASSWORD', '')
    MONEYONE_AUTH_KEY = os.getenv('MONEYONE_AUTH_KEY', '')
    MONEYONE_MODULE_SECRET = os.getenv('MONEYONE_MODULE_SECRET', '')
    MONEYONE_CALLBACK_URL = os.getenv('MONEYONE_CALLBACK_URL', 'https://api.moneyone.co.in/api/callback/sabpaisa-ShopZen/webhookhere')
    
    # SabPaisa Payment Gateway Settings
    SABPAISA_WEBHOOK_SECRET = os.getenv('SABPAISA_WEBHOOK_SECRET', '')
