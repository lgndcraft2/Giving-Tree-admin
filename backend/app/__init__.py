from flask import Flask, jsonify
from .config import config
from .extensions import db, jwt, migrate, CORS, bcrypt

def create_app(config_name):
    """Factory function to create the application instance."""
    app = Flask(__name__)
    
    # 1. Load Configuration
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)
    
    # 2. Register Extensions (like SQLAlchemy, JWT)
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/*": {"origins": "*"}})
    bcrypt.init_app(app)

    # 3. Register Blueprints
    from .routes import blueprints
    for bp in blueprints:
        app.register_blueprint(bp)
    
    # 4. Global Error Handlers (optional, but recommended)
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": 404,
            "error": "not found",
            "message": "The requested URL was not found on the server."
        }), 404

    return app