"""
SabPaisa Payment Gateway Webhook Handler
Receives webhooks from SabPaisa, verifies signature, and forwards to MoneyOne
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
import json
import requests
import hmac
import hashlib
import base64
import time
import sys
import os

# Add utils directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from config import Config

sabpaisa_bp = Blueprint('sabpaisa', __name__)

# Store processed idempotency keys to prevent duplicate processing
processed_webhooks = {}


def cleanup_old_webhooks():
    """Remove webhooks older than 24 hours from memory"""
    current_time = time.time()
    expired_keys = [key for key, timestamp in processed_webhooks.items() 
                    if current_time - timestamp > 86400]
    for key in expired_keys:
        del processed_webhooks[key]


def verify_sabpaisa_signature(raw_body, signature_header, webhook_secret):
    """
    Verify SabPaisa webhook signature using HMAC-SHA256
    
    According to SabPaisa docs:
    - Signature format: {timestamp}.{base64_signature}
    - String to sign: {timestamp}.{raw_request_body}
    - Algorithm: HMAC-SHA256
    - Timestamp tolerance: 5 minutes (300000 ms)
    
    Args:
        raw_body: Raw request body (exact bytes as received)
        signature_header: X-SabPaisa-Signature header value
        webhook_secret: Webhook secret key from SabPaisa
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if not signature_header:
        return False, "Missing X-SabPaisa-Signature header"
    
    if not webhook_secret:
        return False, "Webhook secret not configured"
    
    try:
        # Split signature header: {timestamp}.{base64_signature}
        parts = signature_header.split('.', 1)
        if len(parts) != 2:
            return False, "Invalid signature format (expected timestamp.signature)"
        
        timestamp_str, received_signature = parts
        
        # Validate timestamp format
        try:
            timestamp_ms = int(timestamp_str)
        except ValueError:
            return False, "Invalid timestamp format"
        
        # Check timestamp freshness (5-minute tolerance = 300000 ms)
        current_time_ms = int(time.time() * 1000)
        time_diff = abs(current_time_ms - timestamp_ms)
        
        if time_diff > 300000:
            return False, f"Webhook signature expired (time diff: {time_diff}ms, tolerance: 300000ms)"
        
        # Build the string to sign: {timestamp}.{raw_body}
        to_sign = f"{timestamp_str}.{raw_body}"
        
        # Compute HMAC-SHA256
        computed_hmac = hmac.new(
            webhook_secret.encode('utf-8'),
            to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Base64 encode the result
        expected_signature = base64.b64encode(computed_hmac).decode('utf-8')
        
        # Constant-time comparison to prevent timing attacks
        is_valid = hmac.compare_digest(expected_signature, received_signature)
        
        if not is_valid:
            return False, "Signature mismatch"
        
        return True, None
        
    except Exception as e:
        return False, f"Signature verification error: {str(e)}"


def is_webhook_processed(idempotency_key):
    """Check if webhook has already been processed"""
    cleanup_old_webhooks()
    return idempotency_key in processed_webhooks


def mark_webhook_processed(idempotency_key):
    """Mark webhook as processed"""
    processed_webhooks[idempotency_key] = time.time()


@sabpaisa_bp.route('/webhook', methods=['POST', 'OPTIONS'])
def receive_webhook():
    """
    Receive SabPaisa webhook callback
    
    Endpoint: POST /api/callback/sabpaisa/webhook
    
    This endpoint:
    1. Verifies the HMAC-SHA256 signature
    2. Checks timestamp freshness (5-minute tolerance)
    3. Checks for duplicate webhooks using idempotency_key
    4. Forwards the webhook to MoneyOne callback URL
    5. Returns 200 OK to acknowledge receipt
    """
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        # Get raw body (exact bytes as received - critical for signature verification)
        raw_body = request.get_data(as_text=True)
        
        # Get SabPaisa headers
        signature_header = request.headers.get('X-SabPaisa-Signature', '')
        timestamp_header = request.headers.get('X-SabPaisa-Timestamp', '')
        event_header = request.headers.get('X-SabPaisa-Event', '')
        delivery_id = request.headers.get('X-SabPaisa-Delivery-Id', '')
        
        print(f"\n{'='*70}")
        print(f"SabPaisa Webhook Received")
        print(f"Delivery ID: {delivery_id}")
        print(f"Event: {event_header}")
        print(f"Timestamp: {timestamp_header}")
        print(f"{'='*70}")
        
        # Get webhook secret from config
        webhook_secret = Config.SABPAISA_WEBHOOK_SECRET
        
        if not webhook_secret:
            print("ERROR: SABPAISA_WEBHOOK_SECRET not configured in environment")
            # Return 200 OK anyway to prevent SabPaisa from retrying
            return jsonify({"status": "received", "error": "Webhook secret not configured"}), 200
        
        # Step 1: Verify signature
        print("\n[1/4] Verifying signature...")
        is_valid, error_msg = verify_sabpaisa_signature(raw_body, signature_header, webhook_secret)
        
        if not is_valid:
            print(f"✗ Signature verification FAILED: {error_msg}")
            print(f"{'='*70}\n")
            # Return 401 for invalid signature
            return jsonify({"error": f"Signature verification failed: {error_msg}"}), 401
        
        print("✓ Signature verified successfully")
        
        # Step 2: Parse payload
        print("\n[2/4] Parsing payload...")
        try:
            payload = json.loads(raw_body)
        except json.JSONDecodeError as e:
            print(f"✗ Invalid JSON payload: {str(e)}")
            return jsonify({"error": "Invalid JSON payload"}), 400
        
        # Extract idempotency key
        idempotency_key = payload.get('idempotency_key')
        if not idempotency_key:
            print("✗ Missing idempotency_key in payload")
            return jsonify({"error": "Missing idempotency_key"}), 400
        
        print(f"✓ Payload parsed successfully")
        print(f"  Event: {payload.get('event')}")
        print(f"  Status: {payload.get('status')}")
        print(f"  Transaction ID: {payload.get('txn_id')}")
        print(f"  Merchant Transaction ID: {payload.get('merchant_txn_id')}")
        print(f"  Amount: {payload.get('request_amount')} {payload.get('currency')}")
        print(f"  Idempotency Key: {idempotency_key}")
        
        # Step 3: Check for duplicate webhook
        print("\n[3/4] Checking for duplicate webhook...")
        if is_webhook_processed(idempotency_key):
            print(f"✓ Duplicate webhook detected (already processed)")
            print(f"  Returning 200 OK without re-processing")
            print(f"{'='*70}\n")
            return jsonify({"status": "already_processed"}), 200
        
        print(f"✓ New webhook (not processed before)")
        
        # Step 4: Forward webhook to MoneyOne
        print("\n[4/4] Forwarding webhook to MoneyOne...")
        moneyone_callback_url = Config.MONEYONE_CALLBACK_URL
        
        if not moneyone_callback_url:
            print("✗ ERROR: MONEYONE_CALLBACK_URL not configured")
            mark_webhook_processed(idempotency_key)
            print(f"{'='*70}\n")
            return jsonify({"status": "received"}), 200
        
        # Prepare headers for forwarding (include all SabPaisa headers)
        forward_headers = {
            'Content-Type': 'application/json',
            'X-SabPaisa-Signature': signature_header,
            'X-SabPaisa-Timestamp': timestamp_header,
            'X-SabPaisa-Event': event_header,
            'X-SabPaisa-Delivery-Id': delivery_id
        }
        
        forward_success = False
        try:
            # Forward the webhook with exact raw body and headers
            response = requests.post(
                moneyone_callback_url,
                data=raw_body,  # Use raw body to preserve exact format for signature verification
                headers=forward_headers,
                timeout=10
            )
            
            forward_success = response.status_code in [200, 201, 202]
            print(f"MoneyOne response status: {response.status_code}")
            if response.text:
                print(f"MoneyOne response: {response.text[:200]}")
            
            if forward_success:
                print("✓ Webhook forwarded to MoneyOne successfully")
            else:
                print(f"✗ MoneyOne returned non-2xx status: {response.status_code}")
            
        except requests.exceptions.Timeout:
            print("✗ Timeout forwarding webhook to MoneyOne (10s timeout)")
        except requests.exceptions.RequestException as e:
            print(f"✗ Error forwarding webhook to MoneyOne: {str(e)}")
        except Exception as e:
            print(f"✗ Unexpected error forwarding webhook: {str(e)}")
        
        # Mark webhook as processed (even if forwarding failed)
        mark_webhook_processed(idempotency_key)
        
        # Always return 200 OK to acknowledge receipt to SabPaisa
        print(f"\n✓ Webhook processed and acknowledged")
        print(f"{'='*70}\n")
        
        return jsonify({
            "status": "received",
            "idempotency_key": idempotency_key,
            "forwarded_to_moneyone": forward_success
        }), 200
        
    except Exception as e:
        print(f"\n✗ Unexpected error processing webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        print(f"{'='*70}\n")
        
        # Still return 200 to prevent SabPaisa from retrying
        return jsonify({"status": "received", "error": str(e)}), 200


@sabpaisa_bp.route('/health', methods=['GET'])
def webhook_health():
    """Health check endpoint for SabPaisa webhook"""
    return jsonify({
        "status": "healthy",
        "service": "SabPaisa Webhook Handler",
        "timestamp": datetime.utcnow().isoformat()
    }), 200
