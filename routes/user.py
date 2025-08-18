from flask import Blueprint, render_template, request, jsonify, flash, redirect, url_for
from flask_login import login_required, current_user
from functools import wraps
from extensions import db
from models.user import User, Group, Message
from utils.dashboard_utils import get_dashboard_stats

user_bp = Blueprint('user', __name__)

def user_required(f):
    """Decorator to require user role (non-admin)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Please log in to access this page.', 'warning')
            return redirect(url_for('auth.user_login'))
        return f(*args, **kwargs)
    return decorated_function

# ============================================================================
# USER DASHBOARD ROUTES
# ============================================================================

@user_bp.route('/dashboard')
@login_required
@user_required
def user_dashboard():
    """User dashboard route"""
    if current_user.is_admin():
        return redirect(url_for('admin.admin_dashboard'))
    
    # Get user-specific stats
    stats = get_dashboard_stats(current_user.id, 'user')
    
    return render_template('dashboard/user_dashboard.html', 
                         user=current_user, 
                         stats=stats)

# ============================================================================
# USER FEATURE ROUTES
# ============================================================================

@user_bp.route('/whatsapp-analysis')
@login_required
@user_required
def whatsapp_analysis():
    """WhatsApp Analysis page"""
    return render_template('dashboard/whatsapp_analysis.html', user=current_user)

@user_bp.route('/advanced-search')
@login_required
@user_required
def advanced_search():
    """Advanced Search page"""
    return render_template('dashboard/advanced_search.html', user=current_user)

@user_bp.route('/post-sending-groups')
@login_required
@user_required
def post_sending_groups():
    """Post Sending Groups page"""
    return render_template('dashboard/post_sending_groups.html', user=current_user)

@user_bp.route('/whatsapp-groups-list')
@login_required
@user_required
def whatsapp_groups_list():
    """WhatsApp Groups List page"""
    return render_template('dashboard/whatsapp_groups_list.html', user=current_user)

@user_bp.route('/assembly-analytics/<assembly_name>')
@login_required
@user_required
def assembly_analytics(assembly_name):
    """Assembly analytics page showing detailed analytics for a specific assembly"""
    return render_template('dashboard/assembly_analytics.html', assembly_name=assembly_name)

@user_bp.route('/group-sender-analysis')
@login_required
@user_required
def group_sender_analysis():
    """Group Sender Analysis page"""
    return render_template('dashboard/group_sender_analysis.html', user=current_user)

@user_bp.route('/common-members-analysis')
@login_required
@user_required
def common_members_analysis():
    """Common Members Analysis page"""
    return render_template('dashboard/common_members_analysis.html', user=current_user)

@user_bp.route('/member-details/<phone>')
@login_required
@user_required
def member_details(phone):
    """Member Details page showing all messages by sentiment"""
    return render_template('dashboard/member_details.html', user=current_user, phone=phone)

@user_bp.route('/group-details')
@login_required
@user_required
def group_details():
    """Group Details page showing comprehensive group information"""
    return render_template('dashboard/group_details.html', user=current_user)

@user_bp.route('/manage-topics')
@login_required
@user_required
def manage_topics():
    """User Manage Topics page"""
    return render_template('dashboard/manage_topics.html', user=current_user)

# ============================================================================
# USER PROFILE ROUTES
# ============================================================================

@user_bp.route('/profile')
@login_required
@user_required
def user_profile():
    """User profile page"""
    return render_template('dashboard/user_profile.html', user=current_user)

@user_bp.route('/profile/edit', methods=['GET', 'POST'])
@login_required
@user_required
def edit_profile():
    """Edit user profile"""
    if request.method == 'POST':
        # Handle profile editing logic here
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('user.user_profile'))
    
    return render_template('dashboard/edit_profile.html', user=current_user)

@user_bp.route('/change-password', methods=['GET', 'POST'])
@login_required
@user_required
def change_password():
    """Change user password"""
    if request.method == 'POST':
        # Handle password change logic here
        flash('Password changed successfully!', 'success')
        return redirect(url_for('user.user_profile'))
    
    return render_template('dashboard/change_password.html', user=current_user)

# ============================================================================
# USER ACTIVITY ROUTES
# ============================================================================

@user_bp.route('/activity')
@login_required
@user_required
def user_activity():
    """User activity log"""
    # Get user's recent activity
    recent_messages = Message.query.filter_by(user_id=current_user.id).order_by(Message.created_at.desc()).limit(10).all()
    
    return render_template('dashboard/user_activity.html', 
                         user=current_user,
                         recent_messages=recent_messages)

@user_bp.route('/notifications')
@login_required
@user_required
def user_notifications():
    """User notifications"""
    return render_template('dashboard/user_notifications.html', user=current_user)

# ============================================================================
# USER HELP & SUPPORT ROUTES
# ============================================================================

@user_bp.route('/help')
@login_required
@user_required
def user_help():
    """User help center"""
    return render_template('dashboard/user_help.html', user=current_user)

@user_bp.route('/support')
@login_required
@user_required
def user_support():
    """User support ticket system"""
    return render_template('dashboard/user_support.html', user=current_user)

@user_bp.route('/faq')
@login_required
@user_required
def user_faq():
    """Frequently Asked Questions"""
    return render_template('dashboard/user_faq.html', user=current_user)
