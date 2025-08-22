from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect

# Initialize Flask extensions
db = SQLAlchemy()
login_manager = LoginManager()
csrf = CSRFProtect()

# Configure Flask-Login
login_manager.login_view = 'auth.user_login'
login_manager.login_message = 'Please log in to access this page.'
login_manager.login_message_category = 'warning'
login_manager.session_protection = 'strong'

@login_manager.user_loader
def load_user(user_id):
    """Load user for Flask-Login"""
    from models.user import User
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    """Handle unauthorized access"""
    from flask import redirect, url_for, flash
    flash('Please log in to access this page.', 'warning')
    return redirect(url_for('auth.user_login'))
