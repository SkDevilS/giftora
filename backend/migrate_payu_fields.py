"""
Migration script to add PayU payment gateway fields to database
Run this script to update your existing database with PayU support
"""
from app import create_app
from models import db
from sqlalchemy import text

def migrate_payu_fields():
    """Add PayU fields to orders and payment_details tables"""
    app = create_app()
    
    with app.app_context():
        try:
            print("Starting PayU fields migration...")
            
            # Add PayU fields to orders table
            print("Adding PayU fields to orders table...")
            
            # Check if columns already exist
            result = db.session.execute(text(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'orders' AND COLUMN_NAME IN ('payu_txnid', 'payu_mihpayid')"
            ))
            existing_columns = [row[0] for row in result]
            
            if 'payu_txnid' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE orders ADD COLUMN payu_txnid VARCHAR(100) UNIQUE"
                ))
                print("✓ Added payu_txnid column to orders table")
            else:
                print("- payu_txnid column already exists")
            
            if 'payu_mihpayid' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE orders ADD COLUMN payu_mihpayid VARCHAR(100)"
                ))
                print("✓ Added payu_mihpayid column to orders table")
            else:
                print("- payu_mihpayid column already exists")
            
            # Add index on payu_txnid
            try:
                db.session.execute(text(
                    "CREATE INDEX idx_orders_payu_txnid ON orders(payu_txnid)"
                ))
                print("✓ Created index on payu_txnid")
            except Exception as e:
                if 'Duplicate key name' in str(e):
                    print("- Index on payu_txnid already exists")
                else:
                    raise
            
            # Add index on payu_mihpayid
            try:
                db.session.execute(text(
                    "CREATE INDEX idx_orders_payu_mihpayid ON orders(payu_mihpayid)"
                ))
                print("✓ Created index on payu_mihpayid")
            except Exception as e:
                if 'Duplicate key name' in str(e):
                    print("- Index on payu_mihpayid already exists")
                else:
                    raise
            
            # Add PayU fields to payment_details table
            print("\nAdding PayU fields to payment_details table...")
            
            result = db.session.execute(text(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS "
                "WHERE TABLE_NAME = 'payment_details' AND COLUMN_NAME IN "
                "('payu_mode', 'payu_bank_ref_num', 'payu_bankcode', 'payu_error', 'payu_error_message')"
            ))
            existing_columns = [row[0] for row in result]
            
            if 'payu_mode' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE payment_details ADD COLUMN payu_mode VARCHAR(50)"
                ))
                print("✓ Added payu_mode column to payment_details table")
            else:
                print("- payu_mode column already exists")
            
            if 'payu_bank_ref_num' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE payment_details ADD COLUMN payu_bank_ref_num VARCHAR(100)"
                ))
                print("✓ Added payu_bank_ref_num column to payment_details table")
            else:
                print("- payu_bank_ref_num column already exists")
            
            if 'payu_bankcode' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE payment_details ADD COLUMN payu_bankcode VARCHAR(50)"
                ))
                print("✓ Added payu_bankcode column to payment_details table")
            else:
                print("- payu_bankcode column already exists")
            
            if 'payu_error' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE payment_details ADD COLUMN payu_error VARCHAR(50)"
                ))
                print("✓ Added payu_error column to payment_details table")
            else:
                print("- payu_error column already exists")
            
            if 'payu_error_message' not in existing_columns:
                db.session.execute(text(
                    "ALTER TABLE payment_details ADD COLUMN payu_error_message TEXT"
                ))
                print("✓ Added payu_error_message column to payment_details table")
            else:
                print("- payu_error_message column already exists")
            
            # Commit all changes
            db.session.commit()
            
            print("\n✅ PayU fields migration completed successfully!")
            print("\nNext steps:")
            print("1. Add your PayU credentials to backend/.env file:")
            print("   PAYU_MERCHANT_KEY=your_merchant_key")
            print("   PAYU_SALT=your_salt")
            print("   PAYU_MODE=test  # or 'production' for live")
            print("\n2. Restart your backend server")
            print("\n3. Test the payment flow with PayU test credentials")
            
        except Exception as e:
            db.session.rollback()
            print(f"\n❌ Error during migration: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

if __name__ == '__main__':
    migrate_payu_fields()
