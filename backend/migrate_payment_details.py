"""
Migration script to add UTR, Ref No, and Transaction Timestamp fields to payment_details table
"""
from app import create_app
from models import db
from sqlalchemy import text

def migrate_payment_details():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if columns already exist
            inspector = db.inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('payment_details')]
            
            # Add UTR column if it doesn't exist
            if 'utr' not in columns:
                print("Adding 'utr' column to payment_details table...")
                db.session.execute(text('ALTER TABLE payment_details ADD COLUMN utr VARCHAR(100)'))
                print("✓ Added 'utr' column")
            else:
                print("✓ 'utr' column already exists")
            
            # Add ref_no column if it doesn't exist
            if 'ref_no' not in columns:
                print("Adding 'ref_no' column to payment_details table...")
                db.session.execute(text('ALTER TABLE payment_details ADD COLUMN ref_no VARCHAR(100)'))
                print("✓ Added 'ref_no' column")
            else:
                print("✓ 'ref_no' column already exists")
            
            # Add transaction_timestamp column if it doesn't exist
            if 'transaction_timestamp' not in columns:
                print("Adding 'transaction_timestamp' column to payment_details table...")
                db.session.execute(text('ALTER TABLE payment_details ADD COLUMN transaction_timestamp DATETIME'))
                print("✓ Added 'transaction_timestamp' column")
            else:
                print("✓ 'transaction_timestamp' column already exists")
            
            db.session.commit()
            print("\n✓ Migration completed successfully!")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n✗ Migration failed: {str(e)}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    migrate_payment_details()
