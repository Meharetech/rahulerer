from flask import request, session, redirect, url_for, flash
from flask_login import current_user
from functools import wraps
from models.user import User
from extensions import db

def is_mobile_browser():
    """Check if the request is from a mobile browser"""
    user_agent = request.headers.get('User-Agent', '').lower()
    mobile_keywords = ['mobile', 'android', 'iphone', 'ipad', 'blackberry', 'windows phone']
    return any(keyword in user_agent for keyword in mobile_keywords)

def auth_middleware():
    """Authentication middleware that runs before each request"""
    # Skip middleware for static files and auth routes
    if request.endpoint and (
        request.endpoint.startswith('static') or 
        request.endpoint.startswith('auth.') or
        request.endpoint == 'static'
    ):
        return
    
    # Skip middleware for logout route specifically
    if request.endpoint == 'auth.logout':
        return
    
    # Skip middleware for test routes
    if request.endpoint == 'auth.test_logout':
        return
    
    # Check if user is authenticated via Flask-Login
    if current_user.is_authenticated:
        user = current_user
        if user and user.is_active:
            # Make session permanent for better mobile compatibility
            session.permanent = True
            
            # Enhanced mobile session handling
            if is_mobile_browser():
                # Set longer session for mobile devices
                session['mobile_session'] = True
                session['last_activity'] = request.environ.get('HTTP_DATE', '')
            
            # Update last activity timestamp
            session['last_activity'] = request.environ.get('HTTP_DATE', '')
        else:
            # Only clear session if user is actually inactive
            if user and not user.is_active:
                session.clear()
                flash('Your account has been deactivated.', 'warning')
                return redirect(url_for('auth.user_login'))

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.user_login'))
        
        user = current_user
        if not user or not user.is_active:
            session.clear()
            flash('Your account has been deactivated.', 'error')
            return redirect(url_for('auth.user_login'))
        
        # Make session permanent for authenticated users
        session.permanent = True
        
        # Enhanced mobile session handling
        if is_mobile_browser():
            session['mobile_session'] = True
        
        return f(*args, **kwargs)
    return decorated_function

def require_admin(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.user_login'))
        
        user = current_user
        if not user or not user.is_active:
            session.clear()
            flash('Your account has been deactivated.', 'error')
            return redirect(url_for('auth.user_login'))
        
        if not user.is_admin():
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('user.user_dashboard'))
        
        # Make session permanent for authenticated users
        session.permanent = True
        
        # Enhanced mobile session handling
        if is_mobile_browser():
            session['mobile_session'] = True
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(f):
    """Simple rate limiting decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        client_ip = request.remote_addr
        
        # Check rate limit (simple implementation)
        if 'rate_limit' not in session:
            session['rate_limit'] = {'count': 0, 'reset_time': 0}
        
        import time
        current_time = time.time()
        
        # Reset counter if 1 minute has passed
        if current_time - session['rate_limit']['reset_time'] > 60:
            session['rate_limit'] = {'count': 0, 'reset_time': current_time}
        
        # Increment counter
        session['rate_limit']['count'] += 1
        
        # Check if limit exceeded (100 requests per minute)
        if session['rate_limit']['count'] > 100:
            flash('Rate limit exceeded. Please try again later.', 'error')
            return redirect(url_for('auth.user_login'))
        
        return f(*args, **kwargs)
    return decorated_function

def log_request(f):
    """Log all requests for debugging"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Log request details
        print(f"[{request.method}] {request.path} - IP: {request.remote_addr}")
        return f(*args, **kwargs)
    return decorated_function
