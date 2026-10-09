"""
PayU Payment Gateway Helper
Handles hash generation, verification, and payment processing
"""
import hashlib
import requests
from flask import current_app


def generate_payu_hash(params, salt):
    """
    Generate PayU payment hash
    Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    """
    key = params.get('key', '')
    txnid = params.get('txnid', '')
    amount = params.get('amount', '')
    productinfo = params.get('productinfo', '')
    firstname = params.get('firstname', '')
    email = params.get('email', '')
    udf1 = params.get('udf1', '')
    udf2 = params.get('udf2', '')
    udf3 = params.get('udf3', '')
    udf4 = params.get('udf4', '')
    udf5 = params.get('udf5', '')
    
    # Construct hash string with exact parameter sequence
    hash_string = f"{key}|{txnid}|{amount}|{productinfo}|{firstname}|{email}|{udf1}|{udf2}|{udf3}|{udf4}|{udf5}||||||{salt}"
    
    # Generate SHA-512 hash
    hash_value = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
    
    return hash_value


def verify_payu_response_hash(params, salt):
    """
    Verify PayU response hash (reverse hashing)
    Reverse sequence: SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
    """
    status = params.get('status', '')
    key = params.get('key', '')
    txnid = params.get('txnid', '')
    amount = params.get('amount', '')
    productinfo = params.get('productinfo', '')
    firstname = params.get('firstname', '')
    email = params.get('email', '')
    udf1 = params.get('udf1', '')
    udf2 = params.get('udf2', '')
    udf3 = params.get('udf3', '')
    udf4 = params.get('udf4', '')
    udf5 = params.get('udf5', '')
    received_hash = params.get('hash', '')
    
    # Construct reverse hash string
    hash_string = f"{salt}|{status}||||||{udf5}|{udf4}|{udf3}|{udf2}|{udf1}|{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    
    # Generate SHA-512 hash
    computed_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
    
    # Compare hashes (case-insensitive)
    return computed_hash.lower() == received_hash.lower()


def verify_payment_with_payu(txnid, merchant_key, salt):
    """
    Verify payment status with PayU API
    """
    try:
        verify_url = current_app.config.get('PAYU_VERIFY_URL')
        
        # Generate hash for verify API: sha512(key|command|var1|salt)
        command = 'verify_payment'
        hash_string = f"{merchant_key}|{command}|{txnid}|{salt}"
        hash_value = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
        
        # Prepare request data
        data = {
            'key': merchant_key,
            'command': command,
            'var1': txnid,
            'hash': hash_value
        }
        
        # Make API request
        response = requests.post(verify_url, data=data, timeout=30)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {
                'status': 0,
                'msg': f'API request failed with status {response.status_code}'
            }
            
    except Exception as e:
        return {
            'status': 0,
            'msg': f'Error verifying payment: {str(e)}'
        }


def prepare_payu_params(order, user, address, merchant_key, success_url, failure_url):
    """
    Prepare PayU payment parameters
    """
    # Get phone number and truncate to first 10 digits
    phone = user.phone or address.phone or ''
    phone_truncated = str(phone)[:10] if phone else ''
    
    params = {
        'key': merchant_key,
        'txnid': order.payu_txnid,
        'amount': f"{order.total_amount:.2f}",
        'productinfo': f"Order #{order.order_number}",
        'firstname': user.name.split()[0] if user.name else 'Customer',
        'email': user.email,
        'phone': phone_truncated,
        'lastname': ' '.join(user.name.split()[1:]) if len(user.name.split()) > 1 else '',
        'surl': success_url,
        'furl': failure_url,
        'address1': address.address_line1,
        'address2': address.address_line2 or '',
        'city': address.city,
        'state': address.state,
        'country': 'India',
        'zipcode': address.pincode,
        'udf1': str(order.id),  # Store order ID for reference
        'udf2': order.order_number,
        'udf3': '',
        'udf4': '',
        'udf5': ''
    }
    
    return params
