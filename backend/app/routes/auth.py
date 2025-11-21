from flask import Blueprint, jsonify, request
from ..extensions import jwt
from flask_jwt_extended import jwt_required, create_access_token, get_jwt_identity, create_refresh_token

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Dummy user validation for demonstration purposes
    if username == 'admin' and password == 'password':
        access_token = create_access_token(identity={'username': username})
        refresh_token = create_refresh_token(identity={'username': username})
        return jsonify({'success': True, 'access_token': access_token, 'refresh_token': refresh_token}), 200
    else:
        return jsonify({"msg": "Bad username or password"}), 401
