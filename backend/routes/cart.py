from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, CartItem, Product

cart_bp = Blueprint('cart', __name__)

def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    """Get cart items for current user"""
    user_id = get_user_id()
    
    cart_items = CartItem.query.filter_by(user_id=user_id).all()
    
    # Calculate totals
    subtotal = sum(
        (item.product.price * item.quantity) if item.product else 0 
        for item in cart_items
    )
    
    return jsonify({
        'items': [item.to_dict() for item in cart_items],
        'subtotal': subtotal,
        'total': subtotal  # Add shipping/tax logic here if needed
    }), 200

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Add item to cart"""
    user_id = get_user_id()
    data = request.get_json()
    
    if not data or not data.get('product_id'):
        return jsonify({'error': 'Product ID is required'}), 400
    
    product = db.session.get(Product, data['product_id'])
    if not product or not product.is_active:
        return jsonify({'error': 'Product not found'}), 404
    
    # Check if item already in cart with same size/color
    existing_item = CartItem.query.filter_by(
        user_id=user_id,
        product_id=data['product_id'],
        size=data.get('size'),
        color=data.get('color')
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += data.get('quantity', 1)
        db.session.commit()
        return jsonify({
            'message': 'Cart updated',
            'item': existing_item.to_dict()
        }), 200
    
    # Create new cart item
    cart_item = CartItem(
        user_id=user_id,
        product_id=data['product_id'],
        quantity=data.get('quantity', 1),
        size=data.get('size'),
        color=data.get('color')
    )
    
    db.session.add(cart_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Item added to cart',
        'item': cart_item.to_dict()
    }), 201

@cart_bp.route('/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    """Update cart item quantity"""
    user_id = get_user_id()
    
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    data = request.get_json()
    
    if 'quantity' in data:
        if data['quantity'] <= 0:
            db.session.delete(cart_item)
            db.session.commit()
            return jsonify({'message': 'Item removed from cart'}), 200
        cart_item.quantity = data['quantity']
    
    if 'size' in data:
        cart_item.size = data['size']
    
    if 'color' in data:
        cart_item.color = data['color']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Cart updated',
        'item': cart_item.to_dict()
    }), 200

@cart_bp.route('/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(item_id):
    """Remove item from cart"""
    user_id = get_user_id()
    
    cart_item = CartItem.query.filter_by(id=item_id, user_id=user_id).first()
    if not cart_item:
        return jsonify({'error': 'Cart item not found'}), 404
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({'message': 'Item removed from cart'}), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Clear all items from cart"""
    user_id = get_user_id()
    
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Cart cleared'}), 200
