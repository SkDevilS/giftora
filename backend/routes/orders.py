from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, Product, Address, PaymentDetail
from datetime import datetime
import uuid
from io import BytesIO
import sys
import os
import secrets

# Add utils directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from utils.pdf_receipt_generator import generate_receipt_pdf

orders_bp = Blueprint('orders', __name__)

def get_user_id():
    """Helper to get user ID from JWT and convert to int"""
    user_id = get_jwt_identity()
    return int(user_id) if isinstance(user_id, str) else user_id

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    unique_id = uuid.uuid4().hex[:6].upper()
    return f"PK-{timestamp}-{unique_id}"

def generate_receipt_number():
    """Generate unique receipt number"""
    timestamp = datetime.utcnow().strftime('%y%m%d')
    unique_id = uuid.uuid4().hex[:4].upper()
    return f"R{timestamp}{unique_id}"

def generate_payu_txnid():
    """Generate unique PayU transaction ID"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    random_str = secrets.token_hex(4)
    return f"TXN{timestamp}{random_str}"

@orders_bp.route('', methods=['GET'])
@jwt_required()
def get_orders():
    """Get all orders for current user"""
    user_id = get_user_id()
    
    from models import OrderItem
    
    orders = Order.query.options(
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(user_id=user_id).order_by(
        Order.created_at.desc()
    ).all()
    
    return jsonify({
        'orders': [order.to_dict() for order in orders]
    }), 200

@orders_bp.route('/<int:order_id>', methods=['GET'])
@jwt_required()
def get_order(order_id):
    """Get a specific order"""
    user_id = get_user_id()
    
    from models import OrderItem
    
    order = Order.query.options(
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(id=order_id, user_id=user_id).first()
    
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    return jsonify({'order': order.to_dict()}), 200

@orders_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    """Create a new order"""
    try:
        user_id = get_user_id()
        data = request.get_json()
        
        print(f"Creating order for user {user_id}")
        print(f"Order data: {data}")
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('address_id') and not data.get('address'):
            return jsonify({'error': 'Address is required'}), 400
            
        if not data.get('items') or len(data.get('items', [])) == 0:
            return jsonify({'error': 'Order items are required'}), 400
        
        # Handle address - either use existing or create new
        address_id = data.get('address_id')
        
        if not address_id and data.get('address'):
            # Create new address
            new_address_data = data['address']
            new_address = Address(
                user_id=user_id,
                full_name=new_address_data.get('full_name'),
                phone=new_address_data.get('phone'),
                address_line1=new_address_data.get('address_line1'),
                address_line2=new_address_data.get('address_line2'),
                city=new_address_data.get('city'),
                state=new_address_data.get('state'),
                pincode=new_address_data.get('pincode'),
                is_default=False
            )
            db.session.add(new_address)
            db.session.flush()  # Get the address ID
            address_id = new_address.id
            print(f"Created new address with ID: {address_id}")
        
        # Verify address belongs to user
        address = Address.query.filter_by(id=address_id, user_id=user_id).first()
        if not address:
            return jsonify({'error': 'Address not found'}), 404
        
        # Calculate total and validate items
        total_amount = 0
        order_items = []
        
        for item in data['items']:
            if not item.get('product_id'):
                return jsonify({'error': 'Product ID is required for all items'}), 400
                
            product = db.session.get(Product, item['product_id'])
            if not product:
                return jsonify({'error': f'Product {item["product_id"]} not found'}), 400
            
            if not product.is_active:
                return jsonify({'error': f'Product {product.title} is not available'}), 400
            
            quantity = item.get('quantity', 1)
            price = product.price
            total_amount += price * quantity
            
            order_items.append({
                'product_id': product.id,
                'product_name': product.title,
                'quantity': quantity,
                'price': price,
                'size': item.get('size'),
                'color': item.get('color')
            })
        
        print(f"Order items validated: {len(order_items)} items, total: {total_amount}")
        
        # Create order
        payment_method = data.get('payment_method', 'cod')
        order = Order(
            order_number=generate_order_number(),
            receipt_number=generate_receipt_number(),
            user_id=user_id,
            address_id=address.id,
            total_amount=total_amount,
            status='pending',
            payment_method=payment_method,
            payment_status='pending',
            payu_txnid=generate_payu_txnid() if payment_method == 'payu' else None
        )
        
        db.session.add(order)
        db.session.flush()  # Get order ID
        
        print(f"Order created with ID: {order.id}, Order#: {order.order_number}, Receipt#: {order.receipt_number}")
        
        # Add order items
        for item in order_items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price'],
                size=item['size'],
                color=item['color']
            )
            db.session.add(order_item)
        
        # Add payment details if provided
        if data.get('payment_details'):
            pd = data['payment_details']
            payment_detail = PaymentDetail(
                order_id=order.id,
                payment_method=pd.get('payment_method', 'cod'),
                card_number_last4=pd.get('card_number_last4'),
                card_holder_name=pd.get('card_holder_name'),
                card_expiry_month=pd.get('card_expiry_month'),
                card_expiry_year=pd.get('card_expiry_year'),
                upi_id=pd.get('upi_id'),
                upi_name=pd.get('upi_name')
            )
            db.session.add(payment_detail)
        
        db.session.commit()
        
        print(f"Order committed successfully")
        
        return jsonify({
            'message': 'Order created successfully',
            'order': order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Error creating order: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to create order: {str(e)}'}), 500

@orders_bp.route('/<int:order_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_order(order_id):
    """Cancel an order"""
    user_id = get_user_id()
    
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return jsonify({'error': 'Order not found'}), 404
    
    # Can only cancel pending or confirmed orders
    if order.status not in ['pending', 'confirmed']:
        return jsonify({'error': 'Cannot cancel this order'}), 400
    
    order.status = 'cancelled'
    db.session.commit()
    
    return jsonify({
        'message': 'Order cancelled successfully',
        'order': order.to_dict()
    }), 200

@orders_bp.route('/<int:order_id>/receipt', methods=['GET'])
@jwt_required()
def download_receipt(order_id):
    """Download order receipt as PDF"""
    user_id = get_user_id()
    
    from models import OrderItem
    
    order = Order.query.options(
        db.joinedload(Order.user),
        db.joinedload(Order.address),
        db.joinedload(Order.order_items).joinedload(OrderItem.product)
    ).filter_by(id=order_id, user_id=user_id).first()
    
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
