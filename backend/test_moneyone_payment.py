"""
Test MoneyOne Payment Integration
Tests login and payment order creation
"""
import sys
import os
sys.path.append(os.path.dirname(__file__))

from utils.moneyone_helper import moneyone_login, create_payin_order, encrypt_payload, decrypt_payload
from config import Config

def test_encryption():
    """Test encryption and decryption"""
    print("\n=== Testing Encryption/Decryption ===")
    test_data = {
        "amount": 100.00,
        "orderid": "TEST123456",
        "payee_fname": "John",
        "payee_lname": "Doe",
        "payee_mobile": "9876543210",
        "payee_email": "test@example.com",
        "callbackurl": "https://example.com/callback"
    }
    
    print(f"Original data: {test_data}")
    
    encrypted = encrypt_payload(test_data)
    print(f"Encrypted (first 50 chars): {encrypted[:50]}...")
    
    decrypted = decrypt_payload(encrypted)
    print(f"Decrypted data: {decrypted}")
    
    if test_data == decrypted:
        print("✓ Encryption/Decryption working correctly!")
        return True
    else:
        print("✗ Encryption/Decryption failed!")
        return False

def test_login():
    """Test MoneyOne login"""
    print("\n=== Testing MoneyOne Login ===")
    
    merchant_id = Config.MONEYONE_MERCHANT_ID
    password = Config.MONEYONE_PASSWORD
    
    print(f"Merchant ID: {merchant_id}")
    print(f"Password: {'*' * len(password)}")
    
    try:
        response = moneyone_login(merchant_id, password)
        print(f"Login Response: {response}")
        
        if response.get('success'):
            print(f"✓ Login successful!")
            print(f"Token (first 30 chars): {response.get('token', '')[:30]}...")
            print(f"Merchant Name: {response.get('merchantName')}")
            print(f"Email: {response.get('email')}")
            return True, response.get('token')
        else:
            print(f"✗ Login failed: {response.get('message')}")
            return False, None
    except Exception as e:
        print(f"✗ Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False, None

def test_create_order():
    """Test creating a payment order"""
    print("\n=== Testing Payment Order Creation ===")
    
    merchant_id = Config.MONEYONE_MERCHANT_ID
    password = Config.MONEYONE_PASSWORD
    auth_key = Config.MONEYONE_AUTH_KEY
    module_secret = Config.MONEYONE_MODULE_SECRET
    
    # Test order data
    order_data = {
        "amount": 100.00,
        "orderid": f"TEST{os.urandom(4).hex().upper()}",
        "payee_fname": "Test",
        "payee_lname": "User",
        "payee_mobile": "9876543210",
        "payee_email": "test@trendoraventures.in",
        "callbackurl": "https://trendoraventures.in/api/moneyone/callback"
    }
    
    print(f"Order Data: {order_data}")
    
    try:
        result = create_payin_order(merchant_id, password, auth_key, module_secret, order_data)
        print(f"\nOrder Creation Result: {result}")
        
        if result.get('success'):
            print("✓ Order created successfully!")
            data = result.get('data', {})
            print(f"Transaction ID: {data.get('txn_id')}")
            print(f"Order ID: {data.get('order_id')}")
            print(f"Amount: {data.get('amount')}")
            print(f"Payment URL: {data.get('payment_url')}")
            return True
        else:
            print(f"✗ Order creation failed: {result.get('message')}")
            return False
    except Exception as e:
        print(f"✗ Order creation error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("MoneyOne Payment Gateway Integration Test")
    print("=" * 60)
    
    # Test 1: Encryption
    enc_success = test_encryption()
    
    # Test 2: Login
    login_success, token = test_login()
    
    # Test 3: Create Order
    if login_success:
        order_success = test_create_order()
    else:
        print("\nSkipping order creation test due to login failure")
        order_success = False
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary:")
    print("=" * 60)
    print(f"Encryption/Decryption: {'✓ PASS' if enc_success else '✗ FAIL'}")
    print(f"Login: {'✓ PASS' if login_success else '✗ FAIL'}")
    print(f"Create Order: {'✓ PASS' if order_success else '✗ FAIL'}")
    print("=" * 60)
    
    if enc_success and login_success and order_success:
        print("\n🎉 All tests passed! MoneyOne integration is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Please check the errors above.")
