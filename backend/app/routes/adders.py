from flask import Blueprint, jsonify, request
from ..extensions import db, jwt
from ..models import User, Charities, Wishes
from flask_jwt_extended import jwt_required

adders = Blueprint('adders', __name__, url_prefix='/adders')

MIN_WISHES = 3
MAX_WISHES = 5

@adders.route('/charity', methods=['POST'])
def add_charity():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    website = data.get('website')
    logo_url = data.get('logo_url')
    image_url = data.get('image_url')
    active = data.get('active', False)

    if not all([name, description, website, logo_url, image_url]):
        return jsonify({'success': False, 'message': 'Missing required charity details (name, description, website, logo_url, image_url)'}), 400
    
    wishes_data = data.get('wishes', [])
    num_wishes = len(wishes_data)

    if not (MIN_WISHES <= num_wishes <= MAX_WISHES):
        return jsonify({'success': False, 'message': f'A charity must have between {MIN_WISHES} and {MAX_WISHES} wishes'}), 400

    new_charity = Charities(
        name=name.strip(),
        description=description.strip(),
        website=website.strip(),
        logo_url=logo_url.strip(),
        image_url=image_url.strip(), 
        active=data.get('active', False)
    )
    db.session.add(new_charity)
    db.session.flush()  # Flush to get the charity ID

    for i, wish in enumerate(wishes_data):
        wish_name = wish.get('title') 
        wish_desc = wish.get('description')
        quantity = wish.get('quantity')
        unit_price = wish.get('unit_price')

        # Deep validation for required wish fields and values
        if not all([wish_name, wish_desc]):
            return jsonify({'success': False, 'message': f'Wish {i+1} is missing a title or description'}), 400
        
        # Numeric validation (quantity > 0, price > 0)
        if not (isinstance(quantity, (int, float)) and quantity > 0):
             return jsonify({'success': False, 'message': f'Wish {i+1} quantity must be a number greater than 0'}), 400
        
        if not (isinstance(unit_price, (int, float)) and unit_price > 0):
             return jsonify({'success': False, 'message': f'Wish {i+1} unit_price must be a number greater than 0'}), 400
        
        new_wish = Wishes(
            charity_id=new_charity.id,
            name=wish_name.strip(),
            description=wish_desc.strip(),
            unit_price=unit_price,
            quantity=quantity,
            # Ensure total_price is passed as a number.
            total_price=wish.get('total_price', 0.0), 
            fulfilled=wish.get('fulfilled', False)
        )
        db.session.add(new_wish)
    db.session.commit()
    return jsonify({'success': True, 'message': f'Charity {name} added successfully'}), 201


@adders.route('/edit-charity', methods=['PUT']) # Use PUT for editing (better REST practice)
#@jwt_required() # 🚨 FIX: Ensure user is authenticated
def edit_charity():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'success': False, 'message': 'Invalid JSON body'}), 400

    # 1. Authorization Check (CRITICAL)
    # current_user_id = get_jwt_identity()
    # user = User.query.get(current_user_id)
    # if user is None or not user.is_admin:
    #     return jsonify({'success': False, 'message': 'Access denied: Administrator privileges required'}), 403 

    # 2. Find Charity
    charity_id = data.get('id')
    if not charity_id:
         return jsonify({'success': False, 'message': 'Charity ID is required'}), 400
         
    charity = Charities.query.get(charity_id)
    if not charity:
        return jsonify({'success': False, 'message': 'Charity not found'}), 404

    # 3. Update Charity Details and Validate Required Fields
    # Get values, stripping whitespace
    new_name = data.get('name', charity.name).strip()
    new_description = data.get('description', charity.description).strip()
    new_website = data.get('website', charity.website).strip()
    new_logo_url = data.get('logo_url', charity.logo_url).strip()
    new_image_url = data.get('image_url', charity.image_url).strip()

    # Basic validation for required fields
    if not all([new_name, new_description, new_website, new_logo_url, new_image_url]):
        return jsonify({'success': False, 'message': 'All main charity fields (name, description, website, URLs) are required and cannot be empty.'}), 400

    charity.name = new_name
    charity.description = new_description
    charity.website = new_website
    charity.logo_url = new_logo_url
    charity.image_url = new_image_url
    charity.active = data.get('active', charity.active) # 'active' toggle is fine here

    # 4. Wishes Validation (Count)
    wishes_data = data.get('wishes', [])
    num_wishes = len(wishes_data)

    if not (MIN_WISHES <= num_wishes <= MAX_WISHES):
        return jsonify({'success': False, 'message': f'A charity must have between {MIN_WISHES} and {MAX_WISHES} wishes'}), 400

    # 5. Smart Wishes Update Logic
    
    # Get IDs of wishes currently in the database for this charity
    existing_wish_ids = set(w.id for w in Wishes.query.filter_by(charity_id=charity.id).all())
    incoming_wish_ids = set()

    for i, wish_data in enumerate(wishes_data):
        wish_id = wish_data.get('id')
        
        # --- Wish Data Integrity Validation ---
        wish_name = wish_data.get('name') # Frontend uses 'title'
        wish_desc = wish_data.get('description')
        quantity = wish_data.get('quantity')
        unit_price = wish_data.get('unit_price')
        total_price = wish_data.get('total_price', 0.0)

        if not all([wish_name, wish_desc]) or wish_name.strip() == "" or wish_desc.strip() == "":
            return jsonify({'success': False, 'message': f'Wish {i+1} is missing a title or description'}), 400
        
        if not (isinstance(quantity, (int, float)) and quantity > 0):
             return jsonify({'success': False, 'message': f'Wish {i+1} quantity must be a number greater than 0'}), 400
        
        if not (isinstance(unit_price, (int, float)) and unit_price > 0):
             return jsonify({'success': False, 'message': f'Wish {i+1} unit_price must be a number greater than 0'}), 400
        # --- End Validation ---

        if wish_id and wish_id in existing_wish_ids:
            # UPDATE existing wish
            wish_obj = Wishes.query.get(wish_id)
            if wish_obj:
                wish_obj.name = wish_name.strip()
                wish_obj.description = wish_desc.strip()
                wish_obj.quantity = quantity
                wish_obj.unit_price = unit_price
                wish_obj.total_price = total_price
                # Note: fulfilled status and total_price might need logic check based on current donations
                db.session.add(wish_obj)
                incoming_wish_ids.add(wish_id)
        else:
            # INSERT new wish
            new_wish = Wishes(
                charity_id=charity.id,
                name=wish_name.strip(),
                description=wish_desc.strip(),
                unit_price=unit_price,
                quantity=quantity,
                total_price=total_price,
                fulfilled=False # New/re-inserted wishes start unfulfilled
            )
            db.session.add(new_wish)

    # 6. Delete or Mark Missing Wishes (Cleanup)
    wishes_to_delete_ids = existing_wish_ids - incoming_wish_ids
    if wishes_to_delete_ids:
        # Better: Mark them as inactive/archived instead of deleting if they have associated donation data.
        # For simplicity (since the original code intended deletion):
        Wishes.query.filter(Wishes.id.in_(wishes_to_delete_ids)).delete(synchronize_session='fetch')
    
    # 7. Final Commit
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        # Log the error (not shown here)
        return jsonify({'success': False, 'message': f'Database error during update: {str(e)}'}), 500

    return jsonify({'success': True, 'message': f'Charity {charity.name} updated successfully'}), 200