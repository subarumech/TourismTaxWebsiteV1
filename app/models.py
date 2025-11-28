from app import db
from datetime import datetime
import random
import string


def generate_transaction_id():
    """Generate a 16-character alphanumeric ID with dashes: XXXX-XXXX-XXXX-XXXX"""
    chars = string.ascii_uppercase + string.digits
    raw = ''.join(random.choices(chars, k=16))
    return f"{raw[0:4]}-{raw[4:8]}-{raw[8:12]}-{raw[12:16]}"

class Property(db.Model):
    __tablename__ = 'properties'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), unique=True, nullable=True)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    zip_code = db.Column(db.String(10), nullable=False)
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    google_place_id = db.Column(db.String(200), nullable=True)
    
    tdt_number = db.Column(db.String(20), unique=True, nullable=True)
    homestead_status = db.Column(db.Boolean, default=False)
    zoning_type = db.Column(db.String(50), default='residential')
    
    is_registered = db.Column(db.Boolean, default=False)
    registration_date = db.Column(db.DateTime, nullable=True)
    compliance_scenario = db.Column(db.Integer, nullable=True)  # 1-4
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    payments = db.relationship('TDTPayment', backref='property', lazy=True)
    
    def __repr__(self):
        return f'<Property {self.address}>'


class Dealer(db.Model):
    __tablename__ = 'dealers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dealer_type = db.Column(db.String(20), nullable=False)  # 'platform' or 'mom_and_pop'
    contact_email = db.Column(db.String(100), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    payments = db.relationship('TDTPayment', backref='dealer', lazy=True)
    
    def __repr__(self):
        return f'<Dealer {self.name}>'


class TDTPayment(db.Model):
    __tablename__ = 'tdt_payments'
    
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(19), unique=True, nullable=False, default=generate_transaction_id)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    dealer_id = db.Column(db.Integer, db.ForeignKey('dealers.id'), nullable=True)
    
    amount = db.Column(db.Float, nullable=False)
    period_start = db.Column(db.Date, nullable=False)
    period_end = db.Column(db.Date, nullable=False)
    payment_date = db.Column(db.DateTime, nullable=True)
    
    expected_amount = db.Column(db.Float, nullable=True)
    verified = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<TDTPayment ${self.amount} for Property {self.property_id}>'

