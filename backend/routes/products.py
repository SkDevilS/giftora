from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Product, Section

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    """Get all active products with optional filtering"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Cap per_page at 1000 to prevent performance issues
    per_page = min(per_page, 1000)
    
    section = request.args.get('section')
    section_slug = request.args.get('section_slug')
    search = request.args.get('search', '')
    is_featured = request.args.get('is_featured')
    
    query = Product.query.filter_by(is_active=True)
    
    # If featured is requested, return first 10 products regardless of section
    if is_featured and is_featured.lower() == 'true':
        products = query.order_by(Product.created_at.desc()).limit(per_page).all()
        return jsonify({
            'products': [product.to_dict() for product in products],
            'total': len(products),
            'pages': 1,
            'current_page': 1
        }), 200
    
    # Filter by section slug or section name
    if section_slug or section:
        slug_to_find = section_slug or section
        section_obj = Section.query.filter_by(slug=slug_to_find, is_active=True).first()
        if section_obj:
            query = query.filter_by(section_id=section_obj.id)
        else:
            return jsonify({'products': [], 'total': 0, 'pages': 0}), 200
    
    if search:
        query = query.filter(
            db.or_(
                Product.title.contains(search),
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

@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a single product by ID"""
    product = db.session.get(Product, product_id)
    if not product or not product.is_active:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict()}), 200

@products_bp.route('/slug/<slug>', methods=['GET'])
def get_product_by_slug(slug):
    """Get a single product by slug"""
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'product': product.to_dict()}), 200

@products_bp.route('/category/<category_slug>', methods=['GET'])
def get_products_by_category(category_slug):
    """Get products by category slug"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    section = Section.query.filter_by(slug=category_slug, is_active=True).first()
    if not section:
        return jsonify({'products': [], 'total': 0, 'pages': 0, 'section': None}), 200
    
    products = Product.query.filter_by(
        section_id=section.id, 
        is_active=True
    ).order_by(Product.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'products': [product.to_dict() for product in products.items],
        'total': products.total,
        'pages': products.pages,
        'current_page': page,
        'section': section.to_dict()
    }), 200

@products_bp.route('/featured', methods=['GET'])
def get_featured_products():
    """Get featured/on-sale products"""
    limit = request.args.get('limit', 8, type=int)
    
    products = Product.query.filter_by(
        is_active=True, 
        is_on_sale=True
    ).order_by(Product.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'products': [product.to_dict() for product in products]
    }), 200

@products_bp.route('/new-arrivals', methods=['GET'])
def get_new_arrivals():
    """Get newest products"""
    limit = request.args.get('limit', 8, type=int)
    
    products = Product.query.filter_by(
        is_active=True
    ).order_by(Product.created_at.desc()).limit(limit).all()
    
    return jsonify({
        'products': [product.to_dict() for product in products]
    }), 200
