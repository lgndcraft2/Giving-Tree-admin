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
    current_price = db.Column(db.Float, default=0.0)
    total_price = db.Column(db.Float, nullable=False)
    fulfilled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    charity = db.relationship('Charities', backref=db.backref('wishes', lazy=True))

    @staticmethod
    def update_current_price(wish_id, amount):
        wish = Wishes.query.get(wish_id)
        if wish:
            wish.current_price += amount
            if wish.current_price >= wish.total_price:
                wish.fulfilled = True
            db.session.commit()

    def __repr__(self):
        return f'<Wishes {self.name} for Charity ID {self.charity_id}>'
    
class Payments(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True)
    wish_id = db.Column(db.Integer, db.ForeignKey('wishes.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.DateTime, server_default=db.func.now())
    donor_email = db.Column(db.String(150), nullable=True)

    wish = db.relationship('Wishes', backref=db.backref('payments', lazy=True))

    def __repr__(self):
        return f'<Payments {self.id} for Wish ID {self.wish_id}>'