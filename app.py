from flask import Flask, redirect, url_for
from datetime import timedelta
from config import Config
from extensions import db, login_manager
from routes import auth_bp, dashboard_bp, admin_bp, user_bp, api_bp
from middleware.auth_middleware import auth_middleware

# Import models to register them with SQLAlchemy
from models import User, Group, Message, Assembly

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    
    # Configure session management
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
    
    # Configure login manager
    login_manager.login_view = 'auth.user_login'
    login_manager.login_message = 'Please log in to access this page.'
    login_manager.login_message_category = 'warning'
    login_manager.session_protection = 'strong'
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(api_bp, url_prefix='/api')
    
    # Register middleware
    app.before_request(auth_middleware)
    
    # Root route - redirect to user login
    @app.route('/')
    def index():
        """Root route - redirect to user login"""
        return redirect(url_for('auth.user_login'))
    
    # Create database tables and initialize default users
    with app.app_context():
        db.create_all()
        # Initialize default users
        from utils.auth_utils import create_default_users
        create_default_users()
    
    return app

# Create the Flask app instance for PythonAnywhere
app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8089)
