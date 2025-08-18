# 🚀 WhatsApp UI - Route Structure Documentation

## 📁 **Routes Directory Structure**

```
routes/
├── __init__.py          # Package initialization & blueprint exports
├── auth.py              # Authentication routes (login, logout, registration)
├── dashboard.py         # Main dashboard routing & legacy redirects
├── admin.py             # Admin-specific routes & management
├── user.py              # User-specific routes & features
└── api.py               # API endpoints for AJAX calls
```

## 🔐 **Authentication Routes** (`/auth`)

**File**: `routes/auth.py`  
**Blueprint**: `auth_bp`  
**URL Prefix**: `/auth`

### **Available Routes:**
- `GET /auth/user/login` - User login page
- `POST /auth/user/login` - User login processing
- `GET /auth/admin/login` - Admin login page
- `POST /auth/admin/login` - Admin login processing
- `GET /auth/logout` - Logout (both user and admin)

---

## 🎯 **Main Dashboard Routes** (`/dashboard`)

**File**: `routes/dashboard.py`  
**Blueprint**: `dashboard_bp`  
**URL Prefix**: `/dashboard`

### **Available Routes:**
- `GET /dashboard/` - Main dashboard (redirects based on user role)

### **Legacy Route Redirects:**
- `/dashboard/admin` → `/admin/dashboard`
- `/dashboard/user` → `/user/dashboard`
- `/dashboard/api/*` → `/api/*`

---

## 👑 **Admin Routes** (`/admin`)

**File**: `routes/admin.py`  
**Blueprint**: `admin_bp`  
**URL Prefix**: `/admin`

### **Dashboard Routes:**
- `GET /admin/dashboard` - Admin main dashboard

### **Management Routes:**
- `GET /admin/upload-reports` - Upload Reports page
- `GET /admin/upload-groups` - Upload Groups page
- `GET /admin/message-management` - Message Management page
- `GET /admin/manage-topics` - Admin Topics Management
- `GET /admin/assembly-list` - Assembly List management

### **User Management:**
- `GET /admin/users` - Manage all users
- `GET /admin/users/<id>` - View specific user
- `GET /admin/users/<id>/edit` - Edit user details
- `POST /admin/users/<id>/delete` - Delete user (soft delete)

### **Group Management:**
- `GET /admin/groups` - Manage all groups
- `GET /admin/groups/<id>` - View specific group

### **Message Management:**
- `GET /admin/messages` - Manage all messages
- `GET /admin/messages/<id>` - View specific message

### **System Settings:**
- `GET /admin/settings` - System configuration
- `GET /admin/logs` - System logs
- `GET /admin/backup` - System backup

---

## 👤 **User Routes** (`/user`)

**File**: `routes/user.py`  
**Blueprint**: `user_bp`  
**URL Prefix**: `/user`

### **Dashboard Routes:**
- `GET /user/dashboard` - User main dashboard

### **Feature Routes:**
- `GET /user/whatsapp-analysis` - WhatsApp Analysis
- `GET /user/advanced-search` - Advanced Search
- `GET /user/post-sending-groups` - Post Sending Groups
- `GET /user/whatsapp-groups-list` - WhatsApp Groups List
- `GET /user/manage-topics` - User Topics Management

### **Profile Routes:**
- `GET /user/profile` - User profile page
- `GET /user/profile/edit` - Edit profile
- `POST /user/profile/edit` - Update profile
- `GET /user/change-password` - Change password form
- `POST /user/change-password` - Update password

### **Activity Routes:**
- `GET /user/activity` - User activity log
- `GET /user/notifications` - User notifications

### **Help & Support:**
- `GET /user/help` - Help center
- `GET /user/support` - Support tickets
- `GET /user/faq` - Frequently Asked Questions

---

## 🔌 **API Routes** (`/api`)

**File**: `routes/api.py`  
**Blueprint**: `api_bp`  
**URL Prefix**: `/api`

### **Dashboard Statistics:**
- `GET /api/stats` - Get dashboard statistics

### **Assembly Management:**
- `GET /api/assemblies` - Get all assemblies
- `POST /api/assemblies` - Create new assembly
- `GET /api/assemblies/<id>` - Get specific assembly
- `PUT /api/assemblies/<id>` - Update assembly
- `DELETE /api/assemblies/<id>` - Delete assembly

### **User Management (Admin Only):**
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/<id>` - Get specific user

### **Group Management (Admin Only):**
- `GET /api/groups` - Get all groups (paginated)

### **Message Management (Admin Only):**
- `GET /api/messages` - Get all messages (paginated)

### **System Health:**
- `GET /api/health` - System health check

---

## 🛡️ **Security & Access Control**

### **Authentication Required:**
- All routes except `/auth/*` and `/api/health` require login

### **Admin-Only Routes:**
- All `/admin/*` routes
- Most `/api/*` routes (except `/api/stats` and `/api/health`)

### **User-Only Routes:**
- All `/user/*` routes (regular users cannot access admin routes)

### **Role-Based Access:**
- **Admin Users**: Access to all routes
- **Regular Users**: Access to user routes only
- **Unauthenticated**: Access to auth routes only

---

## 🔄 **URL Structure Examples**

### **Admin Access:**
```
/admin/dashboard          → Admin main dashboard
/admin/assembly-list      → Assembly management
/admin/users              → User management
/api/assemblies           → Assembly API
```

### **User Access:**
```
/user/dashboard           → User main dashboard
/user/whatsapp-analysis   → WhatsApp analysis
/user/profile             → User profile
/api/stats                → Dashboard statistics
```

### **Authentication:**
```
/auth/user/login          → User login
/auth/admin/login         → Admin login
/auth/logout              → Logout
```

---

## 📝 **Adding New Routes**

### **1. Choose the Right File:**
- **Admin features** → `routes/admin.py`
- **User features** → `routes/user.py`
- **API endpoints** → `routes/api.py`
- **Authentication** → `routes/auth.py`

### **2. Follow the Pattern:**
```python
@admin_bp.route('/new-feature')  # or user_bp, api_bp
@login_required
@admin_required                  # if admin-only
def new_feature():
    """Description of the route"""
    return render_template('template.html', user=current_user)
```

### **3. Update Sidebar Navigation:**
- Update `templates/admin_slidebar.html` for admin routes
- Update `templates/user_slidebar.html` for user routes

---

## 🎨 **Benefits of This Structure**

✅ **Clear Separation**: Admin, user, and API routes are clearly separated  
✅ **Easy Maintenance**: Each file has a specific responsibility  
✅ **Scalable**: Easy to add new features to the right category  
✅ **Understandable**: New developers can quickly find relevant routes  
✅ **Organized**: Related functionality is grouped together  
✅ **Secure**: Role-based access control is clearly implemented  

---

## 🚀 **Getting Started**

1. **Login as Admin**: `/auth/admin/login`
2. **Access Admin Dashboard**: `/admin/dashboard`
3. **Manage Assemblies**: `/admin/assembly-list`
4. **View API Endpoints**: `/api/assemblies`

1. **Login as User**: `/auth/user/login`
2. **Access User Dashboard**: `/user/dashboard`
3. **Use Features**: `/user/whatsapp-analysis`

---

*This structure makes the codebase much more organized and easier to understand! 🎯*
