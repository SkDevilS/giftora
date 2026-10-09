"""
Drop all tables and recreate them
"""

from app import create_app
from models import db

def drop_and_recreate():
    app = create_app()
    
    with app.app_context():
        print("Dropping all tables...")
        db.drop_all()
        print("✓ All tables dropped!")
        
        print("\nCreating all tables...")
        db.create_all()
        print("✓ All tables created!")
        
        print("\n✅ Database reset complete!")
        print("Now run: python init_db.py")

if __name__ == '__main__':
    drop_and_recreate()
