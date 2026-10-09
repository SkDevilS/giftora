from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
PASSWORD_REGEX = re.compile(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$')

def validate_email(email):
    """Validate email format"""
    return EMAIL_REGEX.match(email) is not None

def validate_password(password):
    """Validate password strength"""
    return PASSWORD_REGEX.match(password) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new customer account"""
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({'error': 'Missing required fields: name, email, and password are required'}), 400
    
    name = data['name'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    
    # Validate name
    if len(name) < 2:
        return jsonify({'error': 'Name must be at least 2 characters long'}), 400
    
    # Validate email format
    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Validate password strength
    if not validate_password(password):
        return jsonify({'error': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        name=name,
        email=email,
        role='customer',
        is_active=True
    )
    user.set_password(password)
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens with string identity
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].strip().lower()
    password = data['password']
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Please contact support.'}), 403
    
    # Update login info
    user.update_login_info()
    db.session.commit()
    
    # Generate tokens with string identity
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    """Admin login with email and password"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    email = data['email'].strip().lower()
    password = data['password']
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Check if user is admin
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    # Check if account is active
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Please contact support.'}), 403
    
    # Update login info
    user.update_login_info()
    db.session.commit()
    
    # Generate tokens with string identity
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': 'Admin login successful',
        'user': user.to_dict(),
        'access_token': access_token,
        'refresh_token': refresh_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current authenticated user profile"""
    user_id = get_user_id()
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if not user.is_active:
        return jsonify({'error': 'Account is deactivated'}), 403
    
    return jsonify({'user': user.to_dict()}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    user_id = get_user_id()
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
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400
        
        # Check if email is already taken by another user
        existing_user = User.query.filter_by(email=email).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'error': 'Email already in use'}), 400
        
        user.email = email
    
    # Contact Information
    if 'phone' in data:
        phone = data['phone'].strip() if data['phone'] else None
        user.phone = phone
    
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    user_id = get_user_id()
    user = db.session.get(User, user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data or not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old password and new password are required'}), 400
    
    old_password = data['old_password']
    new_password = data['new_password']
    
    # Verify old password
    if not user.check_password(old_password):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Validate new password
    if not validate_password(new_password):
        return jsonify({'error': 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'}), 400
    
    # Check if new password is same as old
    if old_password == new_password:
        return jsonify({'error': 'New password must be different from current password'}), 400
    
    # Update password
    user.set_password(new_password)
    user.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to change password'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token using refresh token"""
    user_id = get_user_id()
    
    # Verify user still exists and is active
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return jsonify({'error': 'Invalid refresh token'}), 401
    
    access_token = create_access_token(identity=str(user_id))
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (client should delete tokens)"""
    return jsonify({'message': 'Logout successful'}), 200

@auth_bp.route('/verify-token', methods=['GET'])
@jwt_required()
def verify_token():
    """Verify if current token is valid"""
    user_id = get_user_id()
    user = db.session.get(User, user_id)
    
    if not user or not user.is_active:
        return jsonify({'valid': False}), 401
    
    return jsonify({
        'valid': True,
        'user': user.to_dict()
    }), 200
