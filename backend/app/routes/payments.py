import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import requests
from ..models import Payments, Wishes
from ..extensions import db, jwt

payments_bp = Blueprint('payments', __name__, url_prefix="/payments")


PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY', "sk_test_84af6feb64e3d2a52369d14c6c2e3bff3f3b387a")
PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize"
PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify/"

@payments_bp.route('/api/initialize-payment', methods=['POST'])
def initialize_payments():
    try:
        data = request.get_json()
        print(f"Data Received: {data}")

        email = data.get('email')
        quantity = data.get('quantity')
        unit_price = data.get('unit_price')
        amount = data.get('amount')
        item_id = data.get('id')

        if not all([email, amount, item_id]):
            return jsonify({"status": False, "message": "Missing details"}), 400

        amount_kobo = int(float(amount) * 100)

        # 2. Add metadata to the payload
        # You can add as many custom fields here as you need
        payload = {
            "email": email,
            "amount": amount_kobo,
            "callback_url": "http://127.0.0.1:5000/payments/payment_callback",
            "metadata": {
                "item_id": item_id,
                "quantity": quantity,
                "unit_price": unit_price,
                "custom_notes": "Purchasing specific item"
            }
        }
        print(f"Payload Sent: {payload}")

        headers = {
            "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
            "Content-Type": "application/json"
        }


        response = requests.post(PAYSTACK_INIT_URL, json=payload, headers=headers)
        response_data = response.json()
        #print(response_data)

        if response.status_code == 200 and response_data['status']:
            return jsonify({
                "status": True, 
                "auth_url": response_data['data']['authorization_url'],
                "reference": response_data['data']['reference']
            })
        else:
            return jsonify({"status": False, "message": "Init failed"}), 400

    except Exception as e:
        return jsonify({"status": False, "message": str(e)}), 500
    

@payments_bp.route('/payment_callback', methods=['GET'])
def payment_callback():
    reference = request.args.get('reference')
    if not reference:
        return "No reference", 400

    # Helper function to safely get integers
    def safe_int(value, default=0):
        try:
            if value is None or value == '':
                return default
            return int(value)
        except (ValueError, TypeError):
            return default

    # Helper function to safely get floats
    def safe_float(value, default=0.0):
        try:
            if value is None or value == '':
                return default
            return float(value)
        except (ValueError, TypeError):
            return default

    # Verify transaction
    headers = {"Authorization": f"Bearer {PAYSTACK_SECRET_KEY}"}
    verify_response = requests.get(f"{PAYSTACK_VERIFY_URL}{reference}", headers=headers)
    verify_data = verify_response.json()

    #print(verify_data)

    if verify_data['status'] and verify_data['data']['status'] == 'success':
        # 3. Retrieve the item_id from metadata
        # Note: Paystack returns metadata inside the 'data' object
        data = verify_data['data']
        metadata = verify_data['data']['metadata']

        paid_amount = safe_float(data.get('amount')) / 100  # Convert back to Naira

        # Paystack usually returns the payer email under the `customer` object
        # Try several places so we robustly capture the email
        paid_email = None
        if isinstance(data, dict):
            customer = data.get('customer') or {}
            paid_email = customer.get('email') if isinstance(customer, dict) else None
            if not paid_email:
                paid_email = data.get('email')
        # As a last resort, check metadata in case client passed email there
        if not paid_email and isinstance(metadata, dict):
            paid_email = metadata.get('email')

        if not paid_email:
            paid_email = "unknown@example.com"  # Fallback email
        
        paid_item_id = safe_int(metadata.get('item_id'), default=None) # Keep None if ID is missing
        paid_quantity = safe_int(metadata.get('quantity'), default=1)
        paid_unit_price = safe_float(metadata.get('unit_price'), default=0.0)

        print(f"Payment Callback Data: item_id={paid_item_id}, quantity={paid_quantity}, unit_price={paid_unit_price}, amount={paid_amount}, email={paid_email}")

        # 4. Validate item_id and ensure the referenced wish exists.
        if paid_item_id is None:
            print("Missing item_id in payment metadata; aborting creation of payment record.")
            return "Missing item_id in payment metadata", 400

        wish_obj = Wishes.query.get(paid_item_id)
        if not wish_obj:
            print(f"Invalid item_id: {paid_item_id}. No such wish.")
            return f"Invalid item_id: {paid_item_id}", 400

        # Create and persist Payment record in a transaction-safe way
        try:
            payment = Payments(
                wish_id=paid_item_id,
                quantity=paid_quantity,
                unit_price=paid_unit_price,
                amount=paid_amount,
                donor_email=paid_email
            )
            db.session.add(payment)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"Failed to create payment record: {e}")
            return "Server error creating payment record", 500

        # Update the wish's current_price when a payment is made
        try:
            Wishes.update_current_price(paid_item_id, paid_amount)
            print(f"Updated wish ID {paid_item_id} current_price by {paid_amount}")
        except Exception as e:
            # Log or handle the error as needed; do not fail the callback
            print(f"Failed to update wish current_price: {e}")

        return f"Success! You paid for Item ID: {paid_item_id}"
    else:
        return "Payment Failed"