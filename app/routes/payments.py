from flask import Blueprint, render_template, request, redirect, url_for, flash
from app.models import TDTPayment, Property, Dealer
from app import db
from datetime import datetime

bp = Blueprint('payments', __name__, url_prefix='/payments')

@bp.route('/')
def list_payments():
    payments = TDTPayment.query.order_by(TDTPayment.created_at.desc()).all()
    return render_template('payments/list.html', payments=payments)

@bp.route('/add', methods=['GET', 'POST'])
def add_payment():
    if request.method == 'POST':
        payment = TDTPayment(
            property_id=request.form['property_id'],
            dealer_id=request.form.get('dealer_id') or None,
            amount=float(request.form['amount']),
            period_start=datetime.strptime(request.form['period_start'], '%Y-%m-%d').date(),
            period_end=datetime.strptime(request.form['period_end'], '%Y-%m-%d').date(),
            payment_date=datetime.utcnow(),
            expected_amount=float(request.form.get('expected_amount') or 0) or None,
            notes=request.form.get('notes')
        )
        
        db.session.add(payment)
        db.session.commit()
        
        flash('Payment recorded successfully.', 'success')
        return redirect(url_for('payments.list_payments'))
    
    properties = Property.query.all()
    dealers = Dealer.query.filter_by(is_active=True).filter(~Dealer.name.like('Local Rentals%')).all()
    return render_template('payments/add.html', properties=properties, dealers=dealers)

@bp.route('/<int:id>')
def view_payment(id):
    payment = TDTPayment.query.get_or_404(id)
    return render_template('payments/view.html', payment=payment)

