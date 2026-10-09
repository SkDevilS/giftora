from flask import Blueprint, request, jsonify, current_app, send_from_directory, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Section, Product, CartItem, WishlistItem, Order, OrderItem, Address, PaymentDetail
from functools import wraps
from werkzeug.utils import secure_filename
from datetime import datetime
import json
import os
import uuid
from PIL import Image
import pandas as pd

admin_bp = Blueprint('admin', __name__)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Allow OPTIONS requests without authentication
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
        
        # For other methods, require JWT and admin role
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        # Convert string identity back to integer
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        user = db.session.get(User, user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_image(file, folder='products'):
    """Save uploaded image and return the filename"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        name, ext = os.path.splitext(filename)
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        
        # Create folder if it doesn't exist
        upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], folder)
        os.makedirs(upload_path, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_path, unique_filename)
        file.save(file_path)
        
        print(f"Image saved to: {file_path}")  # Debug log
        
        # Optimize image
        try:
            with Image.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large (max 1200px width)
                if img.width > 1200:
                    ratio = 1200 / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, 'JPEG', quality=85, optimize=True)
        except Exception as e:
            print(f"Image optimization failed: {e}")
        
        # Return URL using UPLOAD_BASE_URL from config
        upload_base_url = current_app.config.get('UPLOAD_BASE_URL')
        if not upload_base_url:
            # Fallback to API_URL + /uploads (no hardcoded localhost)
            api_url = current_app.config.get('API_URL')
            if not api_url:
                # Last resort: construct from request context
                from flask import request
                api_url = f"{request.scheme}://{request.host}"
            upload_base_url = f"{api_url}/uploads"
        
        image_url = f"{upload_base_url}/{folder}/{unique_filename}"
        print(f"Returning image URL: {image_url}")  # Debug log
        return image_url
    return None

# File upload endpoint
@admin_bp.route('/upload-image', methods=['POST', 'OPTIONS'])
@admin_required
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    image_url = save_image(file)
    if image_url:
        return jsonify({'image_url': image_url}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400



# User Management
@admin_bp.route('/users', methods=['GET', 'OPTIONS'])
@admin_required
def get_users():
    # Get pagination parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '', type=str)
    role = request.args.get('role', '', type=str)
    
    # Build query
    query = User.query
    
    # Apply filters
    if search:
        query = query.filter(
            (User.name.ilike(f'%{search}%')) | 
            (User.email.ilike(f'%{search}%'))
        )
    
    if role and role != 'all':
        query = query.filter(User.role == role)
    
    # Paginate
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'users': [user.to_dict() for user in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': page
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user(user_id):
    from models import Address
    
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user_data = user.to_dict()
    
    # Include addresses for customers
    if user.role == 'customer':
        addresses = Address.query.filter_by(user_id=user_id).all()
        user_data['addresses'] = [address.to_dict() for address in addresses]
    
    return jsonify({'user': user_data}), 200

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'].lower(),
        role=data.get('role', 'customer'),
        is_active=data.get('is_active', True)
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user': user.to_dict()}), 201

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Basic Information
    if 'name' in data:
        name = data['name'].strip()
        if len(name) < 2:
            return jsonify({'error': 'Name must be at least 2 characters long'}), 400
        user.name = name
    
    if 'email' in data:
        email = data['email'].strip().lower()
        existing = User.query.filter_by(email=email).first()
        if existing and existing.id != user_id:
            return jsonify({'error': 'Email already exists'}), 400
        user.email = email
    
    # Contact Information
    if 'phone' in data:
        user.phone = data['phone'].strip() if data['phone'] else None
    
    # System Fields (admin only)
    if 'role' in data:
        user.role = data['role']
    
    if 'is_active' in data:
        user.is_active = data['is_active']
    
    if 'is_verified' in data:
        user.is_verified = data['is_verified']
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': user.to_dict(include_sensitive=True)}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update user'}), 500

@admin_bp.route('/users/<int:user_id>/reset-password', methods=['POST'])
@admin_required
def reset_user_password(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    if not data or not data.get('new_password'):
        return jsonify({'error': 'New password required'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password reset successfully'}), 200

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_user_status(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.is_active = not user.is_active
    db.session.commit()
    
    return jsonify({
        'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deleting yourself
    current_user_id = get_jwt_identity()
    current_user_id = int(current_user_id) if isinstance(current_user_id, str) else current_user_id
    if user_id == current_user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    try:
        user_name = user.name
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'User "{user_name}" deleted successfully'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete user',
            'details': str(e)
        }), 500

# Section Management
@admin_bp.route('/sections', methods=['GET', 'OPTIONS'])
@admin_required
def get_sections():
    sections = Section.query.order_by(Section.display_order).all()
    return jsonify({'sections': [section.to_dict() for section in sections]}), 200

@admin_bp.route('/sections', methods=['POST', 'OPTIONS'])
@admin_required
def create_section():
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('slug'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Section.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Section slug already exists'}), 400
    
    section = Section(
        name=data['name'],
        slug=data['slug'],
        description=data.get('description'),
        display_order=data.get('display_order', 0),
        is_active=data.get('is_active', True),
        show_in_nav=data.get('show_in_nav', True)
    )
    
    db.session.add(section)
    db.session.commit()
    
    return jsonify({'message': 'Section created successfully', 'section': section.to_dict()}), 201

@admin_bp.route('/sections/<int:section_id>', methods=['PUT', 'OPTIONS'])
@admin_required
def update_section(section_id):
    section = db.session.get(Section, section_id)
    if not section:
        return jsonify({'error': 'Section not found'}), 404
    
    data = request.get_json()
    
    if 'name' in data:
        section.name = data['name']
    if 'slug' in data:
        existing = Section.query.filter_by(slug=data['slug']).first()
        if existing and existing.id != section_id:
            return jsonify({'error': 'Slug already exists'}), 400
        section.slug = data['slug']
    if 'description' in data:
        section.description = data['description']
    if 'display_order' in data:
        section.display_order = data['display_order']
    if 'is_active' in data:
        section.is_active = data['is_active']
    if 'show_in_nav' in data:
        section.show_in_nav = data['show_in_nav']
    
    db.session.commit()
    return jsonify({'message': 'Section updated successfully', 'section': section.to_dict()}), 200

@admin_bp.route('/sections/<int:section_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_section(section_id):
    try:
        section = db.session.get(Section, section_id)
        if not section:
            return jsonify({'error': 'Section not found'}), 404
        
        # Check if this is the last section
        total_sections = Section.query.count()
        if total_sections <= 1:
            return jsonify({'error': 'Cannot delete the last category. At least one category must exist.'}), 400
        
        # Get product IDs before we start modifying relationships
        product_ids = [p.id for p in section.products]
        product_count = len(product_ids)
        
        # Always move products to miscellaneous if section has products
        if product_count > 0:
            # Find or create a "Miscellaneous" section to move products to
            misc_section = Section.query.filter_by(slug='miscellaneous').first()
            if not misc_section:
                # Create miscellaneous section if it doesn't exist
                misc_section = Section(
                    name='Miscellaneous',
                    slug='miscellaneous',
                    description='Uncategorized products',
                    display_order=999,
                    is_active=True
                )
                # Set show_in_nav if the attribute exists
                if hasattr(misc_section, 'show_in_nav'):
                    misc_section.show_in_nav = False
                
                db.session.add(misc_section)
                db.session.commit()  # Commit to get the ID
                print(f"Created Miscellaneous section with ID: {misc_section.id}")
            
            # Move all products to miscellaneous section using raw SQL to avoid ORM issues
            db.session.execute(
                db.text('UPDATE products SET section_id = :misc_id WHERE id IN :product_ids'),
                {'misc_id': misc_section.id, 'product_ids': tuple(product_ids)}
            )
            db.session.commit()  # Commit the product moves
            
            print(f"Moved {product_count} products to Miscellaneous section")
        
        # Now delete the section (products have been moved)
        db.session.delete(section)
        db.session.commit()
        
        return jsonify({
            'message': 'Category deleted successfully',
            'products_moved': product_count
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting section: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to delete category: {str(e)}'}), 500

@admin_bp.route('/sections/<int:section_id>/toggle-status', methods=['POST', 'OPTIONS'])
@admin_required
def toggle_section_status(section_id):
    section = db.session.get(Section, section_id)
    if not section:
        return jsonify({'error': 'Section not found'}), 404
    
    section.is_active = not section.is_active
    db.session.commit()
    
    return jsonify({'message': 'Section status updated successfully', 'section': section.to_dict()}), 200

# Product Management
@admin_bp.route('/products', methods=['GET', 'OPTIONS'])
@admin_required
def get_all_products():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    section_id = request.args.get('section_id', type=int)
    search = request.args.get('search', '')
    
    query = Product.query
    
    if section_id:
        query = query.filter_by(section_id=section_id)
    
    if search:
        query = query.filter(
            db.or_(
                Product.title.contains(search),
                Product.sku.contains(search),
                Product.description.contains(search)
            )
        )
    
    products = query.order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    }), 200

@admin_bp.route('/products/<int:product_id>', methods=['GET', 'OPTIONS'])
@admin_required
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict()}), 200

@admin_bp.route('/products', methods=['POST', 'OPTIONS'])
@admin_required
def create_product():
    data = request.get_json()
    
    required_fields = ['sku', 'title', 'slug', 'price', 'section_id']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Product.query.filter_by(sku=data['sku']).first():
        return jsonify({'error': 'SKU already exists'}), 400
    
    if Product.query.filter_by(slug=data['slug']).first():
        return jsonify({'error': 'Slug already exists'}), 400
    
    section = db.session.get(Section, data['section_id'])
    if not section:
        return jsonify({'error': 'Section not found'}), 404
    
    product = Product(
        sku=data['sku'],
        title=data['title'],
        slug=data['slug'],
        description=data.get('description'),
        price=data['price'],
        original_price=data.get('original_price'),
        is_on_sale=data.get('is_on_sale', False),
        stock=data.get('stock', 0),
        section_id=data['section_id'],
        images=json.dumps(data.get('images', [])),
        sizes=json.dumps(data.get('sizes', [])),
        colors=json.dumps(data.get('colors', [])),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product created successfully', 'product': product.to_dict()}), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT', 'OPTIONS'])
@admin_required
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    data = request.get_json()
    
    if 'sku' in data:
        existing = Product.query.filter_by(sku=data['sku']).first()
        if existing and existing.id != product_id:
            return jsonify({'error': 'SKU already exists'}), 400
        product.sku = data['sku']
    
    if 'slug' in data:
        existing = Product.query.filter_by(slug=data['slug']).first()
        if existing and existing.id != product_id:
            return jsonify({'error': 'Slug already exists'}), 400
        product.slug = data['slug']
    
    if 'title' in data:
        product.title = data['title']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'original_price' in data:
        product.original_price = data['original_price']
    if 'is_on_sale' in data:
        product.is_on_sale = data['is_on_sale']
    if 'stock' in data:
        product.stock = data['stock']
    if 'section_id' in data:
        section = db.session.get(Section, data['section_id'])
        if not section:
            return jsonify({'error': 'Section not found'}), 404
        product.section_id = data['section_id']
    if 'images' in data:
        product.images = json.dumps(data['images'])
    if 'sizes' in data:
        product.sizes = json.dumps(data['sizes'])
    if 'colors' in data:
        product.colors = json.dumps(data['colors'])
    if 'is_active' in data:
        product.is_active = data['is_active']
    
    db.session.commit()
    return jsonify({'message': 'Product updated successfully', 'product': product.to_dict()}), 200

@admin_bp.route('/products/<int:product_id>/toggle-status', methods=['POST', 'OPTIONS'])
@admin_required
def toggle_product_status(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    product.is_active = not product.is_active
    db.session.commit()
    
    return jsonify({
        'message': f'Product {"activated" if product.is_active else "deactivated"} successfully',
        'product': product.to_dict()
    }), 200

# Dashboard Stats
@admin_bp.route('/stats', methods=['GET', 'OPTIONS'])
@admin_required
def get_stats():
    from models import Order
    
    total_users = User.query.filter_by(role='customer').count()
    total_products = Product.query.count()
    total_sections = Section.query.count()
    total_orders = Order.query.count()
    
    return jsonify({
        'total_users': total_users,
        'total_products': total_products,
        'total_sections': total_sections,
        'total_orders': total_orders
    }), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE', 'OPTIONS'])
@admin_required
def delete_product(product_id):
    try:
        product = db.session.get(Product, product_id)
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Check if product has been ordered
        from models import OrderItem
        order_items = OrderItem.query.filter_by(product_id=product_id).first()
        
        if order_items:
            # Product has been ordered, cannot delete - deactivate instead
            product.is_active = False
            db.session.commit()
            return jsonify({
                'message': 'Product has been ordered and cannot be deleted. It has been deactivated instead.',
                'deactivated': True
            }), 200
        
        # Delete related items first
        try:
            # Delete cart items
            CartItem.query.filter_by(product_id=product_id).delete()
            
            # Delete wishlist items
            WishlistItem.query.filter_by(product_id=product_id).delete()
            
        except Exception as e:
            print(f"Error deleting related items: {e}")
        
        # Delete associated image files
        try:
            if product.images:
                images = json.loads(product.images) if isinstance(product.images, str) else product.images
                for image_url in images:
                    if '/uploads/' in image_url:
                        # Extract filename from URL
                        filename = image_url.split('/uploads/')[-1]
                        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                        if os.path.exists(file_path):
                            os.remove(file_path)
                            print(f"Deleted image file: {file_path}")
        except Exception as e:
            print(f"Error deleting image files: {e}")
            # Continue with product deletion even if image deletion fails
        
        # Delete the product
        db.session.delete(product)
        db.session.commit()
        
        return jsonify({'message': 'Product deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error deleting product: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to delete product: {str(e)}'}), 500

@admin_bp.route('/products/bulk-upload', methods=['POST', 'OPTIONS'])
@admin_required
def bulk_upload_products_csv():
    """Bulk upload products from CSV with images"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No CSV file provided'}), 400
        
        csv_file = request.files['file']
        if not csv_file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be a CSV file'}), 400
        
        # Read CSV
        import csv
        import io
        
        raw_content = csv_file.read()
        try:
            csv_content = raw_content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                csv_content = raw_content.decode('cp1252')
            except UnicodeDecodeError:
                csv_content = raw_content.decode('latin-1', errors='replace')
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        # Get uploaded images
        images = request.files.getlist('images')
        image_dict = {img.filename: img for img in images}
        
        created_count = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Skip comment lines
                if row.get('SKU', '').startswith('#'):
                    continue
                
                # Validate required fields
                if not row.get('SKU') or not row.get('Title'):
                    continue
                
                # Find section by name
                section_name = row.get('Section Name', '').strip()
                section = Section.query.filter_by(name=section_name).first()
                if not section:
                    errors.append(f"Row {row_num}: Section '{section_name}' not found")
                    continue
                
                # Generate slug from CSV or title
                if row.get('Slug', '').strip():
                    # Use provided slug
                    base_slug = row.get('Slug', '').strip().lower()
                    base_slug = ''.join(c for c in base_slug if c.isalnum() or c == '-')
                else:
                    # Generate from title
                    base_slug = row.get('Title', '').lower().replace(' ', '-')
                    base_slug = ''.join(c for c in base_slug if c.isalnum() or c == '-')
                
                # Ensure slug is unique
                slug = base_slug
                counter = 1
                while Product.query.filter_by(slug=slug).first():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Check if product exists by SKU
                existing = Product.query.filter_by(sku=row['SKU']).first()
                if existing:
                    errors.append(f"Row {row_num}: Product with SKU '{row['SKU']}' already exists")
                    continue
                
                # Handle image
                image_url = None
                image_filename = row.get('Image Filename', '').strip()
                if image_filename and image_filename in image_dict:
                    image_file = image_dict[image_filename]
                    
                    # Save image
                    products_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
                    os.makedirs(products_folder, exist_ok=True)
                    
                    ext = os.path.splitext(image_filename)[1]
                    unique_filename = f"{uuid.uuid4().hex}{ext}"
                    filepath = os.path.join(products_folder, unique_filename)
                    
                    image_file.save(filepath)
                    image_url = f"{request.host_url}uploads/products/{unique_filename}"
                
                # Create product
                product = Product(
                    sku=row['SKU'].strip(),
                    title=row['Title'].strip(),
                    slug=slug,
                    description=row.get('Description', '').strip(),
                    price=float(row.get('Price', 0)),
                    original_price=float(row.get('Original Price', 0)) if row.get('Original Price') else None,
                    stock=int(row.get('Stock', 0)),
                    section_id=section.id,
                    is_active=row.get('Is Active', 'TRUE').upper() == 'TRUE',
                    is_on_sale=row.get('Is On Sale', 'FALSE').upper() == 'TRUE',
                    images=json.dumps([image_url] if image_url else [])
                )
                
                db.session.add(product)
                created_count += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bulk upload completed',
            'created': created_count,
            'errors': errors
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Bulk upload error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to upload products: {str(e)}'}), 500

# Bulk product upload endpoints
@admin_bp.route('/bulk-upload-products', methods=['POST', 'OPTIONS'])
@admin_required
def bulk_upload_products():
    print("=== BULK PRODUCT UPLOAD DEBUG ===")
    print(f"Request files: {request.files}")
    
    if 'excel_file' not in request.files:
        print("ERROR: No 'excel_file' key in request.files")
        return jsonify({'error': 'No Excel file provided'}), 400
    
    file = request.files['excel_file']
    print(f"Excel file: {file.filename}")
    
    if file.filename == '':
        print("ERROR: No file selected")
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
        print(f"ERROR: Invalid file type: {file.filename}")
        return jsonify({'error': 'File must be an Excel file (.xlsx, .xls) or CSV file (.csv)'}), 400
    
    try:
        # Read file based on extension
        df = None
        file_ext = file.filename.lower().split('.')[-1]
        
        try:
            if file_ext == 'csv':
                df = pd.read_csv(file)
                print("Successfully read CSV file")
            else:
                # Try both sheet names for Excel files
                try:
                    df = pd.read_excel(file, sheet_name='Upload Template', engine='openpyxl')
                    print("Successfully read 'Upload Template' sheet")
                except:
                    df = pd.read_excel(file, sheet_name=0, engine='openpyxl')  # First sheet
                    print("Successfully read first sheet (index 0)")
        except Exception as e:
            print(f"ERROR reading file: {str(e)}")
            return jsonify({'error': f'Failed to read file: {str(e)}'}), 400
        
        print(f"DataFrame shape: {df.shape}")
        print(f"DataFrame columns: {list(df.columns)}")
        
        # Validate required columns
        required_columns = ['sku', 'title', 'slug', 'price', 'section_slug']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            error_msg = f'Missing required columns: {", ".join(missing_columns)}'
            print(f"ERROR: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Process each row
        results = {
            'success': 0,
            'errors': [],
            'created_products': []
        }
        
        print(f"Processing {len(df)} rows...")
        
        for index, row in df.iterrows():
            try:
                # Skip empty rows
                if pd.isna(row['sku']) or pd.isna(row['title']):
                    continue
                
                # Check if product already exists by SKU
                existing_product = Product.query.filter_by(sku=str(row['sku']).strip()).first()
                if existing_product:
                    error_msg = f"Row {index + 2}: Product with SKU '{row['sku']}' already exists"
                    results['errors'].append(error_msg)
                    continue
                
                # Generate or validate slug
                if pd.isna(row.get('slug')) or not str(row['slug']).strip():
                    # Generate from title if slug is empty
                    base_slug = str(row['title']).strip().lower().replace(' ', '-')
                    base_slug = ''.join(c for c in base_slug if c.isalnum() or c == '-')
                else:
                    # Use provided slug
                    base_slug = str(row['slug']).strip().lower()
                    base_slug = ''.join(c for c in base_slug if c.isalnum() or c == '-')
                
                # Ensure slug is unique
                slug = base_slug
                counter = 1
                while Product.query.filter_by(slug=slug).first():
                    slug = f"{base_slug}-{counter}"
                    counter += 1
                
                # Find section
                section_slug = str(row['section_slug']).strip().lower()
                section = Section.query.filter_by(slug=section_slug).first()
                if not section:
                    available_sections = [s.slug for s in Section.query.all()]
                    error_msg = f"Row {index + 2}: Section '{section_slug}' not found. Available: {available_sections}"
                    results['errors'].append(error_msg)
                    continue
                
                # Process image filenames
                image_urls = []
                if not pd.isna(row.get('image_filenames', '')):
                    image_filenames = [name.strip() for name in str(row['image_filenames']).split(',')]
                    
                    for filename in image_filenames:
                        if filename:
                            # Check if image exists in bulk_images folder
                            bulk_image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'bulk_images', filename)
                            
                            if os.path.exists(bulk_image_path):
                                # Move image to products folder
                                products_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
                                os.makedirs(products_folder, exist_ok=True)
                                
                                # Generate unique filename
                                name, ext = os.path.splitext(filename)
                                unique_filename = f"{uuid.uuid4().hex}{ext}"
                                new_path = os.path.join(products_folder, unique_filename)
                                
                                # Copy and optimize image
                                try:
                                    with Image.open(bulk_image_path) as img:
                                        if img.mode in ('RGBA', 'P'):
                                            img = img.convert('RGB')
                                        if img.width > 1200:
                                            ratio = 1200 / img.width
                                            new_height = int(img.height * ratio)
                                            img = img.resize((1200, new_height), Image.Resampling.LANCZOS)
                                        img.save(new_path, 'JPEG', quality=85, optimize=True)
                                    
                                    # Use UPLOAD_BASE_URL from config
                                    upload_base_url = current_app.config.get('UPLOAD_BASE_URL')
                                    if not upload_base_url:
                                        api_url = current_app.config.get('API_URL')
                                        if not api_url:
                                            from flask import request
                                            api_url = f"{request.scheme}://{request.host}"
                                        upload_base_url = f"{api_url}/uploads"
                                    
                                    image_url = f"{upload_base_url}/products/{unique_filename}"
                                    image_urls.append(image_url)
                                    
                                except Exception as e:
                                    error_msg = f"Row {index + 2}: Failed to process image '{filename}': {str(e)}"
                                    results['errors'].append(error_msg)
                            else:
                                error_msg = f"Row {index + 2}: Image '{filename}' not found in bulk_images folder"
                                results['errors'].append(error_msg)
                
                # Create product
                product = Product(
                    sku=str(row['sku']).strip(),
                    title=str(row['title']).strip(),
                    slug=slug,  # Use the validated unique slug
                    description=str(row.get('description', '')).strip() if not pd.isna(row.get('description')) else '',
                    price=float(row['price']),
                    original_price=float(row['original_price']) if not pd.isna(row.get('original_price')) and row.get('original_price') != '' else None,
                    is_on_sale=bool(row.get('is_on_sale', False)) if not pd.isna(row.get('is_on_sale')) else False,
                    stock=int(row.get('stock', 0)) if not pd.isna(row.get('stock')) else 0,
                    section_id=section.id,
                    images=json.dumps(image_urls),
                    sizes=json.dumps([s.strip() for s in str(row.get('sizes', '')).split(',') if s.strip()]) if not pd.isna(row.get('sizes')) else json.dumps([]),
                    colors=json.dumps([c.strip() for c in str(row.get('colors', '')).split(',') if c.strip()]) if not pd.isna(row.get('colors')) else json.dumps([]),
                    is_active=bool(row.get('is_active', True)) if not pd.isna(row.get('is_active')) else True
                )
                
                db.session.add(product)
                results['success'] += 1
                results['created_products'].append({
                    'sku': product.sku,
                    'title': product.title
                })
                
            except Exception as e:
                error_msg = f"Row {index + 2}: {str(e)}"
                results['errors'].append(error_msg)
        
        # Commit all changes
        if results['success'] > 0:
            db.session.commit()
        
        return jsonify({
            'message': f'Bulk upload completed. {results["success"]} products created.',
            'results': results
        }), 200
        
    except Exception as e:
        db.session.rollback()
        error_msg = f'Failed to process Excel file: {str(e)}'
        return jsonify({'error': error_msg}), 500

@admin_bp.route('/download-product-template', methods=['GET'])
@admin_required
def download_product_template():
    """Download Excel template for bulk product upload"""
    try:
        # Create a simple template
        template_data = {
            'sku': ['PROD001', 'PROD002'],
            'title': ['Product Title 1', 'Product Title 2'],
            'slug': ['product-title-1', 'product-title-2'],
            'description': ['Product description here', 'Another product description'],
            'price': [99.99, 149.99],
            'original_price': [129.99, 199.99],
            'is_on_sale': [True, False],
            'stock': [100, 50],
            'section_slug': ['section-slug', 'section-slug'],
            'sizes': ['S,M,L,XL', 'M,L'],
            'colors': ['Red,Blue,Green', 'Black,White'],
            'image_filenames': ['image1.jpg,image2.jpg', 'image3.jpg'],
            'is_active': [True, True]
        }
        
        df = pd.DataFrame(template_data)
        
        # Save to a temporary file
        template_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'product_upload_template.xlsx')
        os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
        df.to_excel(template_path, index=False, sheet_name='Upload Template')
        
        return send_from_directory(
            current_app.config['UPLOAD_FOLDER'],
            'product_upload_template.xlsx',
            as_attachment=True,
            download_name='product_upload_template.xlsx'
        )
    except Exception as e:
        return jsonify({'error': f'Failed to generate template: {str(e)}'}), 500

@admin_bp.route('/bulk-upload-images', methods=['POST', 'OPTIONS'])
@admin_required
def bulk_upload_images():
    """Upload multiple images for bulk product creation"""
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    
    files = request.files.getlist('images')
    
    if not files or (len(files) == 1 and files[0].filename == ''):
        return jsonify({'error': 'No files selected'}), 400
    
    # Create bulk_images folder
    bulk_images_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'bulk_images')
    os.makedirs(bulk_images_folder, exist_ok=True)
    
    results = {
        'success': 0,
        'errors': [],
        'uploaded_files': []
    }
    
    for file in files:
        if file.filename == '':
            continue
            
        if file and allowed_file(file.filename):
            try:
                # Use original filename for bulk upload
                filename = secure_filename(file.filename)
                file_path = os.path.join(bulk_images_folder, filename)
                
                # Check if file already exists
                if os.path.exists(file_path):
                    error_msg = f"File '{filename}' already exists"
                    results['errors'].append(error_msg)
                    continue
                
                # Save file
                file.save(file_path)
                
                # Verify file was saved
                if os.path.exists(file_path):
                    results['success'] += 1
                    results['uploaded_files'].append(filename)
                else:
                    error_msg = f"Failed to save '{filename}'"
                    results['errors'].append(error_msg)
                
            except Exception as e:
                error_msg = f"Failed to upload '{file.filename}': {str(e)}"
                results['errors'].append(error_msg)
        else:
            error_msg = f"Invalid file type: '{file.filename}'"
            results['errors'].append(error_msg)
    
    return jsonify({
        'message': f'Bulk image upload completed. {results["success"]} images uploaded.',
        'results': results
    }), 200

# Order Management
@admin_bp.route('/orders', methods=['GET', 'OPTIONS'])
@admin_required
def get_all_orders():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    status = request.args.get('status')
    search = request.args.get('search', '')
    
    from models import Order, User, OrderItem, Product
    
    query = Order.query.options(
        db.joinedload(Order.user),
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    )
    
    if status:
        query = query.filter_by(status=status)
    
    if search:
        query = query.join(User).filter(
            db.or_(
                Order.order_number.contains(search),
                Order.receipt_number.contains(search),
                User.email.contains(search),
                User.name.contains(search)
            )
        )
    
    orders = query.order_by(Order.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'orders': [order.to_dict(include_user=True) for order in orders.items],
        'total': orders.total,
        'pages': orders.pages,
        'current_page': page
    }), 200

@admin_bp.route('/orders/<int:order_id>', methods=['GET'])
@admin_required
def get_admin_order(order_id):
    from models import Order, OrderItem
    
    order = Order.query.options(
        db.joinedload(Order.user),
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(id=order_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify(order.to_dict(include_user=True)), 200

@admin_bp.route('/orders/<int:order_id>', methods=['PUT'])
@admin_required
def update_admin_order(order_id):
    from models import Order
    
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Update status if provided
    if 'status' in data:
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        order.status = data['status']
    
    # Update payment status if provided
    if 'payment_status' in data:
        order.payment_status = data['payment_status']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order updated successfully',
        'order': order.to_dict(include_user=True)
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    from models import Order
    
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({'error': 'Status is required'}), 400
    
    valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if data['status'] not in valid_statuses:
        return jsonify({'error': 'Invalid status'}), 400
    
    order.status = data['status']
    db.session.commit()
    
    return jsonify({
        'message': 'Order status updated successfully',
        'order': order.to_dict(include_user=True)
    }), 200

@admin_bp.route('/orders/<int:order_id>', methods=['DELETE'])
@admin_required
def delete_order(order_id):
    from models import Order, OrderItem
    
    order = db.session.get(Order, order_id)
    if not order:
        return jsonify({'error': 'Order not found'}), 404

    try:
        # Delete order items first
        OrderItem.query.filter_by(order_id=order_id).delete()
        
        # Delete order
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({'message': 'Order deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/orders/<int:order_id>/receipt', methods=['GET'])
@admin_required
def download_admin_receipt(order_id):
    """Download order receipt as PDF (Admin)"""
    from models import Order, OrderItem
    import sys
    import os
    
    # Add utils directory to path
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    from utils.pdf_receipt_generator import generate_receipt_pdf
    
    order = Order.query.options(
        db.joinedload(Order.user),
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(id=order_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    try:
        pdf_buffer = generate_receipt_pdf(order)
        
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f'peckup_receipt_{order.receipt_number}.pdf',
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Error generating receipt: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate receipt', 'details': str(e)}), 500
    
    try:
        order_number = order.order_number
        
        # Delete order items first
        OrderItem.query.filter_by(order_id=order_id).delete()
        
        # Delete the order
        db.session.delete(order)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Order deleted successfully',
            'order_number': order_number
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': 'Failed to delete order',
            'details': str(e)
        }), 500

@admin_bp.route('/orders/stats', methods=['GET'])
@admin_required
def get_order_stats():
    from models import Order
    from sqlalchemy import func
    
    # Order counts by status
    status_counts = db.session.query(
        Order.status,
        func.count(Order.id).label('count')
    ).group_by(Order.status).all()
    
    # Total revenue
    total_revenue = db.session.query(
        func.sum(Order.total_amount)
    ).filter(Order.status.in_(['confirmed', 'shipped', 'delivered'])).scalar() or 0
    
    # Recent orders count (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_orders = Order.query.filter(Order.created_at >= thirty_days_ago).count()
    
    return jsonify({
        'status_counts': {status: count for status, count in status_counts},
        'total_revenue': total_revenue,
        'recent_orders': recent_orders
    }), 200
