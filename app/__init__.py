from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    
    from app.routes import main, properties, payments, api
    app.register_blueprint(main.bp)
    app.register_blueprint(properties.bp)
    app.register_blueprint(payments.bp)
    app.register_blueprint(api.bp)
    
    with app.app_context():
        db.create_all()
    
    return app

