"""
Migration script to add moneyone_txnid field to orders table
"""
from app import create_app
from models import db
from sqlalchemy import text

def migrate():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists
            result = db.session.execute(text(
                "SELECT COUNT(*) FROM information_schema.COLUMNS "
                "WHERE TABLE_SCHEMA = DATABASE() "
                "AND TABLE_NAME = 'orders' "
                "AND COLUMN_NAME = 'moneyone_txnid'"
            ))
            exists = result.scalar() > 0
            
            if exists:
                print("✓ Column 'moneyone_txnid' already exists in orders table")
                return
            
            # Add the column
            print("Adding 'moneyone_txnid' column to orders table...")
            db.session.execute(text(
                "ALTER TABLE orders ADD COLUMN moneyone_txnid VARCHAR(100) UNIQUE"
            ))
            
            # Add index
            print("Adding index on 'moneyone_txnid'...")
            db.session.execute(text(
                "CREATE INDEX idx_orders_moneyone_txnid ON orders(moneyone_txnid)"
            ))
            
            db.session.commit()
            print("✓ Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"✗ Migration failed: {str(e)}")
            raise

if __name__ == '__main__':
    migrate()
