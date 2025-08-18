from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from functools import wraps
from extensions import db
from models.user import User, Group, Message
from models.assembly import Assembly
from utils.dashboard_utils import get_dashboard_stats

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print(f"Admin required check - User: {current_user.username}, Role: {current_user.role}, Is Admin: {current_user.is_admin()}")
        if not current_user.is_authenticated or not current_user.is_admin():
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('auth.user_login'))
        return f(*args, **kwargs)
    return decorated_function

# ============================================================================
# ADMIN DASHBOARD ROUTES
# ============================================================================

@admin_bp.route('/dashboard')
@login_required
@admin_required
def admin_dashboard():
    """Admin dashboard route"""
    try:
        print(f"Admin dashboard accessed by: {current_user.username} (Role: {current_user.role})")
        
        # Get admin-specific stats
        stats = get_dashboard_stats(current_user.id, 'admin')
        
        # Get system information
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        total_groups = Group.query.count()
        total_messages = Message.query.count()
        
        print(f"Stats: Users={total_users}, Groups={total_groups}, Messages={total_messages}")
        
        return render_template('dashboard/admin_dashboard.html', 
                             user=current_user, 
                             stats=stats,
                             total_users=total_users,
                             active_users=active_users,
                             total_groups=total_groups,
                             total_messages=total_messages)
    except Exception as e:
        print(f"Error in admin dashboard: {e}")
        import traceback
        traceback.print_exc()
        flash('Error loading admin dashboard. Please try again.', 'error')
        return redirect(url_for('admin.admin_dashboard'))

# ============================================================================
# ADMIN MANAGEMENT ROUTES
# ============================================================================

@admin_bp.route('/upload-reports')
@login_required
@admin_required
def upload_reports():
    """Upload Reports page"""
    return render_template('dashboard/upload_reports.html', user=current_user)

@admin_bp.route('/upload-groups')
@login_required
@admin_required
def upload_groups():
    """Upload Groups page"""
    return render_template('dashboard/upload_groups.html', user=current_user)

@admin_bp.route('/message-management')
@login_required
@admin_required
def message_management():
    """Message Management page"""
    return render_template('dashboard/message_management.html', user=current_user)

@admin_bp.route('/manage-topics')
@login_required
@admin_required
def admin_manage_topics():
    """Admin Manage Topics page"""
    return render_template('dashboard/admin_manage_topics.html', user=current_user)

@admin_bp.route('/assembly-list')
@login_required
@admin_required
def assembly_list():
    """Assembly List page"""
    return render_template('dashboard/assembly_list.html', user=current_user)

# ============================================================================
# USER MANAGEMENT ROUTES (ADMIN ONLY)
# ============================================================================

@admin_bp.route('/users')
@login_required
@admin_required
def manage_users():
    """User management page"""
    page = request.args.get('page', 1, type=int)
    users = User.query.paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('dashboard/manage_users.html', 
                         users=users, 
                         user=current_user)

@admin_bp.route('/users/<int:user_id>')
@login_required
@admin_required
def view_user(user_id):
    """View specific user details"""
    user = User.query.get_or_404(user_id)
    return render_template('dashboard/view_user.html', 
                         target_user=user, 
                         user=current_user)

@admin_bp.route('/users/<int:user_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_user(user_id):
    """Edit user details"""
    user = User.query.get_or_404(user_id)
    
    if request.method == 'POST':
        # Handle user editing logic here
        flash('User updated successfully!', 'success')
        return redirect(url_for('admin.view_user', user_id=user_id))
    
    return render_template('dashboard/edit_user.html', 
                         target_user=user, 
                         user=current_user)

@admin_bp.route('/users/<int:user_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    """Delete user (soft delete)"""
    user = User.query.get_or_404(user_id)
    
    if user.id == current_user.id:
        flash('You cannot delete your own account!', 'error')
        return redirect(url_for('admin.manage_users'))
    
    user.is_active = False
    db.session.commit()
    flash('User deactivated successfully!', 'success')
    
    return redirect(url_for('admin.manage_users'))

# ============================================================================
# GROUP MANAGEMENT ROUTES (ADMIN ONLY)
# ============================================================================

@admin_bp.route('/groups')
@login_required
@admin_required
def manage_groups():
    """Group management page"""
    page = request.args.get('page', 1, type=int)
    groups = Group.query.paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('dashboard/manage_groups.html', 
                         groups=groups, 
                         user=current_user)

@admin_bp.route('/groups/<int:group_id>')
@login_required
@admin_required
def view_group(group_id):
    """View specific group details"""
    group = Group.query.get_or_404(group_id)
    return render_template('dashboard/view_group.html', 
                         target_group=group, 
                         user=current_user)

# ============================================================================
# MESSAGE MANAGEMENT ROUTES (ADMIN ONLY)
# ============================================================================

@admin_bp.route('/messages')
@login_required
@admin_required
def manage_messages():
    """Message management page"""
    page = request.args.get('page', 1, type=int)
    messages = Message.query.paginate(
        page=page, per_page=20, error_out=False
    )
    
    return render_template('dashboard/manage_messages.html', 
                         messages=messages, 
                         user=current_user)

@admin_bp.route('/messages/<int:message_id>')
@login_required
@admin_required
def view_message(message_id):
    """View specific message details"""
    message = Message.query.get_or_404(message_id)
    return render_template('dashboard/view_message.html', 
                         target_message=message, 
                         user=current_user)

# ============================================================================
# SYSTEM SETTINGS ROUTES (ADMIN ONLY)
# ============================================================================

@admin_bp.route('/settings')
@login_required
@admin_required
def system_settings():
    """System settings page"""
    return render_template('dashboard/system_settings.html', user=current_user)

@admin_bp.route('/logs')
@login_required
@admin_required
def system_logs():
    """System logs page"""
    return render_template('dashboard/system_logs.html', user=current_user)

@admin_bp.route('/backup')
@login_required
@admin_required
def system_backup():
    """System backup page"""
    return render_template('dashboard/system_backup.html', user=current_user)
