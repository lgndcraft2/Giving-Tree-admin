from flask import Blueprint, jsonify
from ..extensions import db, jwt
from ..models import Payments, User, Charities, Wishes
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
        'image_url': charity.image_url,
        'active': charity.active,
        'created_at': charity.created_at.isoformat() if getattr(charity, 'created_at', None) else None
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
        'image_url': charity.image_url,
        'active': charity.active,
        'wish_length': charity.wish_length,
        'created_at': charity.created_at.isoformat() if getattr(charity, 'created_at', None) else None
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
        'created_at': wish.created_at.isoformat() if getattr(wish, 'created_at', None) else None
    } for wish in wishes]
    return jsonify({'success': True, 'wishes': wishes_list}), 200

@getters_bp.route('/payments', methods=['GET'])
def get_payments():
    payments = Payments.query.all()
    payments_list = []
    for payment in payments:
        wish = Wishes.query.filter_by(id=payment.wish_id).first()
        charity = Charities.query.filter_by(id=wish.charity_id).first() if wish else None

        payments_list.append({
            'id': payment.id,
            'wish_id': payment.wish_id,
            'wish_name': wish.name if wish else "Unknown Wish",
            'charity_name': charity.name if charity else "Unknown Charity",
            'quantity': payment.quantity,
            'unit_price': payment.unit_price,
            'amount': payment.amount,
            'payment_date': payment.payment_date.isoformat() if getattr(payment, 'payment_date', None) else None,
            'donor_email': payment.donor_email
        })

    return jsonify({'success': True, 'payments': payments_list}), 200