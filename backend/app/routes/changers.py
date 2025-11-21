from flask import Blueprint, jsonify
from ..extensions import db, jwt
from ..models import User, Charities, Wishes
from flask_jwt_extended import jwt_required

changers = Blueprint('changers', __name__, url_prefix='/changers')

@changers.route('/charity/<int:charity_id>/toggle-status', methods=['PUT'])
def toggle_charity_status(charity_id):
    charity = Charities.query.get(charity_id)
    if not charity:
        return jsonify({'success': False, 'message': 'Charity not found'}), 404

    charity.active = not charity.active
    db.session.commit()

    status = 'active' if charity.active else 'inactive'
    return jsonify({'success': True, 'message': f'Charity status changed to {status}'}), 200