from flask import Blueprint, request, jsonify
from models import db, User, Order, OrderItem, Product, Address, PaymentDetail
from datetime import datetime
import uuid
import pytz

auto_order_bp = Blueprint('auto_order', __name__)

def generate_receipt_number():
    """Generate unique receipt number"""
    timestamp = datetime.utcnow().strftime('%y%m%d')
    unique_id = uuid.uuid4().hex[:4].upper()
    return f"R{timestamp}{unique_id}"

def select_products_for_amount(target_amount):
    """
    Select products to match the target amount.
    Strategy: Try to find exact match first, then combine products to reach the amount.
    """
    # Get all active products ordered by price
    products = Product.query.filter_by(is_active=True).filter(Product.stock > 0).order_by(Product.price).all()
    
    if not products:
        return None, "No products available"
    
    selected_items = []
    remaining_amount = target_amount
    
    # First, try to find an exact match
    for product in products:
        if product.price == target_amount:
            return [{
                'product_id': product.id,
                'quantity': 1,
                'price': product.price
            }], None
    
    # If no exact match, try to find products that sum up to the amount
    # Start with the largest product that doesn't exceed the amount
    products_desc = sorted(products, key=lambda p: p.price, reverse=True)
    
    for product in products_desc:
        if product.price <= remaining_amount:
            # Calculate how many of this product we can add
            quantity = int(remaining_amount / product.price)
            if quantity > 0:
                selected_items.append({
                    'product_id': product.id,
                    'quantity': quantity,
                    'price': product.price
                })
                remaining_amount -= (product.price * quantity)
                
                # If we've matched the amount exactly, we're done
                if remaining_amount == 0:
                    break
    
    # If we still have remaining amount, add the cheapest product to make up the difference
    if remaining_amount > 0 and products:
        cheapest_product = products[0]  # Already sorted by price ascending
        additional_quantity = 1
        selected_items.append({
            'product_id': cheapest_product.id,
            'quantity': additional_quantity,
            'price': cheapest_product.price
        })
    
    return selected_items, None

@auto_order_bp.route('/create', methods=['POST'])
def create_auto_order():
    """
    Create an automated order from payment gateway data.
    Expected JSON format:
    {
        "amount": 1000,
        "orderid": "93107952925922625",
        "payee_name": "Jagdish Bhai Kara",
        "payee_email": "jagdishbhaikara93915@gmail.com",
        "payee_mobile": "7247611201",
        "UTR": "306187614962",
        "Refno": "27157203825",
        "TimeStamp": "2024-01-15 10:30:00"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'orderid', 'payee_name', 'payee_email', 'payee_mobile', 'UTR', 'Refno']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        amount = float(data['amount'])
        order_id_external = str(data['orderid'])
        payee_name = data['payee_name']
        payee_email = data['payee_email'].strip().lower()
        # Extract first 10 digits from mobile number
        payee_mobile = str(data['payee_mobile'])[:10]
        utr = data['UTR']
        ref_no = data['Refno']
        timestamp_str = data.get('TimeStamp', '')
        
        # Parse timestamp and ensure it's in IST
        ist_tz = pytz.timezone('Asia/Kolkata')
        transaction_timestamp = None
        
        if timestamp_str:
            try:
                # Try parsing with time
                parsed_dt = datetime.strptime(timestamp_str, '%Y-%m-%d %H:%M:%S')
            except:
                try:
                    parsed_dt = datetime.strptime(timestamp_str, '%Y-%m-%dT%H:%M:%S')
                except:
                    try:
                        # Try parsing date only
                        parsed_dt = datetime.strptime(timestamp_str, '%Y-%m-%d')
                    except:
                        # If all parsing fails, use current IST time
                        parsed_dt = datetime.now(ist_tz).replace(tzinfo=None)
            
            # Treat the parsed datetime as IST (don't convert, just localize)
            transaction_timestamp = ist_tz.localize(parsed_dt).astimezone(pytz.UTC).replace(tzinfo=None)
        else:
            # Use current IST time
            transaction_timestamp = datetime.now(ist_tz).astimezone(pytz.UTC).replace(tzinfo=None)
        
        # Check if user exists, if not create one
        user = User.query.filter_by(email=payee_email).first()
        
        if not user:
            # Create new user with default password
            user = User(
                name=payee_name,
                email=payee_email,
                phone=payee_mobile,
                role='customer',
                is_active=True,
                is_verified=True  # Auto-verify since payment is confirmed
            )
            user.set_password('test@123')
            db.session.add(user)
            db.session.flush()  # Get user ID
        
        # Create or get default address for the user
        address = Address.query.filter_by(user_id=user.id, is_default=True).first()
        
        if not address:
            # Create a default address
            address = Address(
                user_id=user.id,
                full_name=payee_name,
                phone=payee_mobile,
                address_line1='Auto-generated address',
                address_line2='',
                city='Not specified',
                state='Not specified',
                pincode='000000',
                is_default=True
            )
            db.session.add(address)
            db.session.flush()
        
        # Select products to match the amount
        selected_items, error = select_products_for_amount(amount)
        
        if error or not selected_items:
            return jsonify({'error': error or 'Could not select products for the given amount'}), 400
        
        # Calculate actual total
        actual_total = sum(item['price'] * item['quantity'] for item in selected_items)
        
        # Check if order with same order_number already exists
        # If yes, append a suffix to make it unique
        order_number = order_id_external
        existing_order = Order.query.filter_by(order_number=order_number).first()
        
        if existing_order:
            # Find the next available suffix
            suffix = 1
            while True:
                order_number = f"{order_id_external}-{suffix}"
                if not Order.query.filter_by(order_number=order_number).first():
                    break
                suffix += 1
            print(f"Duplicate order ID detected. Using order number: {order_number}")
        
        # Create order with the (possibly modified) order number
        # Set created_at to match transaction timestamp for auto orders
        order = Order(
            order_number=order_number,
            receipt_number=generate_receipt_number(),
            user_id=user.id,
            address_id=address.id,
            total_amount=actual_total,
            status='confirmed',  # Auto-confirm since payment is received
            payment_method='online',
            payment_status='paid',
            created_at=transaction_timestamp  # Use transaction time as order time
        )
        
        db.session.add(order)
        db.session.flush()
        
        # Add order items
        for item in selected_items:
            product = db.session.get(Product, item['product_id'])
            order_item = OrderItem(
                order_id=order.id,
                product_id=item['product_id'],
                quantity=item['quantity'],
                price=item['price'],
                size=None,
                color=None
            )
            db.session.add(order_item)
        
        # Add payment details with UTR and Ref No
        payment_detail = PaymentDetail(
            order_id=order.id,
            payment_method='online',
            utr=utr,
            ref_no=ref_no,
            transaction_timestamp=transaction_timestamp
        )
        db.session.add(payment_detail)
        
        db.session.commit()
        
        # Return order details
        return jsonify({
            'success': True,
            'message': 'Order created successfully',
            'order': order.to_dict(include_user=True),
            'user_created': user.created_at == user.updated_at,
            'default_password': 'test@123' if user.created_at == user.updated_at else None,
            'duplicate_order_id': order.order_number != order_id_external,
            'original_order_id': order_id_external,
            'final_order_number': order.order_number
        }), 201
        
    except ValueError as ve:
        db.session.rollback()
        return jsonify({'error': f'Invalid data format: {str(ve)}'}), 400
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to create order: {str(e)}'}), 500
