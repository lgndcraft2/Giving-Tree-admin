from .extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<User {self.username}>'
    
class Charities(db.Model):
    __tablename__ = 'charities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    website = db.Column(db.String(200), nullable=True)
    logo_url = db.Column(db.String(200), nullable=True)
    image_url = db.Column(db.String(200), nullable=True)
    active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def __repr__(self):
        return f'<Charities {self.name}>'
    
class Wishes(db.Model):
    __tablename__ = 'wishes'

    id = db.Column(db.Integer, primary_key=True)
    charity_id = db.Column(db.Integer, db.ForeignKey('charities.id'), nullable=False)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    unit_price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    fulfilled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    charity = db.relationship('Charities', backref=db.backref('wishes', lazy=True))

    def __repr__(self):
        return f'<Wishes {self.name} for Charity ID {self.charity_id}>'