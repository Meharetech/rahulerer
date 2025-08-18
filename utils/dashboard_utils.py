from models.user import User, Group, Message
from datetime import datetime, timedelta
from sqlalchemy import func
from extensions import db

def get_dashboard_stats(user_id, role):
    """Get dashboard statistics based on user role"""
    try:
        if role == 'admin':
            return get_admin_stats()
        else:
            return get_user_stats(user_id)
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return get_default_stats()

def get_admin_stats():
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        new_users_today = User.query.filter(
            User.created_at >= datetime.utcnow().date()
        ).count()
        
        # Group statistics
        total_groups = Group.query.count()
        active_groups = Group.query.filter_by(is_active=True).count()
        
        # Message statistics
        total_messages = Message.query.count()
        messages_today = Message.query.filter(
            Message.created_at >= datetime.utcnow().date()
        ).count()
        
        # System statistics
        system_uptime = calculate_system_uptime()
        
        return {
            'users': {
                'total': total_users,
                'active': active_users,
                'new_today': new_users_today
            },
            'groups': {
                'total': total_groups,
                'active': active_groups
            },
            'messages': {
                'total': total_messages,
                'today': messages_today
            },
            'system': {
                'uptime': system_uptime
            }
        }
        
    except Exception as e:
        print(f"Error getting admin stats: {e}")
        return get_default_stats()

def get_user_stats(user_id):
    """Get user dashboard statistics"""
    try:
        user = User.query.get(user_id)
        if not user:
            return get_default_stats()
        
        # User's groups
        user_groups = Group.query.filter_by(created_by_id=user_id).all()
        total_groups = len(user_groups)
        
        # User's messages
        user_messages = Message.query.filter_by(user_id=user_id).all()
        total_messages = len(user_messages)
        
        # Recent activity
        recent_messages = Message.query.filter_by(user_id=user_id).order_by(
            Message.created_at.desc()
        ).limit(5).all()
        
        # Unread messages (placeholder - would need actual implementation)
        unread_messages = 0
        
        return {
            'groups': {
                'total': total_groups,
                'list': [group.name for group in user_groups]
            },
            'messages': {
                'total': total_messages,
                'unread': unread_messages,
                'recent': len(recent_messages)
            },
            'activity': {
                'last_message': recent_messages[0].created_at.isoformat() if recent_messages else None,
                'recent_count': len(recent_messages)
            }
        }
        
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return get_default_stats()

def get_default_stats():
    """Get default statistics when errors occur"""
    return {
        'users': {'total': 0, 'active': 0, 'new_today': 0},
        'groups': {'total': 0, 'active': 0},
        'messages': {'total': 0, 'today': 0},
        'system': {'uptime': '99.9%'}
    }

def calculate_system_uptime():
    """Calculate system uptime (placeholder)"""
    # In a real application, this would check actual system uptime
    return '99.8%'

def get_recent_activity(user_id=None, limit=10):
    """Get recent activity for dashboard"""
    try:
        if user_id:
            # User-specific activity
            messages = Message.query.filter_by(user_id=user_id).order_by(
                Message.created_at.desc()
            ).limit(limit).all()
        else:
            # All activity (admin view)
            messages = Message.query.order_by(
                Message.created_at.desc()
            ).limit(limit).all()
        
        activity_list = []
        for message in messages:
            activity_list.append({
                'id': message.id,
                'type': 'message',
                'content': message.content[:50] + '...' if len(message.content) > 50 else message.content,
                'sender': message.sender_name or 'Unknown',
                'timestamp': message.created_at.isoformat(),
                'group': message.group.name if message.group else 'Unknown'
            })
        
        return activity_list
        
    except Exception as e:
        print(f"Error getting recent activity: {e}")
        return []

def get_message_sentiment_stats(user_id=None):
    """Get message sentiment statistics"""
    try:
        if user_id:
            # User-specific sentiment
            query = Message.query.filter_by(user_id=user_id)
        else:
            # All messages (admin view)
            query = Message.query
        
        # Count by sentiment
        sentiment_counts = db.session.query(
            Message.sentiment, func.count(Message.id)
        ).filter(
            query.whereclause
        ).group_by(Message.sentiment).all()
        
        sentiment_stats = {}
        for sentiment, count in sentiment_counts:
            sentiment_stats[sentiment or 'unknown'] = count
        
        return sentiment_stats
        
    except Exception as e:
        print(f"Error getting sentiment stats: {e}")
        return {'positive': 0, 'negative': 0, 'neutral': 0, 'unknown': 0}

def get_group_activity_stats(days=7):
    """Get group activity statistics for the last N days"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get daily message counts
        daily_stats = db.session.query(
            func.date(Message.created_at).label('date'),
            func.count(Message.id).label('count')
        ).filter(
            Message.created_at >= start_date
        ).group_by(
            func.date(Message.created_at)
        ).order_by(
            func.date(Message.created_at)
        ).all()
        
        # Format for chart display
        chart_data = []
        for date, count in daily_stats:
            chart_data.append({
                'date': date.strftime('%Y-%m-%d'),
                'messages': count
            })
        
        return chart_data
        
    except Exception as e:
        print(f"Error getting group activity stats: {e}")
        return []

def search_messages(query, user_id=None, filters=None):
    """Search messages with filters"""
    try:
        search_query = Message.query
        
        # Apply user filter if specified
        if user_id:
            search_query = search_query.filter_by(user_id=user_id)
        
        # Apply search query
        if query:
            search_query = search_query.filter(
                Message.content.ilike(f'%{query}%')
            )
        
        # Apply additional filters
        if filters:
            if filters.get('group_id'):
                search_query = search_query.filter_by(group_id=filters['group_id'])
            
            if filters.get('sentiment'):
                search_query = search_query.filter_by(sentiment=filters['sentiment'])
            
            if filters.get('date_from'):
                search_query = search_query.filter(
                    Message.created_at >= filters['date_from']
                )
            
            if filters.get('date_to'):
                search_query = search_query.filter(
                    Message.created_at <= filters['date_to']
                )
        
        # Order by creation date
        search_query = search_query.order_by(Message.created_at.desc())
        
        return search_query.all()
        
    except Exception as e:
        print(f"Error searching messages: {e}")
        return []
