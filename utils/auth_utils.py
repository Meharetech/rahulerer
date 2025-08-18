from models.user import User
from extensions import db
from werkzeug.security import generate_password_hash

def create_default_users():
    """Create default users if they don't exist"""
    try:
        # Check if default users already exist
        if User.query.filter_by(username='user').first() and User.query.filter_by(username='admin').first():
            return
        
        # Create default user
        if not User.query.filter_by(username='user').first():
            user = User(
                username='Admin',
                email='user@whatsapp-ui.com',
                password='Admin@meta123',
                role='user',
                first_name='Default',
                last_name='User',
                is_verified=True
            )
            db.session.add(user)
            print("Default user created: user/1234567890")
        
        # Create default admin
        if not User.query.filter_by(username='admin').first():
            admin = User(
                username='admin',
                email='admin@whatsapp-ui.com',
                password='1234567890',
                role='admin',
                first_name='System',
                last_name='Administrator',
                is_verified=True
            )
            db.session.add(admin)
            print("Default admin created: admin/1234567890")
        
        db.session.commit()
        print("Default users initialized successfully!")
        
    except Exception as e:
        print(f"Error creating default users: {e}")
        db.session.rollback()

def create_user(username, email, password, role='user', **kwargs):
    """Create a new user"""
    try:
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            return False, "Username already exists"
        
        if User.query.filter_by(email=email).first():
            return False, "Email already registered"
        
        # Create new user
        user = User(
            username=username,
            email=email,
            password=password,
            role=role,
            **kwargs
        )
        
        db.session.add(user)
        db.session.commit()
        
        return True, f"User {username} created successfully"
        
    except Exception as e:
        db.session.rollback()
        return False, f"Error creating user: {str(e)}"

def update_user_profile(user_id, **kwargs):
    """Update user profile information"""
    try:
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone', 'avatar']
        for field, value in kwargs.items():
            if field in allowed_fields and value is not None:
                setattr(user, field, value)
        
        db.session.commit()
        return True, "Profile updated successfully"
        
    except Exception as e:
        db.session.rollback()
        return False, f"Error updating profile: {str(e)}"

def change_user_password(user_id, current_password, new_password):
    """Change user password"""
    try:
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        if not user.check_password(current_password):
            return False, "Current password is incorrect"
        
        user.set_password(new_password)
        db.session.commit()
        
        return True, "Password changed successfully"
        
    except Exception as e:
        db.session.rollback()
        return False, f"Error changing password: {str(e)}"

def deactivate_user(user_id):
    """Deactivate a user account"""
    try:
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        user.is_active = False
        db.session.commit()
        
        return True, f"User {user.username} deactivated successfully"
        
    except Exception as e:
        db.session.rollback()
        return False, f"Error deactivating user: {str(e)}"

def activate_user(user_id):
    """Activate a user account"""
    try:
        user = User.query.get(user_id)
        if not user:
            return False, "User not found"
        
        user.is_active = True
        db.session.commit()
        
        return True, f"User {user.username} activated successfully"
        
    except Exception as e:
        db.session.rollback()
        return False, f"Error activating user: {str(e)}"

def get_user_stats(user_id):
    """Get user statistics"""
    try:
        user = User.query.get(user_id)
        if not user:
            return None
        
        # Get user's groups count
        groups_count = user.groups.count()
        
        # Get user's messages count
        messages_count = user.messages.count()
        
        return {
            'username': user.username,
            'role': user.role,
            'groups_count': groups_count,
            'messages_count': messages_count,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_login': user.last_login.isoformat() if user.last_login else None
        }
        
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return None
