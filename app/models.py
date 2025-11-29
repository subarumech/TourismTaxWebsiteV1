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
    parcel_id = db.Column(db.String(50), unique=True, nullable=False)
    user_account = db.Column(db.String(50), nullable=True)
    owner_name = db.Column(db.String(200), nullable=True)
    owner_name2 = db.Column(db.String(200), nullable=True)
    owner_name3 = db.Column(db.String(200), nullable=True)
    owner_street1 = db.Column(db.String(200), nullable=True)
    owner_street2 = db.Column(db.String(200), nullable=True)
    owner_city = db.Column(db.String(100), nullable=True)
    owner_state = db.Column(db.String(10), nullable=True)
    owner_postal = db.Column(db.String(20), nullable=True)
    owner_county_code = db.Column(db.String(10), nullable=True)
    
    address = db.Column(db.String(200), nullable=False)
    street_number = db.Column(db.String(20), nullable=True)
    loc_description = db.Column(db.String(100), nullable=True)
    loc_unit = db.Column(db.String(20), nullable=True)
    loc_dir_prefix = db.Column(db.String(10), nullable=True)
    loc_dir_suffix = db.Column(db.String(10), nullable=True)
    city = db.Column(db.String(100), nullable=False)
    loc_state = db.Column(db.String(10), nullable=True)
    zip_code = db.Column(db.String(10), nullable=False)
    county_name = db.Column(db.String(100), default='Sarasota')
    
    lat = db.Column(db.Float, nullable=True)
    lng = db.Column(db.Float, nullable=True)
    google_place_id = db.Column(db.String(200), nullable=True)
    
    land_use_code = db.Column(db.String(10), nullable=True)
    neighborhood_code = db.Column(db.String(10), nullable=True)
    location_state = db.Column(db.String(10), nullable=True)
    prior_id1 = db.Column(db.String(50), nullable=True)
    prior_id2 = db.Column(db.String(50), nullable=True)
    prior_id3 = db.Column(db.String(50), nullable=True)
    census = db.Column(db.String(20), nullable=True)
    utilities1 = db.Column(db.String(10), nullable=True)
    utilities2 = db.Column(db.String(10), nullable=True)
    gulf_bay = db.Column(db.String(10), nullable=True)
    
    description = db.Column(db.Text, nullable=True)
    legal_description1 = db.Column(db.Text, nullable=True)
    legal_description2 = db.Column(db.Text, nullable=True)
    legal_description3 = db.Column(db.Text, nullable=True)
    legal_description4 = db.Column(db.Text, nullable=True)
    
    total_land = db.Column(db.Numeric(12, 2), nullable=True)
    land_unit_type = db.Column(db.String(10), nullable=True)
    zoning1 = db.Column(db.String(20), nullable=True)
    zoning2 = db.Column(db.String(20), nullable=True)
    zoning3 = db.Column(db.String(20), nullable=True)
    zoning_type = db.Column(db.String(50), default='residential')
    property_status = db.Column(db.String(20), nullable=True)
    
    tdt_number = db.Column(db.String(20), unique=True, nullable=True)
    homestead_status = db.Column(db.Boolean, default=False)
    is_registered = db.Column(db.Boolean, default=False)
    registration_date = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    active_date = db.Column(db.DateTime, nullable=True)
    inactive_date = db.Column(db.DateTime, nullable=True)
    compliance_scenario = db.Column(db.Integer, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    payments = db.relationship('TDTPayment', backref='property', lazy=True)
    sales = db.relationship('Sale', backref='property', lazy=True, foreign_keys='Sale.parcel_id', primaryjoin='Property.parcel_id==Sale.parcel_id')
    buildings = db.relationship('Building', backref='property', lazy=True, foreign_keys='Building.parcel_id', primaryjoin='Property.parcel_id==Building.parcel_id')
    land_parcels = db.relationship('Land', backref='property', lazy=True, foreign_keys='Land.parcel_id', primaryjoin='Property.parcel_id==Land.parcel_id')
    values = db.relationship('PropertyValue', backref='property', lazy=True, foreign_keys='PropertyValue.parcel_id', primaryjoin='Property.parcel_id==PropertyValue.parcel_id')
    exemptions = db.relationship('Exemption', backref='property', lazy=True, foreign_keys='Exemption.parcel_id', primaryjoin='Property.parcel_id==Exemption.parcel_id')
    
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


class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), nullable=False)
    sale_date = db.Column(db.DateTime, nullable=True)
    sequence = db.Column(db.Integer, nullable=True)
    sale_price = db.Column(db.Numeric(12, 2), nullable=True)
    legal_reference = db.Column(db.String(50), nullable=True)
    book = db.Column(db.String(20), nullable=True)
    page = db.Column(db.String(20), nullable=True)
    nal_code = db.Column(db.String(10), nullable=True)
    deed_type = db.Column(db.String(10), nullable=True)
    recording_date = db.Column(db.DateTime, nullable=True)
    doc_stamps = db.Column(db.Numeric(10, 2), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Sale {self.parcel_id} ${self.sale_price}>'


class Building(db.Model):
    __tablename__ = 'buildings'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), nullable=False)
    card_number = db.Column(db.String(10), nullable=True)
    avg_height_floor = db.Column(db.Numeric(6, 2), nullable=True)
    prime_int_wall = db.Column(db.String(10), nullable=True)
    sec_int_wall = db.Column(db.String(10), nullable=True)
    sec_int_wall_percent = db.Column(db.Numeric(5, 2), nullable=True)
    primary_floors = db.Column(db.String(10), nullable=True)
    sec_floors = db.Column(db.String(10), nullable=True)
    sec_floors_percent = db.Column(db.Numeric(5, 2), nullable=True)
    insulation = db.Column(db.String(10), nullable=True)
    heat_type = db.Column(db.String(10), nullable=True)
    percent_air_conditioned = db.Column(db.Numeric(5, 2), nullable=True)
    ext_type = db.Column(db.String(10), nullable=True)
    story_height = db.Column(db.Numeric(6, 2), nullable=True)
    foundation = db.Column(db.String(10), nullable=True)
    units = db.Column(db.Numeric(6, 2), nullable=True)
    frame = db.Column(db.String(10), nullable=True)
    prime_wall = db.Column(db.String(10), nullable=True)
    sec_wall = db.Column(db.String(10), nullable=True)
    sec_wall_percent = db.Column(db.Numeric(5, 2), nullable=True)
    roof_struct = db.Column(db.String(10), nullable=True)
    roof_cover = db.Column(db.String(10), nullable=True)
    view_type = db.Column(db.String(10), nullable=True)
    grade = db.Column(db.String(10), nullable=True)
    year_built = db.Column(db.Integer, nullable=True)
    eff_year_built = db.Column(db.Integer, nullable=True)
    condo_floor = db.Column(db.String(10), nullable=True)
    condo_complex_name = db.Column(db.String(200), nullable=True)
    full_bath = db.Column(db.Numeric(4, 1), nullable=True)
    full_bath_rating = db.Column(db.String(10), nullable=True)
    half_bath = db.Column(db.Numeric(4, 1), nullable=True)
    half_bath_rating = db.Column(db.String(10), nullable=True)
    other_fixtures = db.Column(db.Numeric(4, 1), nullable=True)
    other_fixtures_rating = db.Column(db.String(10), nullable=True)
    fireplaces = db.Column(db.String(10), nullable=True)
    fireplace_rating = db.Column(db.String(10), nullable=True)
    parking_spaces = db.Column(db.String(10), nullable=True)
    percent_sprinkled = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Building {self.parcel_id}>'


class Land(db.Model):
    __tablename__ = 'land'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), nullable=False)
    seq_number = db.Column(db.String(10), nullable=True)
    line_type = db.Column(db.String(10), nullable=True)
    num_of_units = db.Column(db.Numeric(12, 4), nullable=True)
    unit_type = db.Column(db.String(10), nullable=True)
    land_type = db.Column(db.String(10), nullable=True)
    neigh_mod = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Land {self.parcel_id}>'


class PropertyValue(db.Model):
    __tablename__ = 'property_values'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), nullable=False)
    total_value = db.Column(db.Numeric(12, 2), nullable=True)
    land_value = db.Column(db.Numeric(12, 2), nullable=True)
    building_value = db.Column(db.Numeric(12, 2), nullable=True)
    sfyi_value = db.Column(db.Numeric(12, 2), nullable=True)
    assessed_value = db.Column(db.Numeric(12, 2), nullable=True)
    taxable_value = db.Column(db.Numeric(12, 2), nullable=True)
    deletions = db.Column(db.Numeric(12, 2), nullable=True)
    new_const = db.Column(db.Numeric(12, 2), nullable=True)
    new_land = db.Column(db.Numeric(12, 2), nullable=True)
    ag_credit = db.Column(db.Numeric(12, 2), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<PropertyValue {self.parcel_id} ${self.total_value}>'


class Exemption(db.Model):
    __tablename__ = 'exemptions'
    
    id = db.Column(db.Integer, primary_key=True)
    parcel_id = db.Column(db.String(50), nullable=False)
    exemption_code = db.Column(db.String(10), nullable=True)
    amount_off_total_assessment = db.Column(db.Numeric(12, 2), nullable=True)
    app_code = db.Column(db.String(10), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Exemption {self.parcel_id}>'

