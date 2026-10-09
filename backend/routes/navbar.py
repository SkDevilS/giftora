from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, NavbarItem, User
from functools import wraps

navbar_bp = Blueprint('navbar', __name__)

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({'status': 'ok'}), 200
        
        from flask_jwt_extended import verify_jwt_in_request
        verify_jwt_in_request()
        
        user_id = get_jwt_identity()
        user_id = int(user_id) if isinstance(user_id, str) else user_id
        user = db.session.get(User, user_id)
        if not user or user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return fn(*args, **kwargs)
    return wrapper

# Public endpoint to get navbar items
@navbar_bp.route('/navbar', methods=['GET'])
def get_navbar():
    """Get all active navbar items"""
    # Get only top-level items (no parent)
    navbar_items = NavbarItem.query.filter_by(
        is_active=True,
        parent_id=None
    ).order_by(NavbarItem.display_order).all()
    
    return jsonify({
        'items': [item.to_dict(include_children=True) for item in navbar_items]
    }), 200

# Admin endpoints
@navbar_bp.route('/admin/navbar', methods=['GET'])
@admin_required
def get_all_navbar_items():
    """Get all navbar items (admin)"""
    navbar_items = NavbarItem.query.order_by(NavbarItem.display_order).all()
    return jsonify({
        'items': [item.to_dict(include_children=True) for item in navbar_items if item.parent_id is None]
    }), 200

@navbar_bp.route('/admin/navbar', methods=['POST'])
@admin_required
def create_navbar_item():
    """Create a new navbar item"""
    data = request.get_json()
    
    if not data or not data.get('label') or not data.get('url'):
        return jsonify({'error': 'Label and URL are required'}), 400
    
    navbar_item = NavbarItem(
        label=data['label'],
        url=data['url'],
        parent_id=data.get('parent_id'),
        display_order=data.get('display_order', 0),
        is_active=data.get('is_active', True),
        icon=data.get('icon'),
        target=data.get('target', '_self')
    )
    
    db.session.add(navbar_item)
    db.session.commit()
    
    return jsonify({
        'message': 'Navbar item created successfully',
        'item': navbar_item.to_dict()
    }), 201

@navbar_bp.route('/admin/navbar/<int:item_id>', methods=['PUT'])
@admin_required
def update_navbar_item(item_id):
    """Update a navbar item"""
    navbar_item = db.session.get(NavbarItem, item_id)
    if not navbar_item:
        return jsonify({'error': 'Navbar item not found'}), 404
    
    data = request.get_json()
    
    if 'label' in data:
        navbar_item.label = data['label']
    if 'url' in data:
        navbar_item.url = data['url']
    if 'parent_id' in data:
        navbar_item.parent_id = data['parent_id']
    if 'display_order' in data:
        navbar_item.display_order = data['display_order']
    if 'is_active' in data:
        navbar_item.is_active = data['is_active']
    if 'icon' in data:
        navbar_item.icon = data['icon']
    if 'target' in data:
        navbar_item.target = data['target']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Navbar item updated successfully',
        'item': navbar_item.to_dict()
    }), 200

@navbar_bp.route('/admin/navbar/<int:item_id>', methods=['DELETE'])
@admin_required
def delete_navbar_item(item_id):
    """Delete a navbar item"""
    navbar_item = db.session.get(NavbarItem, item_id)
    if not navbar_item:
        return jsonify({'error': 'Navbar item not found'}), 404
    
    # Delete children first
    NavbarItem.query.filter_by(parent_id=item_id).delete()
    
    db.session.delete(navbar_item)
    db.session.commit()
    
    return jsonify({'message': 'Navbar item deleted successfully'}), 200

@navbar_bp.route('/admin/navbar/<int:item_id>/toggle-status', methods=['POST'])
@admin_required
def toggle_navbar_status(item_id):
    """Toggle navbar item status"""
    navbar_item = db.session.get(NavbarItem, item_id)
    if not navbar_item:
        return jsonify({'error': 'Navbar item not found'}), 404
    
    navbar_item.is_active = not navbar_item.is_active
    db.session.commit()
    
    return jsonify({
        'message': 'Navbar item status updated successfully',
        'item': navbar_item.to_dict()
    }), 200
