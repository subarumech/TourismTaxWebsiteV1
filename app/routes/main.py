from flask import Blueprint, render_template, current_app
from app.models import Property, TDTPayment, Dealer
from app import db
from sqlalchemy import func

bp = Blueprint('main', __name__)

@bp.route('/')
def dashboard():
    total_properties = Property.query.count()
    registered_count = Property.query.filter_by(is_registered=True).count()
    
    scenario_counts = {
        1: Property.query.filter_by(compliance_scenario=1).count(),
        2: Property.query.filter_by(compliance_scenario=2).count(),
        3: Property.query.filter_by(compliance_scenario=3).count(),
        4: Property.query.filter_by(compliance_scenario=4).count(),
    }
    
    total_tdt_collected = db.session.query(func.sum(TDTPayment.amount)).scalar() or 0
    dealer_count = Dealer.query.count()
    
    recent_transactions = TDTPayment.query.order_by(TDTPayment.created_at.desc()).limit(10).all()
    
    return render_template('dashboard.html',
        total_properties=total_properties,
        registered_count=registered_count,
        scenario_counts=scenario_counts,
        total_tdt_collected=total_tdt_collected,
        dealer_count=dealer_count,
        recent_transactions=recent_transactions
    )

@bp.route('/map')
def property_map():
    google_api_key = current_app.config.get('GOOGLE_API_KEY', '')
    return render_template('map.html', google_api_key=google_api_key)

