from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user

dashboard_bp = Blueprint('dashboard', __name__)

# ============================================================================
# MAIN DASHBOARD ROUTING
# ============================================================================

@dashboard_bp.route('/')
@login_required
def index():
    """Dashboard index - redirects based on user role"""
    if current_user.is_admin():
        return redirect(url_for('admin.admin_dashboard'))
    else:
        return redirect(url_for('user.user_dashboard'))

# ============================================================================
# LEGACY ROUTE REDIRECTS (for backward compatibility)
# ============================================================================

@dashboard_bp.route('/admin')
@login_required
def admin_dashboard_redirect():
    """Redirect to new admin dashboard"""
    return redirect(url_for('admin.admin_dashboard'))

@dashboard_bp.route('/user')
@login_required
def user_dashboard_redirect():
    """Redirect to new user dashboard"""
    return redirect(url_for('user.user_dashboard'))

# ============================================================================
# LEGACY API ROUTE REDIRECTS (for backward compatibility)
# ============================================================================

@dashboard_bp.route('/api/stats')
@login_required
def api_stats_redirect():
    """Redirect to new API stats endpoint"""
    return redirect(url_for('api.api_stats'))

@dashboard_bp.route('/api/assemblies')
@login_required
def assemblies_redirect():
    """Redirect to new API assemblies endpoint"""
    return redirect(url_for('api.get_assemblies'))

@dashboard_bp.route('/api/assemblies/<int:assembly_id>')
@login_required
def assembly_detail_redirect(assembly_id):
    """Redirect to new API assembly detail endpoint"""
    return redirect(url_for('api.get_assembly', assembly_id=assembly_id))
