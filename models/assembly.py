from extensions import db
from datetime import datetime

class Assembly(db.Model):
    """Assembly model for storing assembly information"""
    __tablename__ = 'assemblies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    remarks = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    
    # Foreign keys
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    created_by = db.relationship('User', backref='assemblies')
    
    def __repr__(self):
        return f'<Assembly {self.name}>'
    
    def to_dict(self):
        """Convert assembly to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'remarks': self.remarks,
            'is_active': self.is_active,
            'created_by': self.created_by.username if self.created_by else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
