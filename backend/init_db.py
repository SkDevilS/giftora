"""
Database Initialization Script for ShopZen Ventures
Creates all tables and initializes with default admin user
"""

from app import create_app
from models import db, User, Section, NavbarItem, Analytics
from datetime import datetime

def init_database():
    """Initialize database with tables and default data"""
    app = create_app()
    
    with app.app_context():
        print("Creating database tables...")
        db.create_all()
        print("✓ Database tables created successfully!")
        
        # Check if admin user already exists
        admin_email = 'admin@shopzenventures.shop'
        existing_admin = User.query.filter_by(email=admin_email).first()
        
        if not existing_admin:
            print(f"\nCreating default admin user...")
            admin = User(
                name='Admin',
                email=admin_email,
                role='admin',
                is_active=True,
                is_verified=True,
                email_verified_at=datetime.utcnow()
            )
            admin.set_password('admin@123')
            db.session.add(admin)
            db.session.commit()
            print(f"✓ Admin user created successfully!")
            print(f"  Email: {admin_email}")
            print(f"  Password: admin@123")
        else:
            print(f"\n✓ Admin user already exists: {admin_email}")
        
        # Create default sections if they don't exist
        default_sections = [
            {'name': 'Skincare', 'slug': 'skincare', 'description': 'Skincare products', 'display_order': 1},
            {'name': 'Haircare', 'slug': 'haircare', 'description': 'Haircare products', 'display_order': 2},
            {'name': 'Makeup', 'slug': 'makeup', 'description': 'Makeup products', 'display_order': 3},
            {'name': 'Fragrances', 'slug': 'fragrances', 'description': 'Perfumes and fragrances', 'display_order': 4},
            {'name': 'Personal Care', 'slug': 'personal-care', 'description': 'Personal care products', 'display_order': 5},
        ]
        
        print("\nCreating default sections...")
        for section_data in default_sections:
            existing_section = Section.query.filter_by(slug=section_data['slug']).first()
            if not existing_section:
                section = Section(**section_data)
                db.session.add(section)
                print(f"  ✓ Created section: {section_data['name']}")
        
        db.session.commit()
        print("✓ Default sections created successfully!")
        
        # Create default navbar items
        default_navbar = [
            {'label': 'Home', 'url': '/', 'display_order': 1},
            {'label': 'Shop', 'url': '/shop', 'display_order': 2},
            {'label': 'Categories', 'url': '#', 'display_order': 3},
            {'label': 'About', 'url': '/about', 'display_order': 4},
            {'label': 'Contact', 'url': '/contact', 'display_order': 5},
        ]
        
        print("\nCreating default navbar items...")
        for nav_data in default_navbar:
            existing_nav = NavbarItem.query.filter_by(label=nav_data['label']).first()
            if not existing_nav:
                nav_item = NavbarItem(**nav_data)
                db.session.add(nav_item)
                print(f"  ✓ Created navbar item: {nav_data['label']}")
        
        db.session.commit()
        print("✓ Default navbar items created successfully!")
        
        # Initialize analytics counters
        print("\nInitializing analytics counters...")
        views = Analytics.query.filter_by(metric_name='views').first()
        if not views:
            views = Analytics(metric_name='views', count=0)
            db.session.add(views)
            print("  ✓ Created views counter")
        else:
            print("  ✓ Views counter already exists")
        
        clicks = Analytics.query.filter_by(metric_name='clicks').first()
        if not clicks:
            clicks = Analytics(metric_name='clicks', count=0)
            db.session.add(clicks)
            print("  ✓ Created clicks counter")
        else:
            print("  ✓ Clicks counter already exists")
        
        db.session.commit()
        print("✓ Analytics counters initialized successfully!")
        
        print("\n" + "="*60)
        print("DATABASE INITIALIZATION COMPLETE!")
        print("="*60)
        print("\nYou can now start the application with:")
        print("  python app.py")
        print("\nAdmin Login Credentials:")
        print(f"  Email: {admin_email}")
        print("  Password: admin@123")
        print("\nIMPORTANT: Change the admin password after first login!")
        print("="*60)

if __name__ == '__main__':
    init_database()
