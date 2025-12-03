from .auth import auth_bp
from .adders import adders
from .getters import getters_bp
from .changers import changers
from .payments import payments_bp

blueprints = [
    auth_bp,
    adders,
    getters_bp,
    changers,
    payments_bp
]