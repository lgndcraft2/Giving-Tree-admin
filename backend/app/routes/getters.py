from flask import Blueprint, jsonify
from ..extensions import db, jwt
from ..models import User, Charities, Wishes
from flask_jwt_extended import jwt_required

getters_bp = Blueprint('getters', __name__, url_prefix='/getters')

@getters_bp.route('/charities', methods=['GET'])
def get_charities():
    charities = Charities.query.all()
    charities_list = [{
        'id': charity.id,
        'name': charity.name,
        'description': charity.description,
        'website': charity.website,
        'logo_url': charity.logo_url,
        'img_url': charity.img_url,
        'active': charity.active,
        'created_at': charity.created_at
    } for charity in charities]
    return jsonify({'success': True, 'charities': charities_list}), 200

@getters_bp.route('/charities-admin', methods=['GET'])
def get_charities_admin():
    charities = Charities.query.all()

    for charity in charities:
        wishes = Wishes.query.filter_by(charity_id=charity.id).all()
        charity.wish_length = len(wishes)

    charities_list = [{
        'id': charity.id,
        'name': charity.name,
        'description': charity.description,
        'website': charity.website,
        'logo_url': charity.logo_url,
        'image_url': charity.image_url,
        'active': charity.active,
        'wish_length': charity.wish_length,
        'created_at': charity.created_at
    } for charity in charities]
    return jsonify({'success': True, 'charities': charities_list}), 200

@getters_bp.route('/wishes', methods=['GET'])
def get_wishes():
    wishes = Wishes.query.all()
    for wish in wishes:
        my_charity = Charities.query.filter_by(id=wish.charity_id).first()
        wish.charity_name = my_charity.name if my_charity else "Unknown Charity"
        wish.total_prize = wish.unit_price * wish.quantity

    wishes_list = [{
        'id': wish.id,
        'name': wish.name,
        'description': wish.description,
        'unit_price': wish.unit_price,
        'quantity': wish.quantity,
        'current_price': wish.current_price,
        'total_price': wish.total_prize,
        'charity_name': wish.charity_name,
        'fulfilled': wish.fulfilled,
        'created_at': wish.created_at
    } for wish in wishes]
    return jsonify({'success': True, 'wishes': wishes_list}), 200