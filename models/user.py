from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from extensions import db



class User(UserMixin, db.Model):
    """User model for authentication and user management"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='user', nullable=False)  # 'user' or 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    
    # Profile information
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    avatar = db.Column(db.String(255))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    messages = db.relationship('Message', backref='user', lazy='dynamic')
    groups = db.relationship('Group', backref='created_by', lazy='dynamic')
    
    def __init__(self, username, email, password, role='user', **kwargs):
        self.username = username
        self.email = email
        self.set_password(password)
        self.role = role
        
        # Set additional attributes if provided
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def is_admin(self):
        """Check if user is admin"""
        return self.role == 'admin'
    
    def update_last_login(self):
        """Update last login timestamp"""
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
    
    def __repr__(self):
        return f'<User {self.username}>'

class Group(db.Model):
    """WhatsApp group model"""
    __tablename__ = 'groups'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    group_id = db.Column(db.String(100), unique=True, nullable=False)  # WhatsApp group ID
    member_count = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    
    # Foreign keys
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='group', lazy='dynamic')
    
    def __repr__(self):
        return f'<Group {self.name}>'

class Message(db.Model):
    """WhatsApp message model"""
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.String(100), unique=True, nullable=False)  # WhatsApp message ID
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='text')  # text, image, video, audio, document
    sender_name = db.Column(db.String(100))
    sender_phone = db.Column(db.String(20))
    
    # Sentiment analysis
    sentiment = db.Column(db.String(20))  # positive, negative, neutral
    sentiment_score = db.Column(db.Float)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    whatsapp_timestamp = db.Column(db.DateTime)
    
    def __repr__(self):
        return f'<Message {self.message_id[:20]}...>'

class PostSchedule(db.Model):
    """Scheduled post model for WhatsApp groups"""
    __tablename__ = 'post_schedules'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    message_text = db.Column(db.Text)
    
    # Content files
    audio_file = db.Column(db.String(255))  # File path
    video_file = db.Column(db.String(255))  # File path
    image_file = db.Column(db.String(255))  # File path
    
    # Scheduling
    scheduled_date = db.Column(db.Date, nullable=False)
    scheduled_time = db.Column(db.Time, nullable=False)
    is_sent = db.Column(db.Boolean, default=False)
    sent_at = db.Column(db.DateTime)
    
    # Status - Updated with more options
    status = db.Column(db.String(20), default='pending')  # pending, running, completed, failed, cancelled
    
    # Admin notes for status changes
    admin_notes = db.Column(db.Text)
    
    # Completion file (optional Excel/CSV when marking as completed)
    completion_file = db.Column(db.String(255))  # File path
    
    # Foreign keys
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assembly_id = db.Column(db.Integer, db.ForeignKey('assemblies.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    target_groups = db.relationship('PostScheduleGroup', backref='post_schedule', lazy='dynamic', cascade='all, delete-orphan')
    assembly = db.relationship('Assembly', backref='scheduled_posts', lazy='joined')
    created_by = db.relationship('User', backref='scheduled_posts', lazy='joined')
    
    def __repr__(self):
        return f'<PostSchedule {self.title}>'
    
    def to_dict(self):
        """Convert to dictionary"""
        try:
            assembly_name = self.assembly.name if self.assembly else None
        except:
            assembly_name = None
            
        try:
            created_by_username = self.created_by.username if self.created_by else None
            created_by_email = self.created_by.email if self.created_by else None
        except:
            created_by_username = None
            created_by_email = None
            
        return {
            'id': self.id,
            'title': self.title,
            'message_text': self.message_text,
            'audio_file': self.audio_file,
            'video_file': self.video_file,
            'image_file': self.image_file,
            'scheduled_date': self.scheduled_date.isoformat() if self.scheduled_date else None,
            'scheduled_time': self.scheduled_time.isoformat() if self.scheduled_time else None,
            'is_sent': self.is_sent,
            'sent_at': self.sent_at.isoformat() if self.sent_at else None,
            'status': self.status,
            'admin_notes': self.admin_notes,
            'completion_file': self.completion_file,
            'created_by_id': self.created_by_id,
            'created_by_username': created_by_username,
            'created_by_email': created_by_email,
            'assembly_id': self.assembly_id,
            'assembly_name': assembly_name,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'target_groups': [tg.to_dict() for tg in self.target_groups]
        }

class PostScheduleGroup(db.Model):
    """Many-to-many relationship between PostSchedule and Group"""
    __tablename__ = 'post_schedule_groups'
    
    id = db.Column(db.Integer, primary_key=True)
    post_schedule_id = db.Column(db.Integer, db.ForeignKey('post_schedules.id'), nullable=False)
    group_name = db.Column(db.String(200), nullable=False)  # Store group name from XLSX
    assembly_name = db.Column(db.String(200), nullable=False)  # Store assembly name
    
    def to_dict(self):
        """Convert to dictionary"""
        return {
            'id': self.id,
            'post_schedule_id': self.post_schedule_id,
            'group_name': self.group_name,
            'assembly_name': self.assembly_name
        }
