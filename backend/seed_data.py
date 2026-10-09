"""
Seed script to populate the database with initial data
Run this after init_db.py to add sample categories and products
"""

from app import create_app
from models import db, Section, Product, NavbarItem, Analytics
from datetime import datetime

def seed_database():
    app = create_app()
    
    with app.app_context():
        print("Starting database seeding...")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        NavbarItem.query.delete()
        Product.query.delete()
        Section.query.delete()
        db.session.commit()
        
        # Create Sections (Categories)
        print("Creating sections...")
        sections = [
            {
                'name': 'Beauty & Personal Care',
                'slug': 'beauty',
                'description': 'Skincare, makeup, and personal care products',
                'display_order': 0,
                'is_active': True
            },
            {
                'name': 'Hair Care',
                'slug': 'haircare',
                'description': 'Shampoos, conditioners, and hair treatments',
                'display_order': 1,
                'is_active': True
            },
            {
                'name': 'Skincare',
                'slug': 'skincare',
                'description': 'Face care, moisturizers, and treatments',
                'display_order': 2,
                'is_active': True
            },
            {
                'name': 'Fragrances',
                'slug': 'fragrances',
                'description': 'Perfumes and body sprays',
                'display_order': 3,
                'is_active': True
            },
            {
                'name': 'Oral Care',
                'slug': 'oral-care',
                'description': 'Toothpaste, toothbrushes, and dental care',
                'display_order': 4,
                'is_active': True
            },
        ]
        
        section_objects = {}
        for section_data in sections:
            section = Section(**section_data)
            db.session.add(section)
            db.session.flush()  # Get the ID
            section_objects[section_data['slug']] = section
            print(f"  Created section: {section.name}")
        
        db.session.commit()
        
        # Create Navigation Items
        print("Creating navigation items...")
        nav_items = [
            {'label': 'Home', 'url': '/', 'display_order': 0, 'is_active': True},
            {'label': 'Beauty', 'url': '/category/beauty', 'display_order': 1, 'is_active': True},
            {'label': 'Hair Care', 'url': '/category/haircare', 'display_order': 2, 'is_active': True},
            {'label': 'Skincare', 'url': '/category/skincare', 'display_order': 3, 'is_active': True},
            {'label': 'Fragrances', 'url': '/category/fragrances', 'display_order': 4, 'is_active': True},
        ]
        
        for nav_data in nav_items:
            nav_item = NavbarItem(**nav_data)
            db.session.add(nav_item)
            print(f"  Created nav item: {nav_item.label}")
        
        db.session.commit()
        
        # Create Sample Products
        print("Creating sample products...")
        products = [
            # Beauty Products
            {
                'sku': 'BEAUTY001',
                'title': 'Lakme Face Wash',
                'slug': 'lakme-face-wash',
                'description': 'Gentle face wash for all skin types',
                'price': 199.00,
                'original_price': 249.00,
                'section_id': section_objects['beauty'].id,
                'stock': 50,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'BEAUTY002',
                'title': 'Lakme Lip Color',
                'slug': 'lakme-lip-color',
                'description': 'Long-lasting lip color',
                'price': 299.00,
                'original_price': 399.00,
                'section_id': section_objects['beauty'].id,
                'stock': 30,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'BEAUTY003',
                'title': 'MAC Lipstick',
                'slug': 'mac-lipstick',
                'description': 'Premium matte lipstick',
                'price': 1899.00,
                'original_price': 2199.00,
                'section_id': section_objects['beauty'].id,
                'stock': 20,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'BEAUTY004',
                'title': 'Nykaa Makeup Kit',
                'slug': 'nykaa-makeup-kit',
                'description': 'Complete makeup kit for beginners',
                'price': 1499.00,
                'original_price': 1999.00,
                'section_id': section_objects['beauty'].id,
                'stock': 15,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'BEAUTY005',
                'title': 'Sugar Makeup Kit',
                'slug': 'sugar-makeup-kit',
                'description': 'Professional makeup kit',
                'price': 2499.00,
                'original_price': 2999.00,
                'section_id': section_objects['beauty'].id,
                'stock': 10,
                'is_active': True,
                'is_on_sale': False,
            },
            
            # Hair Care Products
            {
                'sku': 'HAIR001',
                'title': 'Loreal Shampoo',
                'slug': 'loreal-shampoo',
                'description': 'Repair and shine shampoo',
                'price': 399.00,
                'original_price': 499.00,
                'section_id': section_objects['haircare'].id,
                'stock': 40,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'HAIR002',
                'title': 'Loreal Oil Control Shampoo',
                'slug': 'loreal-oil-control-shampoo',
                'description': 'Controls oil and adds volume',
                'price': 449.00,
                'original_price': 549.00,
                'section_id': section_objects['haircare'].id,
                'stock': 35,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'HAIR003',
                'title': 'Loreal Scalp Advanced',
                'slug': 'loreal-scalp-advanced',
                'description': 'Advanced scalp treatment',
                'price': 599.00,
                'original_price': 699.00,
                'section_id': section_objects['haircare'].id,
                'stock': 25,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'HAIR004',
                'title': 'Sunsilk Shampoo',
                'slug': 'sunsilk-shampoo',
                'description': 'Smooth and manageable hair',
                'price': 199.00,
                'original_price': 249.00,
                'section_id': section_objects['haircare'].id,
                'stock': 60,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'HAIR005',
                'title': 'Dove Shampoo',
                'slug': 'dove-shampoo',
                'description': 'Nourishing care shampoo',
                'price': 249.00,
                'original_price': 299.00,
                'section_id': section_objects['haircare'].id,
                'stock': 45,
                'is_active': True,
                'is_on_sale': False,
            },
            
            # Skincare Products
            {
                'sku': 'SKIN001',
                'title': 'Mamaearth Face Cream',
                'slug': 'mamaearth-face-cream',
                'description': 'Natural face cream with vitamin C',
                'price': 399.00,
                'original_price': 499.00,
                'section_id': section_objects['skincare'].id,
                'stock': 30,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'SKIN002',
                'title': 'Ponds Powder',
                'slug': 'ponds-powder',
                'description': 'Smooth and soft powder',
                'price': 149.00,
                'original_price': 199.00,
                'section_id': section_objects['skincare'].id,
                'stock': 50,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'SKIN003',
                'title': 'VLCC Cleansing Milk',
                'slug': 'vlcc-cleansing-milk',
                'description': 'Deep cleansing milk',
                'price': 299.00,
                'original_price': 349.00,
                'section_id': section_objects['skincare'].id,
                'stock': 25,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'SKIN004',
                'title': 'Vicco Cream',
                'slug': 'vicco-cream',
                'description': 'Ayurvedic skin cream',
                'price': 99.00,
                'original_price': 129.00,
                'section_id': section_objects['skincare'].id,
                'stock': 40,
                'is_active': True,
                'is_on_sale': False,
            },
            
            # Fragrances
            {
                'sku': 'FRAG001',
                'title': 'Denver Spray',
                'slug': 'denver-spray',
                'description': 'Long-lasting body spray',
                'price': 199.00,
                'original_price': 249.00,
                'section_id': section_objects['fragrances'].id,
                'stock': 35,
                'is_active': True,
                'is_on_sale': True,
            },
            {
                'sku': 'FRAG002',
                'title': 'Bombay Shaving Spray',
                'slug': 'bombay-shaving-spray',
                'description': 'Premium body spray',
                'price': 299.00,
                'original_price': 399.00,
                'section_id': section_objects['fragrances'].id,
                'stock': 25,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'FRAG003',
                'title': 'Yardley Spray',
                'slug': 'yardley-spray',
                'description': 'Classic fragrance spray',
                'price': 349.00,
                'original_price': 449.00,
                'section_id': section_objects['fragrances'].id,
                'stock': 20,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'FRAG004',
                'title': 'Watta Girl Spray',
                'slug': 'watta-girl-spray',
                'description': 'Floral fragrance spray',
                'price': 249.00,
                'original_price': 299.00,
                'section_id': section_objects['fragrances'].id,
                'stock': 30,
                'is_active': True,
                'is_on_sale': False,
            },
            
            # Oral Care
            {
                'sku': 'ORAL001',
                'title': 'Dant Kanti Toothpaste',
                'slug': 'dant-kanti-toothpaste',
                'description': 'Ayurvedic toothpaste',
                'price': 89.00,
                'original_price': 99.00,
                'section_id': section_objects['oral-care'].id,
                'stock': 100,
                'is_active': True,
                'is_on_sale': False,
            },
            {
                'sku': 'ORAL002',
                'title': 'Toothbrush Combo',
                'slug': 'toothbrush-combo',
                'description': 'Pack of 2 toothbrushes',
                'price': 99.00,
                'original_price': 149.00,
                'section_id': section_objects['oral-care'].id,
                'stock': 80,
                'is_active': True,
                'is_on_sale': False,
            },
        ]
        
        for product_data in products:
            product = Product(**product_data)
            db.session.add(product)
            print(f"  Created product: {product.title}")
        
        db.session.commit()
        
        # Initialize analytics counters
        print("\nInitializing analytics counters...")
        views = Analytics.query.filter_by(metric_name='views').first()
        if not views:
            views = Analytics(metric_name='views', count=10000)
            db.session.add(views)
            print("  ✓ Created views counter with initial value: 10,000")
        
        clicks = Analytics.query.filter_by(metric_name='clicks').first()
        if not clicks:
            clicks = Analytics(metric_name='clicks', count=125000)
            db.session.add(clicks)
            print("  ✓ Created clicks counter with initial value: 125,000")
        
        db.session.commit()
        
        print("\n✅ Database seeding completed successfully!")
        print(f"   - Created {len(sections)} sections")
        print(f"   - Created {len(nav_items)} navigation items")
        print(f"   - Created {len(products)} products")
        print("\nYou can now:")
        print("1. Login to admin dashboard: http://localhost:3000/admin/login")
        print("2. View the website: http://localhost:3000")
        print("3. Add more products and categories from the admin panel")

if __name__ == '__main__':
    seed_database()
