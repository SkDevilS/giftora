"""
MoneyOne Payment Gateway Helper
Handles encryption, decryption, and API communication
"""
import base64
import json
import requests
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

# MoneyOne Configuration
MONEYONE_API_BASE = "https://api.moneyone.co.in"
MONEYONE_AES_KEY = b"01c57e9eea993dfdc9ffd593c4"  # 26 bytes - will be padded
MONEYONE_AES_IV = b"Tjr0NSGkvSivx1_W"  # 16 bytes

# Pad key to 32 bytes for AES-256
MONEYONE_AES_KEY_PADDED = MONEYONE_AES_KEY + b'\x00' * (32 - len(MONEYONE_AES_KEY))


def encrypt_payload(data):
    """
    Encrypt payload using AES encryption
    """
    try:
        # Convert data to JSON string
        json_data = json.dumps(data)
        
        # Create AES cipher
        cipher = AES.new(MONEYONE_AES_KEY_PADDED, AES.MODE_CBC, MONEYONE_AES_IV)
        
        # Pad and encrypt
        padded_data = pad(json_data.encode('utf-8'), AES.block_size)
        encrypted = cipher.encrypt(padded_data)
        
        # Base64 encode
        encrypted_b64 = base64.b64encode(encrypted).decode('utf-8')
        
        return encrypted_b64
    except Exception as e:
        print(f"Encryption error: {str(e)}")
        raise


def decrypt_payload(encrypted_data):
    """
    Decrypt payload using AES decryption
    """
    try:
        # Base64 decode
        encrypted_bytes = base64.b64decode(encrypted_data)
        
        # Create AES cipher
        cipher = AES.new(MONEYONE_AES_KEY_PADDED, AES.MODE_CBC, MONEYONE_AES_IV)
        
        # Decrypt and unpad
        decrypted = cipher.decrypt(encrypted_bytes)
        unpadded_data = unpad(decrypted, AES.block_size)
        
        # Parse JSON
        json_data = json.loads(unpadded_data.decode('utf-8'))
        
        return json_data
    except Exception as e:
        print(f"Decryption error: {str(e)}")
        raise


def moneyone_login(merchant_id, password):
    """
    Login to MoneyOne and get authentication token
    Note: Login endpoint does NOT use encryption
    """
    try:
        url = f"{MONEYONE_API_BASE}/api/merchant/login"
        payload = {
            "merchantId": merchant_id,
            "password": password
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        print(f"MoneyOne Login URL: {url}")
        print(f"Login Payload: {payload}")
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response Body: {response.text}")
        
        response.raise_for_status()
        
        return response.json()
    except Exception as e:
        print(f"MoneyOne login error: {str(e)}")
        raise


def create_payin_order(merchant_id, password, auth_key, module_secret, order_data):
    """
    Create PayIN order with MoneyOne
    
    order_data should contain:
    - amount: float
    - orderid: string
    - payee_fname: string
    - payee_lname: string (optional)
    - payee_mobile: string
    - payee_email: string
    - callbackurl: string (MANDATORY)
    """
    try:
        # Validate callback URL is present
        if not order_data.get('callbackurl'):
            return {
                'success': False,
                'message': 'Callback URL is mandatory'
            }
        
        # Get fresh authentication token
        print("Getting fresh MoneyOne authentication token...")
        login_response = moneyone_login(merchant_id, password)
        
        if not login_response.get('success'):
            return {
                'success': False,
                'message': f"MoneyOne login failed: {login_response.get('message', 'Unknown error')}"
            }
        
        # Extract token from login response
        token = login_response.get('token')
        if not token:
            return {
                'success': False,
                'message': 'No token received from MoneyOne login'
            }
        
        print(f"Successfully obtained token (first 30 chars): {token[:30]}...")
        
        # Encrypt the payload
        print(f"Encrypting order data: {order_data}")
        encrypted_data = encrypt_payload(order_data)
        print(f"Encrypted data (first 50 chars): {encrypted_data[:50]}...")
        
        # Prepare request with Bearer token AND X-Authorization-Key and X-Module-Secret
        url = f"{MONEYONE_API_BASE}/api/payin/order/create"
        headers = {
            "Authorization": f"Bearer {token}",
            "X-Authorization-Key": auth_key,
            "X-Module-Secret": module_secret,
            "Content-Type": "application/json"
        }
        payload = {"data": encrypted_data}
        
        # Debug logging
        print(f"MoneyOne Create Order URL: {url}")
        print(f"Headers: Authorization=Bearer {token[:30]}..., X-Authorization-Key={auth_key[:20]}..., X-Module-Secret={module_secret[:20]}...")
        print(f"Encrypted Payload: {payload}")
        
        # Make request
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        # Log response details
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        response.raise_for_status()
        
        # Parse response
        response_data = response.json()
        
        # Check if response has encrypted data
        if 'data' in response_data and isinstance(response_data['data'], str):
            print("Decrypting response data...")
            decrypted_data = decrypt_payload(response_data['data'])
            print(f"Decrypted response: {decrypted_data}")
            return {
                'success': True,
                'data': decrypted_data
            }
        
        # If response is already decrypted or has success field
        if response_data.get('success'):
            return response_data
        
        return {
            'success': False,
            'message': response_data.get('message', 'Unknown error from MoneyOne')
        }
        
    except requests.exceptions.HTTPError as e:
        print(f"MoneyOne HTTP error: {e}")
        error_text = e.response.text if hasattr(e, 'response') else 'No response'
        print(f"Response content: {error_text}")
        return {
            'success': False,
            'message': f'HTTP Error {e.response.status_code}: {error_text}'
        }
    except Exception as e:
        print(f"MoneyOne create order error: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'message': str(e)
        }


def prepare_moneyone_params(order, user, address, callback_url):
    """
    Prepare parameters for MoneyOne PayIN order
    """
    # Split full name
    full_name = address.full_name.split(' ', 1)
    first_name = full_name[0]
    last_name = full_name[1] if len(full_name) > 1 else ''
    
    params = {
        "amount": float(order.total_amount),
        "orderid": order.order_number,
        "payee_fname": first_name,
        "payee_lname": last_name,
        "payee_mobile": address.phone,
        "payee_email": user.email,
        "callbackurl": callback_url
    }
    
    return params



def generate_qr_code(qr_string):
    """
    Generate QR code from QR string
    Returns base64 encoded QR code image
    """
    try:
        import qrcode
        from io import BytesIO
        
        # Create QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_string)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    except Exception as e:
        print(f"QR code generation error: {str(e)}")
        raise
