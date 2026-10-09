from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, WishlistItem, Product

wishlist_bp = Blueprint('wishlist', __name__)

def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    """Get wishlist items for current user"""
    user_id = get_user_id()
    
    wishlist_items = WishlistItem.query.filter_by(user_id=user_id).all()
    
    return jsonify({
        'items': [item.to_dict() for item in wishlist_items]
    }), 200

@wishlist_bp.route('', methods=['POST'])
@jwt_required()
def add_to_wishlist():
    """Add item to wishlist"""
    user_id = get_user_id()
    data = request.get_json()
    
    if not data or not data.get('product_id'):
        return jsonify({'error': 'Product ID is required'}), 400
    
    product = db.session.get(Product, data['product_id'])
    if not product or not product.is_active:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check if already in wishlist
    existing_item = WishlistItem.query.filter_by(
        user_id=user_id,
        product_id=data['product_id']
    ).first()
    
    if existing_item:
        return jsonify({
            'message': 'Item already in wishlist',
            'item': existing_item.to_dict()
        }), 200
    
    # Create new wishlist item
    wishlist_item = WishlistItem(
        user_id=user_id,
        product_id=data['product_id']
    )
    
    db.session.add(wishlist_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to wishlist',
        'item': wishlist_item.to_dict()
    }), 201

@wishlist_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(item_id):
    """Remove item from wishlist"""
    user_id = get_user_id()
    
    wishlist_item = WishlistItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not wishlist_item:
        return jsonify({'error': 'Wishlist item not found'}), 404
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from wishlist'}), 200

@wishlist_bp.route('/product/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist_by_product(product_id):
    """Remove item from wishlist by product ID"""
    user_id = get_user_id()
    
    wishlist_item = WishlistItem.query.filter_by(
        user_id=user_id, 
        product_id=product_id
    ).first()
    
    if not wishlist_item:
        return jsonify({'error': 'Item not in wishlist'}), 404
    
    db.session.delete(wishlist_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from wishlist'}), 200

@wishlist_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_wishlist():
    """Clear all items from wishlist"""
    user_id = get_user_id()
    
    WishlistItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Wishlist cleared'}), 200

@wishlist_bp.route('/check/<int:product_id>', methods=['GET'])
@jwt_required()
def check_in_wishlist(product_id):
    """Check if product is in wishlist"""
    user_id = get_user_id()
    
    exists = WishlistItem.query.filter_by(
        user_id=user_id,
        product_id=product_id
    ).first() is not None
    
    return jsonify({'in_wishlist': exists}), 200
