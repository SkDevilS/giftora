from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Address

addresses_bp = Blueprint('addresses', __name__)

def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id

@addresses_bp.route('', methods=['GET'])
@jwt_required()
def get_addresses():
    """Get all addresses for current user"""
    user_id = get_user_id()
    
    addresses = Address.query.filter_by(user_id=user_id).all()
    return jsonify({
        'addresses': [address.to_dict() for address in addresses]
    }), 200

@addresses_bp.route('/<int:address_id>', methods=['GET'])
@jwt_required()
def get_address(address_id):
    """Get a specific address"""
    user_id = get_user_id()
    
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    return jsonify({'address': address.to_dict()}), 200

@addresses_bp.route('', methods=['POST'])
@jwt_required()
def create_address():
    """Create a new address"""
    user_id = get_user_id()
    data = request.get_json()
    
    required_fields = ['full_name', 'phone', 'address_line1', 'city', 'state', 'pincode']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # If this is the first address, make it default
    existing_addresses = Address.query.filter_by(user_id=user_id).count()
    is_default = existing_addresses == 0 or data.get('is_default', False)
    
    # If setting as default, unset other defaults
    if is_default:
        Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
    
    address = Address(
        user_id=user_id,
        full_name=data['full_name'],
        phone=data['phone'],
        address_line1=data['address_line1'],
        address_line2=data.get('address_line2'),
        city=data['city'],
        state=data['state'],
        pincode=data['pincode'],
        is_default=is_default
    )
    
    db.session.add(address)
    db.session.commit()
    
    return jsonify({
        'message': 'Address created successfully',
        'address': address.to_dict()
    }), 201

@addresses_bp.route('/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    """Update an address"""
    user_id = get_user_id()
    
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    data = request.get_json()
    
    if 'full_name' in data:
        address.full_name = data['full_name']
    if 'phone' in data:
        address.phone = data['phone']
    if 'address_line1' in data:
        address.address_line1 = data['address_line1']
    if 'address_line2' in data:
        address.address_line2 = data['address_line2']
    if 'city' in data:
        address.city = data['city']
    if 'state' in data:
        address.state = data['state']
    if 'pincode' in data:
        address.pincode = data['pincode']
    if 'is_default' in data and data['is_default']:
        # Unset other defaults
        Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
        address.is_default = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Address updated successfully',
        'address': address.to_dict()
    }), 200

@addresses_bp.route('/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    """Delete an address"""
    user_id = get_user_id()
    
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    was_default = address.is_default
    
    db.session.delete(address)
    db.session.commit()
    
    # If deleted address was default, make another one default
    if was_default:
        other_address = Address.query.filter_by(user_id=user_id).first()
        if other_address:
            other_address.is_default = True
            db.session.commit()
    
    return jsonify({'message': 'Address deleted successfully'}), 200

@addresses_bp.route('/<int:address_id>/set-default', methods=['POST'])
@jwt_required()
def set_default_address(address_id):
    """Set an address as default"""
    user_id = get_user_id()
    
    address = Address.query.filter_by(id=address_id, user_id=user_id).first()
    if not address:
        return jsonify({'error': 'Address not found'}), 404
    
    # Unset other defaults
    Address.query.filter_by(user_id=user_id, is_default=True).update({'is_default': False})
    
    address.is_default = True
    db.session.commit()
    
    return jsonify({
        'message': 'Default address updated',
        'address': address.to_dict()
    }), 200
