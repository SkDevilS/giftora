"""
Test script for Auto Order API
Run this after starting the backend server to verify the API works correctly
"""
import requests
import json
from datetime import datetime

# API Configuration
API_URL = "http://localhost:5000/api/auto-order/create"

def test_auto_order_api():
    """Test the auto order API with sample data"""
    
    print("=" * 60)
    print("Testing Auto Order API")
    print("=" * 60)
    print()
    
    # Test Case 1: New customer with timestamp
    print("Test Case 1: New Customer with Timestamp")
    print("-" * 60)
    
    test_data_1 = {
        "amount": 1000,
        "orderid": f"TEST{int(datetime.now().timestamp())}",
        "payee_name": "Test Customer 1",
        "payee_email": f"test{int(datetime.now().timestamp())}@example.com",
        "payee_mobile": "9876543210",
        "UTR": f"UTR{int(datetime.now().timestamp())}",
        "Refno": f"REF{int(datetime.now().timestamp())}",
        "TimeStamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    print(f"Request Data:")
    print(json.dumps(test_data_1, indent=2))
    print()
    
    try:
        response = requests.post(API_URL, json=test_data_1, headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        print()
        
        if response.status_code == 201:
            print("✓ Test Case 1 PASSED")
            result_1 = response.json()
            order_number_1 = result_1.get('order', {}).get('order_number')
            receipt_number_1 = result_1.get('order', {}).get('receipt_number')
            print(f"  Order Number: {order_number_1}")
            print(f"  Receipt Number: {receipt_number_1}")
            if result_1.get('user_created'):
                print(f"  New user created with password: {result_1.get('default_password')}")
        else:
            print("✗ Test Case 1 FAILED")
            
    except Exception as e:
        print(f"✗ Test Case 1 ERROR: {str(e)}")
    
    print()
    print("=" * 60)
    print()
    
    # Test Case 2: Without timestamp
    print("Test Case 2: Without Timestamp")
    print("-" * 60)
    
    test_data_2 = {
        "amount": 750,
        "orderid": f"TEST{int(datetime.now().timestamp()) + 1}",
        "payee_name": "Test Customer 2",
        "payee_email": f"test{int(datetime.now().timestamp()) + 1}@example.com",
        "payee_mobile": "9876543211",
        "UTR": f"UTR{int(datetime.now().timestamp()) + 1}",
        "Refno": f"REF{int(datetime.now().timestamp()) + 1}"
    }
    
    print(f"Request Data:")
    print(json.dumps(test_data_2, indent=2))
    print()
    
    try:
        response = requests.post(API_URL, json=test_data_2, headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        print()
        
        if response.status_code == 201:
            print("✓ Test Case 2 PASSED")
            result_2 = response.json()
            order_number_2 = result_2.get('order', {}).get('order_number')
            receipt_number_2 = result_2.get('order', {}).get('receipt_number')
            print(f"  Order Number: {order_number_2}")
            print(f"  Receipt Number: {receipt_number_2}")
        else:
            print("✗ Test Case 2 FAILED")
            
    except Exception as e:
        print(f"✗ Test Case 2 ERROR: {str(e)}")
    
    print()
    print("=" * 60)
    print()
    
    # Test Case 3: Error test - missing field
    print("Test Case 3: Error Handling (Missing Field)")
    print("-" * 60)
    
    test_data_3 = {
        "amount": 1000,
        "orderid": f"TEST{int(datetime.now().timestamp()) + 2}",
        "payee_name": "Test Customer 3",
        "payee_email": f"test{int(datetime.now().timestamp()) + 2}@example.com"
        # Missing payee_mobile, UTR, Refno
    }
    
    print(f"Request Data:")
    print(json.dumps(test_data_3, indent=2))
    print()
    
    try:
        response = requests.post(API_URL, json=test_data_3, headers={"Content-Type": "application/json"})
        
        print(f"Status Code: {response.status_code}")
        print(f"Response:")
        print(json.dumps(response.json(), indent=2))
        print()
        
        if response.status_code == 400:
            print("✓ Test Case 3 PASSED (Error handled correctly)")
        else:
            print("✗ Test Case 3 FAILED (Should return 400 error)")
            
    except Exception as e:
        print(f"✗ Test Case 3 ERROR: {str(e)}")
    
    print()
    print("=" * 60)
    print("Testing Complete!")
    print("=" * 60)
    print()
    print("Summary:")
    print("- Check the admin panel to verify orders were created")
    print("- Download receipts to verify UTR and Ref No are included")
    print("- Try logging in with the created customer accounts (password: test@123)")
    print()

if __name__ == "__main__":
    print()
    print("Make sure the backend server is running on http://localhost:5000")
    print()
    input("Press Enter to start testing...")
    print()
    
    test_auto_order_api()
