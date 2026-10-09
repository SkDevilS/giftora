"""
Simple migration to add show_in_nav column to sections table
Run this script: python migrate_show_in_nav.py
"""
import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def migrate():
    try:
        # Get database config from environment
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '3306')
        db_name = os.getenv('DB_NAME', 'ShopZen_pharma_db')
        db_user = os.getenv('DB_USER', 'root')
        db_password = os.getenv('DB_PASSWORD', '')
        
        # Connect to database
        conn = mysql.connector.connect(
            host=db_host,
            port=int(db_port),
            user=db_user,
            password=db_password,
            database=db_name
        )
        cursor = conn.cursor()
        
        # Check if column exists
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = %s 
            AND TABLE_NAME = 'sections' 
            AND COLUMN_NAME = 'show_in_nav'
        """, (db_name,))
        
        exists = cursor.fetchone()[0]
        
        if exists == 0:
            print("Adding show_in_nav column...")
            cursor.execute("""
                ALTER TABLE sections 
                ADD COLUMN show_in_nav TINYINT(1) DEFAULT 1 AFTER is_active
            """)
            conn.commit()
            print("✓ Column added successfully")
            
            # Update all existing sections
            cursor.execute("UPDATE sections SET show_in_nav = 1 WHERE show_in_nav IS NULL")
            conn.commit()
            print("✓ All existing sections set to show in navigation")
        else:
            print("✓ Column show_in_nav already exists")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    migrate()
