from flask import Blueprint, render_template, request, redirect, url_for, flash, current_app
from app.models import Property
from app import db
from datetime import datetime
import random

bp = Blueprint('properties', __name__, url_prefix='/properties')

def generate_tdt_number():
    year = datetime.now().year
    random_num = random.randint(100000, 999999)
    return f"TDT-{year}-{random_num}"

@bp.route('/')
def list_properties():
    scenario_filter = request.args.get('scenario', type=int)
    search = request.args.get('search', '')
    
    query = Property.query
    
    if scenario_filter:
        query = query.filter_by(compliance_scenario=scenario_filter)
    
    if search:
        query = query.filter(
            db.or_(
                Property.address.ilike(f'%{search}%'),
                Property.parcel_id.ilike(f'%{search}%'),
                Property.tdt_number.ilike(f'%{search}%')
            )
        )
    
    properties = query.order_by(Property.created_at.desc()).all()
    
    return render_template('properties/list.html', 
        properties=properties,
        scenario_filter=scenario_filter,
        search=search
    )

@bp.route('/add', methods=['GET', 'POST'])
def add_property():
    if request.method == 'POST':
        prop = Property(
            address=request.form['address'],
            city=request.form['city'],
            zip_code=request.form['zip_code'],
            parcel_id=request.form.get('parcel_id') or None,
            homestead_status=request.form.get('homestead_status') == 'on',
            zoning_type=request.form.get('zoning_type', 'residential'),
            is_registered=request.form.get('is_registered') == 'on',
        )
        
        if prop.is_registered:
            prop.tdt_number = generate_tdt_number()
            prop.registration_date = datetime.utcnow()
        
        db.session.add(prop)
        db.session.commit()
        
        flash(f'Property added successfully. TDT#: {prop.tdt_number}', 'success')
        return redirect(url_for('properties.list_properties'))
    
    return render_template('properties/add.html')

@bp.route('/<int:id>')
def view_property(id):
    prop = Property.query.get_or_404(id)
    google_api_key = current_app.config.get('GOOGLE_API_KEY', '')
    return render_template('properties/view.html', property=prop, google_api_key=google_api_key)

@bp.route('/<int:id>/edit', methods=['GET', 'POST'])
def edit_property(id):
    prop = Property.query.get_or_404(id)
    
    if request.method == 'POST':
        prop.address = request.form['address']
        prop.city = request.form['city']
        prop.zip_code = request.form['zip_code']
        prop.parcel_id = request.form.get('parcel_id') or None
        prop.homestead_status = request.form.get('homestead_status') == 'on'
        prop.zoning_type = request.form.get('zoning_type', 'residential')
        
        was_registered = prop.is_registered
        prop.is_registered = request.form.get('is_registered') == 'on'
        
        if prop.is_registered and not was_registered:
            prop.tdt_number = generate_tdt_number()
            prop.registration_date = datetime.utcnow()
        
        db.session.commit()
        flash('Property updated successfully.', 'success')
        return redirect(url_for('properties.view_property', id=id))
    
    return render_template('properties/edit.html', property=prop)

@bp.route('/<int:id>/register', methods=['POST'])
def register_property(id):
    prop = Property.query.get_or_404(id)
    
    if not prop.is_registered:
        prop.is_registered = True
        prop.tdt_number = generate_tdt_number()
        prop.registration_date = datetime.utcnow()
        db.session.commit()
        flash(f'Property registered. TDT#: {prop.tdt_number}', 'success')
    
    return redirect(url_for('properties.view_property', id=id))

