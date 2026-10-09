"""
Test MoneyOne Authentication
Run this to verify your credentials and see the exact error
"""
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from utils.moneyone_helper import create_payin_order
from config import Config

def test_moneyone_auth():
    """Test MoneyOne authentication with a sample order"""
    
    print("=" * 60)
    print("MoneyOne Authentication Test")
    print("=" * 60)
    
    # Get credentials
    auth_key = Config.MONEYONE_AUTH_KEY
    module_secret = Config.MONEYONE_MODULE_SECRET
    merchant_id = Config.MONEYONE_MERCHANT_ID
    password = Config.MONEYONE_PASSWORD
    
    print("\nCredentials Check:")
    print(f"Merchant ID: {merchant_id}")
    print(f"Password: {'*' * len(password) if password else 'NOT SET'}")
    print(f"Auth Key: {auth_key[:30]}... (length: {len(auth_key)})")
    print(f"Module Secret: {module_secret[:30]}... (length: {len(module_secret)})")
    
    if not all([auth_key, module_secret, merchant_id, password]):
        print("\n❌ ERROR: Missing credentials in .env file")
        print("Please check your backend/.env file")
        return
    
    # Test order data
    test_order = {
        "amount": 100.00,
        "orderid": "TEST_ORDER_123456",
        "payee_fname": "Test",
        "payee_lname": "User",
        "payee_mobile": "9876543210",
        "payee_email": "test@example.com",
        "callbackurl": "http://localhost:5000/api/moneyone/callback"
    }
    
    print("\n" + "=" * 60)
    print("Attempting to create test order...")
    print("=" * 60)
    
    try:
        result = create_payin_order(auth_key, module_secret, test_order)
        print("\n✅ SUCCESS!")
        print(f"Response: {result}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print("\nPossible issues:")
        print("1. Incorrect Auth Key or Module Secret")
        print("2. Credentials expired or revoked")
        print("3. IP whitelist restriction")
        print("4. Account not activated")
        print("\nPlease verify your credentials with MoneyOne support")

if __name__ == "__main__":
    test_moneyone_auth()
