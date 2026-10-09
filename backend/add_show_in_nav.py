"""
Migration script to add show_in_nav column to sections table
"""
from app import create_app
from models import db, Section

def add_show_in_nav_column():
    app = create_app()
    
    with app.app_context():
        try:
            # Check if column already exists
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            columns = [col['name'] for col in inspector.get_columns('sections')]
            
            if 'show_in_nav' not in columns:
                print("Adding show_in_nav column to sections table...")
                
                # Add the column using raw SQL
                with db.engine.connect() as conn:
                    conn.execute(db.text('ALTER TABLE sections ADD COLUMN show_in_nav BOOLEAN DEFAULT TRUE'))
                    conn.commit()
                
                print("✓ Column added successfully")
                
                # Update all existing sections to show in nav by default
                Section.query.update({'show_in_nav': True})
                db.session.commit()
                print("✓ All existing sections set to show in navigation")
            else:
                print("✓ Column show_in_nav already exists")
                
        except Exception as e:
            print(f"✗ Error: {e}")
            db.session.rollback()

if __name__ == '__main__':
    add_show_in_nav_column()
