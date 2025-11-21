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