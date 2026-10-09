"""
WSGI entry point for production deployment
"""
from app import create_app
import os

# Load production environment
os.environ['FLASK_ENV'] = 'production'

# Create Flask application
app = create_app()

if __name__ == "__main__":
    app.run()
