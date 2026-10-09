"""
MoneyOne Payment Gateway Routes
Handles payment initiation, QR generation, and callback
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, PaymentDetail
from datetime import datetime
import sys
import os

# Add utils directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.moneyone_helper import (
    moneyone_login,
    create_payin_order,
    prepare_moneyone_params,
    generate_qr_code
)
from config import Config

moneyone_bp = Blueprint('moneyone', __name__)


def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id


@moneyone_bp.route('/initiate/<int:order_id>', methods=['POST'])
@jwt_required()
def initiate_payment(order_id):
    """
    Initiate MoneyOne payment for an order
    Returns payment URL and transaction details
    """
    try:
        user_id = get_user_id()
        
        # Get order with relationships
        order = Order.query.options(
            db.joinedload(Order.user),
            db.joinedload(Order.address)
        ).filter_by(id=order_id, user_id=user_id).first()
        
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Check if order is already paid
        if order.payment_status == 'paid':
            return jsonify({'error': 'Order already paid'}), 400
        
        # Get MoneyOne configuration
        merchant_id = Config.MONEYONE_MERCHANT_ID
        password = Config.MONEYONE_PASSWORD
        auth_key = Config.MONEYONE_AUTH_KEY
        module_secret = Config.MONEYONE_MODULE_SECRET
        
        if not all([merchant_id, password, auth_key, module_secret]):
            return jsonify({'error': 'MoneyOne configuration missing'}), 500
        
        # Prepare callback URL (MANDATORY)
        api_url = Config.API_URL or 'https://api.shopzenventures.shop'
        callback_url = f"{api_url}/api/moneyone/callback"
        
        print(f"Using callback URL: {callback_url}")
        
        # Prepare MoneyOne parameters
        params = prepare_moneyone_params(
            order, 
            order.user, 
            order.address,
            callback_url
        )
        
        print(f"MoneyOne payment params: {params}")
        
        # Create PayIN order with fresh authentication
        result = create_payin_order(merchant_id, password, auth_key, module_secret, params)
        
        if not result.get('success'):
            return jsonify({'error': result.get('message', 'Failed to create payment order')}), 400
        
        payment_data = result.get('data', {})
        
        # Store transaction ID in order
        order.moneyone_txnid = payment_data.get('txn_id') or payment_data.get('txnId')
        order.updated_at = datetime.utcnow()
        db.session.commit()
        
        # Robust extraction of payment URL from any potential field in response
        payment_url = (
            payment_data.get('payment_url') or 
            payment_data.get('paymentUrl') or 
            payment_data.get('payment_link') or 
            payment_data.get('paymentLink') or 
            payment_data.get('intent_url') or 
            payment_data.get('intentUrl') or 
            payment_data.get('upi_link') or 
            payment_data.get('upiLink') or 
            payment_data.get('tiny_url') or 
            payment_data.get('tinyUrl')
        )
        
        # Robust extraction of QR string
        qr_string = (
            payment_data.get('qr_string') or 
            payment_data.get('qrString') or 
            payment_data.get('qr_code_url') or 
            payment_data.get('qrCodeUrl')
        )
        
        # Fallback: if we have a UPI URL but no QR string, we can use the UPI URL to generate the QR code
        if not qr_string and payment_url and (payment_url.startswith('upi://') or payment_url.startswith('http')):
            qr_string = payment_url
            
        # Generate QR code if QR string is present
        qr_code_image = None
        if qr_string:
            try:
                qr_code_image = generate_qr_code(qr_string)
            except Exception as e:
                print(f"Failed to generate QR code: {str(e)}")
        
        # Return payment details
        return jsonify({
            'success': True,
            'txn_id': payment_data.get('txn_id') or payment_data.get('txnId'),
            'order_id': payment_data.get('order_id') or payment_data.get('orderId'),
            'amount': payment_data.get('amount'),
            'payment_url': payment_url,
            'qr_string': qr_string,
            'qr_code': qr_code_image,
            'payment_params': payment_data.get('payment_params') or payment_data
        }), 200
        
    except Exception as e:
        print(f"Error initiating MoneyOne payment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to initiate payment: {str(e)}'}), 500


@moneyone_bp.route('/callback', methods=['POST'])
def payment_callback():
    """
    Handle MoneyOne payment callback
    """
    try:
        # Get callback data
        data = request.get_json()
        
        print(f"MoneyOne Callback: {data}")
        
        # Extract payment details
        txn_id = data.get('txn_id')
        order_number = data.get('order_id')
        status = data.get('status')
        amount = data.get('amount')
        
        if not order_number:
            return jsonify({'error': 'Order not found'}), 400
        
        # Get order by order number
        order = Order.query.filter_by(order_number=order_number).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        # Update order with payment details
        order.moneyone_txnid = txn_id
        order.payment_status = 'paid' if status == 'success' else 'failed'
        order.status = 'confirmed' if status == 'success' else 'pending'
        order.updated_at = datetime.utcnow()
        
        # Create or update payment details
        payment_detail = PaymentDetail.query.filter_by(order_id=order.id).first()
        if not payment_detail:
            payment_detail = PaymentDetail(order_id=order.id)
        
        payment_detail.payment_method = 'moneyone'
        payment_detail.transaction_timestamp = datetime.utcnow()
        
        db.session.add(payment_detail)
        db.session.commit()
        
        print(f"Payment {'successful' if status == 'success' else 'failed'} for order {order.order_number}")
        
        return jsonify({
            'success': True,
            'message': 'Payment status updated'
        }), 200
        
    except Exception as e:
        print(f"Error processing MoneyOne callback: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Payment processing failed'}), 500


@moneyone_bp.route('/status/<int:order_id>', methods=['GET'])
@jwt_required()
def check_payment_status(order_id):
    """
    Check payment status for an order
    """
    try:
        user_id = get_user_id()
        
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        return jsonify({
            'success': True,
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_status': order.payment_status,
            'status': order.status,
            'amount': float(order.total_amount)
        }), 200
        
    except Exception as e:
        print(f"Error checking payment status: {str(e)}")
        return jsonify({'error': f'Failed to check payment status: {str(e)}'}), 500
