from flask import Blueprint, render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from models.user import User
from extensions import db
from forms.auth_forms import LoginForm, RegistrationForm
from utils.auth_utils import create_default_users

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
@auth_bp.route('/login')
def login():
    """Main login page - redirects to user login"""
    if current_user.is_authenticated:
        if current_user.is_admin():
            return redirect(url_for('dashboard.admin_dashboard'))
        else:
            return redirect(url_for('dashboard.user_dashboard'))
    
    return redirect(url_for('auth.user_login'))

@auth_bp.route('/user/login', methods=['GET', 'POST'])
def user_login():
    """User login route"""
    if current_user.is_authenticated:
        return redirect(url_for('user.user_dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        
        if user and user.check_password(form.password.data) and user.role == 'user':
            login_user(user, remember=form.remember.data)
            user.update_last_login()
            flash('Login successful!', 'success')
            return redirect(url_for('user.user_dashboard'))
        else:
            flash('Invalid username or password!', 'error')
    
    return render_template('auth/user_login.html', form=form)

@auth_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login route"""
    if current_user.is_authenticated:
        return redirect(url_for('admin.admin_dashboard'))
    
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        
        if user and user.check_password(form.password.data) and user.role == 'admin':
            login_user(user, remember=form.remember.data)
            user.update_last_login()
            flash('Admin login successful!', 'success')
            return redirect(url_for('admin.admin_dashboard'))
        else:
            flash('Invalid admin credentials!', 'error')
    
    return render_template('auth/admin_login.html', form=form)

@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    """User registration route"""
    if current_user.is_authenticated:
        return redirect(url_for('user.user_dashboard'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        # Check if user already exists
        if User.query.filter_by(username=form.username.data).first():
            flash('Username already exists!', 'error')
            return render_template('auth/register.html', form=form)
        
        if User.query.filter_by(email=form.email.data).first():
            flash('Email already registered!', 'error')
            return render_template('auth/register.html', form=form)
        
        # Create new user
        user = User(
            username=form.username.data,
            email=form.email.data,
            password=form.password.data,
            first_name=form.first_name.data,
            last_name=form.last_name.data
        )
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('auth.user_login'))
    
    return render_template('auth/register.html', form=form)

@auth_bp.route('/logout', methods=['GET', 'POST'])
@login_required
def logout():
    """Logout route - completely clear all session data and redirect to login"""
    try:
        # Store the username for the flash message
        username = current_user.username if current_user.is_authenticated else "User"
        
        print(f"Logging out user: {username}")
        
        # First, logout the user from Flask-Login
        logout_user()
        print("Flask-Login logout completed")
        
        # Clear all session data
        session.clear()
        print("Session cleared")
        
        # Clear any additional session data that might persist
        session.pop('_fresh', None)
        session.pop('_id', None)
        session.pop('_user_id', None)
        session.pop('user_id', None)
        session.pop('username', None)
        session.pop('role', None)
        session.pop('rate_limit', None)
        
        # Force session to be cleared
        session.modified = True
        print("Session marked as modified")
        
        # Clear any cookies that might be set
        from flask import make_response
        
        flash(f'{username} has been logged out successfully.', 'info')
        
        # Create response and clear any authentication cookies
        response = make_response(redirect(url_for('auth.user_login')))
        response.delete_cookie('session')
        response.delete_cookie('remember_token')
        response.delete_cookie('session_id')
        response.delete_cookie('remember_token_hash')
        
        # Set cache control headers to prevent caching
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        print("Logout completed successfully, redirecting to login")
        return response
        
    except Exception as e:
        print(f"Error during logout: {e}")
        # Even if there's an error, try to clear session and redirect
        session.clear()
        session.modified = True
        flash('Logout completed. Please log in again.', 'info')
        return redirect(url_for('auth.user_login'))

@auth_bp.route('/profile')
@login_required
def profile():
    """User profile route"""
    return render_template('auth/profile.html', user=current_user)

@auth_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
def change_password():
    """Change password route"""
    from forms.auth_forms import ChangePasswordForm
    
    form = ChangePasswordForm()
    if form.validate_on_submit():
        if current_user.check_password(form.current_password.data):
            current_user.set_password(form.new_password.data)
            db.session.commit()
            flash('Password changed successfully!', 'success')
            return redirect(url_for('auth.profile'))
        else:
            flash('Current password is incorrect!', 'error')
    
    return render_template('auth/change_password.html', form=form)

@auth_bp.route('/test-logout')
def test_logout():
    """Test route to check if logout is working"""
    return f"""
    <h1>Logout Test</h1>
    <p>Current user: {current_user.username if current_user.is_authenticated else 'Not authenticated'}</p>
    <p>Session data: {dict(session)}</p>
    <form method="POST" action="{{ url_for('auth.logout') }}">
        <button type="submit">Test Logout</button>
    </form>
    <a href="{{ url_for('auth.user_login') }}">Go to Login</a>
    """

# Initialize default users on first run
def init_default_users():
    """Create default users if they don't exist"""
    create_default_users()
