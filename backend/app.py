import os
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth import auth_bp
from routes.admin import admin_bp
from routes.products import products_bp
from routes.cart import cart_bp
from routes.wishlist import wishlist_bp
from routes.orders import orders_bp
from routes.addresses import addresses_bp
from routes.analytics import analytics_bp
from routes.navbar import navbar_bp
from routes.auto_order import auto_order_bp
from routes.payu import payu_bp
from routes.moneyone import moneyone_bp
from routes.sabpaisa import sabpaisa_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions with CORS configuration from environment
    cors_origins = app.config.get('CORS_ORIGINS', ['*'])
    CORS(app, 
         resources={r"/api/*": {"origins": cors_origins}},
         supports_credentials=app.config.get('CORS_SUPPORTS_CREDENTIALS', True),
         max_age=app.config.get('CORS_MAX_AGE', 3600),
         allow_headers=['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
         expose_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'])
    
    db.init_app(app)
    JWTManager(app)
    
    # Log CORS configuration in debug mode
    if app.config.get('DEBUG'):
        app.logger.info(f"CORS Origins configured: {cors_origins}")
        app.logger.info(f"API URL: {app.config.get('API_URL')}")
        app.logger.info(f"Upload Base URL: {app.config.get('UPLOAD_BASE_URL')}")
    
    # Create upload folder
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'products'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'bulk_images'), exist_ok=True)
    
    # Register blueprints with OPTIONS support
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(wishlist_bp, url_prefix='/api/wishlist')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    app.register_blueprint(addresses_bp, url_prefix='/api/addresses')
    app.register_blueprint(analytics_bp, url_prefix='/api')
    app.register_blueprint(navbar_bp, url_prefix='/api')
    app.register_blueprint(auto_order_bp, url_prefix='/api/auto-order')
    app.register_blueprint(payu_bp, url_prefix='/api/payu')
    app.register_blueprint(moneyone_bp, url_prefix='/api/moneyone')
    app.register_blueprint(sabpaisa_bp, url_prefix='/api/callback/sabpaisa')
    
    # Add OPTIONS handler for all routes
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    
    # Serve uploaded files
    @app.route('/api/admin/uploads/<path:filename>')
    def uploaded_file_api(filename):
        try:
            response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
            response.headers['Cache-Control'] = 'public, max-age=3600'
            return response
        except Exception as e:
            print(f"Error serving file {filename}: {e}")
            return jsonify({'error': 'File not found'}), 404
    
    # Alternative route for direct access
    @app.route('/uploads/<path:filename>')
    def uploaded_file_direct(filename):
        try:
            response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
            response.headers['Cache-Control'] = 'public, max-age=3600'
            return response
        except Exception as e:
            print(f"Error serving file {filename}: {e}")
            return jsonify({'error': 'File not found'}), 404
    
    # Health check
    @app.route('/api/health')
    def health():
        return jsonify({'status': 'ok', 'message': 'ShopZen Ventures API is running'}), 200
    
    # Debug endpoint for upload configuration
    @app.route('/api/debug/upload-config')
    def debug_upload_config():
        upload_folder = app.config['UPLOAD_FOLDER']
        products_folder = os.path.join(upload_folder, 'products')
        
        files_in_products = []
        if os.path.exists(products_folder):
            files_in_products = os.listdir(products_folder)
        
        upload_base_url = app.config.get('UPLOAD_BASE_URL')
        if not upload_base_url:
            api_url = app.config.get('API_URL', 'http://localhost:5000')
            upload_base_url = f"{api_url}/uploads"
        
        return jsonify({
            'upload_folder': upload_folder,
            'upload_folder_exists': os.path.exists(upload_folder),
            'products_folder_exists': os.path.exists(products_folder),
            'files_in_products': files_in_products[:10],
            'max_content_length': app.config['MAX_CONTENT_LENGTH'],
            'allowed_extensions': list(app.config['ALLOWED_EXTENSIONS']),
            'upload_base_url': upload_base_url,
            'sample_urls': [
                f"{upload_base_url}/products/{f}" for f in files_in_products[:3]
            ]
        })
    
    # Public sections endpoint
    @app.route('/api/sections')
    def get_sections():
        from models import Section
        sections = Section.query.filter_by(is_active=True).order_by(Section.display_order).all()
        return jsonify([section.to_dict() for section in sections])
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

# Create app instance for gunicorn
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")
    app.run(debug=True, host='0.0.0.0', port=5000)
