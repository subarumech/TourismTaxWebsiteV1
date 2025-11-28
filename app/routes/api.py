from flask import Blueprint, jsonify, request
from app.models import Property, TDTPayment, Dealer
from app import db

bp = Blueprint('api', __name__, url_prefix='/api/v1')

@bp.route('/properties', methods=['GET'])
def get_properties():
    properties = Property.query.all()
    return jsonify([{
        'id': p.id,
        'parcel_id': p.parcel_id,
        'address': p.address,
        'city': p.city,
        'zip_code': p.zip_code,
        'lat': p.lat,
        'lng': p.lng,
        'tdt_number': p.tdt_number,
        'is_registered': p.is_registered,
        'compliance_scenario': p.compliance_scenario
    } for p in properties])

@bp.route('/properties/map', methods=['GET'])
def get_properties_for_map():
    """Get properties with coordinates for map display"""
    properties = Property.query.filter(
        Property.lat.isnot(None),
        Property.lng.isnot(None)
    ).all()
    return jsonify([{
        'id': p.id,
        'parcel_id': p.parcel_id,
        'address': p.address,
        'city': p.city,
        'zip_code': p.zip_code,
        'lat': p.lat,
        'lng': p.lng,
        'tdt_number': p.tdt_number,
        'is_registered': p.is_registered,
        'compliance_scenario': p.compliance_scenario,
        'homestead_status': p.homestead_status,
        'zoning_type': p.zoning_type
    } for p in properties])

@bp.route('/properties/<int:id>', methods=['GET'])
def get_property(id):
    p = Property.query.get_or_404(id)
    return jsonify({
        'id': p.id,
        'parcel_id': p.parcel_id,
        'address': p.address,
        'city': p.city,
        'zip_code': p.zip_code,
        'lat': p.lat,
        'lng': p.lng,
        'tdt_number': p.tdt_number,
        'is_registered': p.is_registered,
        'registration_date': p.registration_date.isoformat() if p.registration_date else None,
        'compliance_scenario': p.compliance_scenario,
        'homestead_status': p.homestead_status
    })

@bp.route('/properties/lookup', methods=['GET'])
def lookup_property():
    """Lookup property by parcel ID or TDT number - for dealer integration"""
    parcel_id = request.args.get('parcel_id')
    tdt_number = request.args.get('tdt_number')
    
    if parcel_id:
        p = Property.query.filter_by(parcel_id=parcel_id).first()
    elif tdt_number:
        p = Property.query.filter_by(tdt_number=tdt_number).first()
    else:
        return jsonify({'error': 'Provide parcel_id or tdt_number'}), 400
    
    if not p:
        return jsonify({'error': 'Property not found'}), 404
    
    return jsonify({
        'id': p.id,
        'parcel_id': p.parcel_id,
        'address': p.address,
        'tdt_number': p.tdt_number,
        'is_registered': p.is_registered
    })

@bp.route('/payments', methods=['POST'])
def record_payment():
    """Endpoint for dealers to submit TDT payments"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required = ['property_id', 'amount', 'period_start', 'period_end']
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    prop = Property.query.get(data['property_id'])
    if not prop:
        return jsonify({'error': 'Property not found'}), 404
    
    payment = TDTPayment(
        property_id=data['property_id'],
        dealer_id=data.get('dealer_id'),
        amount=data['amount'],
        period_start=data['period_start'],
        period_end=data['period_end']
    )
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify({'success': True, 'payment_id': payment.id}), 201

@bp.route('/dealers', methods=['GET'])
def get_dealers():
    dealers = Dealer.query.filter_by(is_active=True).filter(~Dealer.name.like('Local Rentals%')).all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'dealer_type': d.dealer_type
    } for d in dealers])

@bp.route('/stats', methods=['GET'])
def get_stats():
    """Get compliance statistics"""
    from sqlalchemy import func
    
    total = Property.query.count()
    registered = Property.query.filter_by(is_registered=True).count()
    
    scenario_counts = {}
    for i in range(1, 5):
        scenario_counts[f'scenario_{i}'] = Property.query.filter_by(compliance_scenario=i).count()
    
    total_collected = db.session.query(func.sum(TDTPayment.amount)).scalar() or 0
    
    return jsonify({
        'total_properties': total,
        'registered_properties': registered,
        'unregistered_properties': total - registered,
        **scenario_counts,
        'total_tdt_collected': float(total_collected)
    })

