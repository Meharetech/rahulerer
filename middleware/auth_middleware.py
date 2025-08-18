from flask import request, session, redirect, url_for, flash
from flask_login import current_user
from functools import wraps
from models.user import User
from extensions import db

def auth_middleware():
    """Authentication middleware that runs before each request"""
    print(f"Middleware: Processing request to {request.endpoint}")
    
    # Skip middleware for static files and auth routes
    if request.endpoint and (
        request.endpoint.startswith('static') or 
        request.endpoint.startswith('auth.') or
        request.endpoint == 'static'
    ):
        print(f"Middleware: Skipping auth route: {request.endpoint}")
        return
    
    # Skip middleware for logout route specifically
    if request.endpoint == 'auth.logout':
        print(f"Middleware: Skipping logout route: {request.endpoint}")
        return
    
    # Skip middleware for test routes
    if request.endpoint == 'auth.test_logout':
        print(f"Middleware: Skipping test route: {request.endpoint}")
        return
    
    # Check if user is authenticated via Flask-Login
    if current_user.is_authenticated:
        user = current_user
        if user and user.is_active:
            # Update last activity if needed
            print(f"Middleware: User {user.username} is authenticated and active")
            pass  # Flask-Login handles this automatically
        else:
            # Invalid or inactive user, clear session
            print(f"Middleware: User {user.username} is not active, clearing session")
            session.clear()
            flash('Your account has been deactivated.', 'warning')
            return redirect(url_for('auth.user_login'))
    else:
        print(f"Middleware: No user authenticated")

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
