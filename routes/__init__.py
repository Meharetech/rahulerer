from .auth import auth_bp
from .dashboard import dashboard_bp
from .admin import admin_bp
from .user import user_bp
from .api import api_bp

__all__ = ['auth_bp', 'dashboard_bp', 'admin_bp', 'user_bp', 'api_bp']
