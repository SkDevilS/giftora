"""
PayU Payment Gateway Routes
Handles payment initiation, success, failure, and webhook callbacks
"""
from flask import Blueprint, request, jsonify, render_template_string
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, User, Address, PaymentDetail
from datetime import datetime
import sys
import os

# Add utils directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.payu_helper import (
    generate_payu_hash, 
    verify_payu_response_hash, 
    verify_payment_with_payu,
    prepare_payu_params
)
from utils.pdf_receipt_generator import generate_receipt_pdf
from config import Config

payu_bp = Blueprint('payu', __name__)


def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id


@payu_bp.route('/initiate/<int:order_id>', methods=['POST'])
@jwt_required()
def initiate_payment(order_id):
    """
    Initiate PayU payment for an order
    Returns JSON with form action URL and parameters
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
        
        # Get PayU configuration
        merchant_key = Config.PAYU_MERCHANT_KEY
        salt = Config.PAYU_SALT
        payu_url = Config.PAYU_PAYMENT_URL
        
        if not merchant_key or not salt:
            return jsonify({'error': 'PayU configuration missing'}), 500
        
        # Prepare success and failure URLs
        api_url = Config.API_URL
        success_url = f"{api_url}/api/payu/success"
        failure_url = f"{api_url}/api/payu/failure"
        
        # Prepare PayU parameters
        params = prepare_payu_params(
            order, 
            order.user, 
            order.address, 
            merchant_key, 
            success_url, 
            failure_url
        )
        
        # Generate hash
        hash_value = generate_payu_hash(params, salt)
        params['hash'] = hash_value
        
        # Return JSON with form action and parameters
        return jsonify({
            'action': payu_url,
            'params': params
        }), 200
        
    except Exception as e:
        print(f"Error initiating PayU payment: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to initiate payment: {str(e)}'}), 500


@payu_bp.route('/success', methods=['POST'])
def payment_success():
    """
    Handle PayU success callback
    """
    try:
        # Get all POST parameters
        params = request.form.to_dict()
        
        print(f"PayU Success Callback: {params}")
        
        # Verify hash
        salt = Config.PAYU_SALT
        if not verify_payu_response_hash(params, salt):
            print("Hash verification failed!")
            return redirect_to_frontend('failure', 'Payment verification failed')
        
        # Extract payment details
        txnid = params.get('txnid')
        mihpayid = params.get('mihpayid')
        status = params.get('status')
        order_id = params.get('udf1')  # We stored order ID in udf1
        
        if not order_id:
            return redirect_to_frontend('failure', 'Order not found')
        
        # Get order
        order = Order.query.get(int(order_id))
        if not order:
            return redirect_to_frontend('failure', 'Order not found')
        
        # Update order with payment details
        order.payu_mihpayid = mihpayid
        order.payment_status = 'paid' if status == 'success' else 'failed'
        order.status = 'confirmed' if status == 'success' else 'pending'
        order.updated_at = datetime.utcnow()
        
        # Create or update payment details
        payment_detail = PaymentDetail.query.filter_by(order_id=order.id).first()
        if not payment_detail:
            payment_detail = PaymentDetail(order_id=order.id)
        
        payment_detail.payment_method = 'payu'
        payment_detail.payu_mode = params.get('mode', '')
        payment_detail.payu_bank_ref_num = params.get('bank_ref_num', '')
        payment_detail.payu_bankcode = params.get('bankcode', '')
        payment_detail.transaction_timestamp = datetime.utcnow()
        
        db.session.add(payment_detail)
        db.session.commit()
        
        print(f"Payment successful for order {order.order_number}")
        
        # Redirect to frontend success page
        return redirect_to_frontend('success', order.id, order.order_number, order.receipt_number)
        
    except Exception as e:
        print(f"Error processing PayU success: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect_to_frontend('failure', 'Payment processing failed')


@payu_bp.route('/failure', methods=['POST'])
def payment_failure():
    """
    Handle PayU failure callback
    """
    try:
        # Get all POST parameters
        params = request.form.to_dict()
        
        print(f"PayU Failure Callback: {params}")
        
        # Extract payment details
        txnid = params.get('txnid')
        order_id = params.get('udf1')  # We stored order ID in udf1
        error = params.get('error', '')
        error_message = params.get('error_Message', '')
        
        if order_id:
            # Get order
            order = Order.query.get(int(order_id))
            if order:
                # Update order status
                order.payment_status = 'failed'
                order.updated_at = datetime.utcnow()
                
                # Create or update payment details
                payment_detail = PaymentDetail.query.filter_by(order_id=order.id).first()
                if not payment_detail:
                    payment_detail = PaymentDetail(order_id=order.id)
                
                payment_detail.payment_method = 'payu'
                payment_detail.payu_error = error
                payment_detail.payu_error_message = error_message
                payment_detail.transaction_timestamp = datetime.utcnow()
                
                db.session.add(payment_detail)
                db.session.commit()
        
        # Redirect to frontend failure page
        return redirect_to_frontend('failure', error_message or 'Payment failed')
        
    except Exception as e:
        print(f"Error processing PayU failure: {str(e)}")
        import traceback
        traceback.print_exc()
        return redirect_to_frontend('failure', 'Payment processing failed')


def redirect_to_frontend(status, *args):
    """
    Generate HTML to redirect to frontend with payment status
    """
    frontend_url = Config.MAIN_URL
    
    if status == 'success':
        order_id, order_number, receipt_number = args
        redirect_url = f"{frontend_url}/payment-success?orderId={order_id}&orderNumber={order_number}&receiptNumber={receipt_number}"
    else:
        error_message = args[0] if args else 'Payment failed'
        redirect_url = f"{frontend_url}/payment-failure?error={error_message}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment {status.title()}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: {'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' if status == 'success' else 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'};
            }}
            .message {{
                text-align: center;
                color: white;
            }}
            .spinner {{
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                border-top: 4px solid white;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }}
            @keyframes spin {{
                0% {{ transform: rotate(0deg); }}
                100% {{ transform: rotate(360deg); }}
            }}
        </style>
        <script>
            window.location.href = "{redirect_url}";
        </script>
    </head>
    <body>
        <div class="message">
            <div class="spinner"></div>
            <h2>Payment {status.title()}</h2>
            <p>Redirecting you back to the website...</p>
        </div>
    </body>
    </html>
    """
    
    return html, 200, {'Content-Type': 'text/html'}


@payu_bp.route('/verify/<int:order_id>', methods=['GET'])
@jwt_required()
def verify_payment(order_id):
    """
    Verify payment status with PayU API
    """
    try:
        user_id = get_user_id()
        
        order = Order.query.filter_by(id=order_id, user_id=user_id).first()
        if not order:
            return jsonify({'error': 'Order not found'}), 404
        
        if not order.payu_txnid:
            return jsonify({'error': 'No PayU transaction found'}), 400
        
        # Verify with PayU
        merchant_key = Config.PAYU_MERCHANT_KEY
        salt = Config.PAYU_SALT
        
        result = verify_payment_with_payu(order.payu_txnid, merchant_key, salt)
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"Error verifying payment: {str(e)}")
        return jsonify({'error': f'Failed to verify payment: {str(e)}'}), 500
