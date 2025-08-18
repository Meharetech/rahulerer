# 🚀 WhatsApp UI - Professional Flask Management System

A comprehensive, modern Flask web application for **WhatsApp Analytics and Management** with advanced user and admin dashboards, built using industry best practices, proper separation of concerns, and a professional architecture.

## 🌟 **Key Features**

### **🔐 Advanced Authentication System**
- **Dual Login System**: Separate user and admin authentication
- **Role-Based Access Control**: Admin and regular user roles
- **Session Management**: Secure Flask-Login integration
- **Password Security**: Werkzeug hashing with CSRF protection
- **Default Accounts**: Pre-configured admin and user accounts

### **📊 Comprehensive Dashboard System**
- **Admin Dashboard**: System overview, user management, analytics
- **User Dashboard**: Personal statistics and feature access
- **Responsive Design**: Mobile-friendly modern interface
- **Interactive Sidebars**: Dynamic navigation with role-based menus

### **📁 Advanced File Management**
- **Upload Reports**: JSON file uploads with date and folder organization
- **Upload Groups**: Multi-format file uploads for group management
- **Assembly Management**: Create, edit, and manage assembly structures
- **Dynamic Directory Creation**: Automatic folder structure generation

### **🔍 WhatsApp Data Analysis**
- **Message Processing**: AI-powered content classification
- **Sentiment Analysis**: Automated sentiment detection
- **Content Categorization**: Spam detection, health news, casual chat
- **Data Export**: Comprehensive data management capabilities

---

## 🏗️ **Professional Project Structure**

```
whatsapp-ui/
├── 📁 app.py                    # Main Flask application entry point
├── 📁 config.py                 # Configuration management (Dev/Prod/Test)
├── 📁 extensions.py             # Flask extensions initialization
├── 📁 requirements.txt          # Python dependencies
├── 📁 ROUTES_STRUCTURE.md      # Comprehensive route documentation
├── 📁 README.md                # Project documentation
├── 📁 topics.json              # Topics configuration
├── 📁 app.log                  # Application logs
│
├── 📁 routes/                   # Route blueprints (MVC Architecture)
│   ├── __init__.py             # Blueprint exports
│   ├── auth.py                 # Authentication routes
│   ├── dashboard.py            # Main dashboard routing
│   ├── admin.py                # Admin-specific routes
│   ├── user.py                 # User-specific routes
│   └── api.py                  # REST API endpoints
│
├── 📁 models/                   # Database models (SQLAlchemy ORM)
│   ├── __init__.py             # Model exports
│   ├── user.py                 # User, Group, Message models
│   └── assembly.py             # Assembly model
│
├── 📁 templates/                # HTML templates (Jinja2)
│   ├── base.html               # Base template with responsive design
│   ├── user_slidebar.html      # User sidebar navigation
│   ├── admin_slidebar.html     # Admin sidebar navigation
│   ├── auth/                   # Authentication templates
│   ├── dashboard/              # Dashboard templates
│   ├── admin/                  # Admin-specific templates
│   └── user/                   # User-specific templates
│
├── 📁 static/                   # Static assets
│   ├── css/                    # Stylesheets
│   │   ├── main.css            # Main responsive styles
│   │   └── assembly_list.css   # Assembly-specific styles
│   └── js/                     # JavaScript files
│       └── dashboard.js        # Dashboard functionality
│
├── 📁 middleware/               # Custom middleware
│   ├── __init__.py             # Middleware exports
│   └── auth_middleware.py      # Authentication & security middleware
│
├── 📁 utils/                    # Utility functions
│   ├── __init__.py             # Utility exports
│   ├── auth_utils.py           # Authentication utilities
│   └── dashboard_utils.py      # Dashboard utilities
│
├── 📁 forms/                    # WTForms definitions
│   ├── __init__.py             # Form exports
│   └── auth_forms.py           # Authentication forms
│
└── 📁 database/                 # External data storage
    └── hisar/                  # Assembly/Region data
        ├── groups/              # Group files (Excel format)
        └── 2025-08-16/         # Date-based folders
            └── messages/        # WhatsApp message JSON files
```

---

## 🚀 **Complete API Endpoints**

### **🔐 Authentication API (`/auth`)**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/auth/user/login` | User login page | Public |
| `POST` | `/auth/user/login` | User login processing | Public |
| `GET` | `/auth/admin/login` | Admin login page | Public |
| `POST` | `/auth/admin/login` | Admin login processing | Public |
| `GET` | `/auth/logout` | Logout (both user/admin) | Authenticated |
| `GET` | `/auth/register` | User registration page | Public |
| `POST` | `/auth/register` | User registration processing | Public |

### **🎯 Dashboard API (`/dashboard`)**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/dashboard/` | Main dashboard (role-based redirect) | Authenticated |

### **👑 Admin API (`/admin`)**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/admin/dashboard` | Admin main dashboard | Admin Only |
| `GET` | `/admin/upload-reports` | Upload Reports page | Admin Only |
| `GET` | `/admin/upload-groups` | Upload Groups page | Admin Only |
| `GET` | `/admin/message-management` | Message Management page | Admin Only |
| `GET` | `/admin/manage-topics` | Admin Topics Management | Admin Only |
| `GET` | `/admin/assembly-list` | Assembly List management | Admin Only |
| `GET` | `/admin/users` | Manage all users | Admin Only |
| `GET` | `/admin/groups` | Manage all groups | Admin Only |
| `GET` | `/admin/messages` | Manage all messages | Admin Only |

### **👤 User API (`/user`)**
| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `GET` | `/user/dashboard` | User main dashboard | User Only |
| `GET` | `/user/whatsapp-analysis` | WhatsApp Analysis | User Only |
| `GET` | `/user/advanced-search` | Advanced Search | User Only |
| `GET` | `/user/post-sending-groups` | Post Sending Groups | User Only |
| `GET` | `/user/whatsapp-groups-list` | WhatsApp Groups List | User Only |
| `GET` | `/user/manage-topics` | User Topics Management | User Only |
| `GET` | `/user/profile` | User profile page | User Only |
| `GET` | `/user/profile/edit` | Edit profile | User Only |

### **🔌 REST API (`/api`)**
| Method | Endpoint | Description | Access | Response |
|--------|----------|-------------|---------|----------|
| `GET` | `/api/stats` | Dashboard statistics | Authenticated | JSON |
| `GET` | `/api/health` | System health check | Public | JSON |
| `GET` | `/api/assemblies` | Get all assemblies | Admin Only | JSON |
| `POST` | `/api/assemblies` | Create new assembly | Admin Only | JSON |
| `GET` | `/api/assemblies/<id>` | Get specific assembly | Admin Only | JSON |
| `PUT` | `/api/assemblies/<id>` | Update assembly | Admin Only | JSON |
| `DELETE` | `/api/assemblies/<id>` | Delete assembly | Admin Only | JSON |
| `GET` | `/api/users` | Get all users (paginated) | Admin Only | JSON |
| `GET` | `/api/groups` | Get all groups (paginated) | Admin Only | JSON |
| `GET` | `/api/messages` | Get all messages (paginated) | Admin Only | JSON |
| `POST` | `/api/upload-reports` | Upload JSON reports | Admin Only | JSON |
| `POST` | `/api/upload-groups` | Upload group files | Admin Only | JSON |

---

## 🗄️ **Database Models**

### **👤 User Model**
```python
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    # Core fields
    id = db.Integer(primary_key=True)
    username = db.String(80, unique=True, nullable=False)
    email = db.String(120, unique=True, nullable=False)
    password_hash = db.String(255, nullable=False)
    role = db.String(20, default='user')  # 'user' or 'admin'
    is_active = db.Boolean(default=True)
    is_verified = db.Boolean(default=False)
    
    # Profile fields
    first_name = db.String(50)
    last_name = db.String(50)
    phone = db.String(20)
    avatar = db.String(255)
    
    # Timestamps
    created_at = db.DateTime(default=datetime.utcnow)
    updated_at = db.DateTime(default=datetime.utcnow)
    last_login = db.DateTime
```

### **🏛️ Assembly Model**
```python
class Assembly(db.Model):
    __tablename__ = 'assemblies'
    
    # Core fields
    id = db.Integer(primary_key=True)
    name = db.String(200, nullable=False, unique=True)
    remarks = db.Text
    is_active = db.Boolean(default=True)
    
    # Foreign keys
    created_by_id = db.Integer(db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.DateTime(default=datetime.utcnow)
    updated_at = db.DateTime(default=datetime.utcnow)
```

### **👥 Group Model**
```python
class Group(db.Model):
    __tablename__ = 'groups'
    
    # Core fields
    id = db.Integer(primary_key=True)
    name = db.String(100, nullable=False)
    description = db.Text
    group_id = db.String(100, unique=True)  # WhatsApp group ID
    member_count = db.Integer(default=0)
    is_active = db.Boolean(default=True)
    
    # Foreign keys
    created_by_id = db.Integer(db.ForeignKey('users.id'))
```

---

## 📊 **External Database Structure**

### **📁 Database Organization**
```
database/
└── hisar/                          # Assembly/Region name
    ├── groups/                     # Groups folder (Excel files)
    │   ├── VILLMUSE KALAN_all_1755076730346_.xlsx
    │   ├── VILLPADHRI KALAN_all_1755074939313_.xlsx
    │   ├── VILLMANAN_all_1755077112565_.xlsx
    │   ├── VILLMATTEWAL_all_1755076760635_.xlsx
    │   ├── VILLMANAKPURA_all_1755076833159_.xlsx
    │   ├── VillMaluwal_all_1755076264430_.xlsx
    │   ├── VILLMALIA KHURD_all_1755076724924_.xlsx
    │   ├── VILLKILA KAVI SANTHOK _all_1755077135816_.xlsx
    │   ├── VILLJOHAL RAJU SINGH _all_1755076093688_.xlsx
    │   ├── VillKaironwal_all_1755076839854_.xlsx
    │   ├── VILLJHABAL KHURD_all_1755076797982_.xlsx
    │   ├── VILLJHAMKE  Kalan_all_1755076145465_.xlsx
    │   ├── VILLGEHIRI_all_1755076958992_.xlsx
    │   ├── VILLGOHALWAR_all_1755076011817_.xlsx
    │   ├── VILLHARBANSPURA _all_1755076218703_.xlsx
    │   ├── VILLHIRAPUR BHUJRANWALA_all_1755076964663_.xlsx
    │   ├── VILLDHAALA HAWELIAN_all_1755076909482_.xlsx
    │   ├── VILLCHAHAL_all_1755076742115_.xlsx
    │   ├── VILLBHUSE_all_1755076106160_.xlsx
    │   ├── Vill Panjwar Khurd_all_1755076931848_.xlsx
    │   ├── Vill Ram Rauni_all_1755076251196_.xlsx
    │   ├── Vill RasulpurBir Raja_all_1755075294332_.xlsx
    │   ├── VILL RATAUL_all_1755074907467_.xlsx
    │   ├── Vill Thathi khara_all_1755077098091_.xlsx
    │   ├── VillBhojran wala_all_1755076123851_.xlsx
    │   ├── Vill Pandori Takhat mal khurd_all_1755076036884_.xlsx
    │   ├── Vill Pandori Ran Singh_all_1755076288892_.xlsx
    │   ├── Vill Pandori Takhat Mal kalan_all_1755076936213_.xlsx
    │   ├── Vill Mirpur  _all_1755076166868_.xlsx
    │   ├── Vill Mugal Chak Gill_all_1755074977599_.xlsx
    │   ├── Vill Paddhri Kalan_all_1755076999302_.xlsx
    │   ├── Vill Paddhri Khurd_all_1755077262017_.xlsx
    │   ├── VILL PANDORI HASSAN_all_1755076886200_.xlsx
    │   ├── Vill Malia Kalan_all_1755076974838_.xlsx
    │   ├── Vill Majjupur_all_1755076368609_.xlsx
    │   ├── Vill Lahian_all_1755076079942_.xlsx
    │   ├── Vill Burj 195_all_1755074956013_.xlsx
    │   ├── Vill Bhojian_all_1755076173981_.xlsx
    │   ├── Vill Burj 169_all_1755077022204_.xlsx
    │   ├── Vill Adda Jhabhal_all_1755076044447_.xlsx
    │   ├── URBAN NETZONE_all_1755073691101_.xlsx
    │   ├── Ukraine gang_all_1755077154542_.xlsx
    │   ├── TarnTaran dist social media offcial  group _all_1755078982851_.xlsx
    │   ├── Tarn Taran Assembly_all_1755076182030_.xlsx
    │   ├── Swrgapuri panchayat _all_1755076052285_.xlsx
    │   ├── Surjit singh_all_1755077505965_.xlsx
    │   ├── Surjit singh_all_1755077449903_.xlsx
    │   ├── Sukhwinder Singh_all_1755079958310_.xlsx
    │   ├── sukhwinder singh _all_1755077562962_.xlsx
    │   ├── Sukhwider sigh _all_1755079881174_.xlsx
    │   ├── Sukhraj singh_all_1755077477099_.xlsx
    │   ├── Sukhman kaur_all_1755077370973_.xlsx
    │   ├── Sukhjit singh_all_1755077436099_.xlsx
    │   ├── Sukhdev Singh_all_1755079792496_.xlsx
    │   ├── Sukhchan singh_all_1755079801563_.xlsx
    │   ├── Sukhbir singh_all_1755077302486_.xlsx
    │   ├── Sawarn Singh_all_1755077204175_.xlsx
    │   ├── shah stud farm Amritsar_all_1755075276843_.xlsx
    │   ├── Simranjit Singh_all_1755079767644_.xlsx
    │   ├── Socil media block inchagurop_all_1755079075344_.xlsx
    │   ├── SOHAL _all_1755076826065_.xlsx
    │   ├── Satnam singh_all_1755079702068_.xlsx
    │   ├── Satnam singh_all_1755077442197_.xlsx
    │   ├── Satnam Singh _all_1755080001177_.xlsx
    │   ├── Sarpanch_all_1755075384653_.xlsx
    │   ├── Sarpanch group_all_1755075244090_.xlsx
    │   ├── SARPANCH BLOCK GANDIWIND _all_1755075997045_.xlsx
    │   ├── sarbjit singh_all_1755077257023_.xlsx
    │   ├── Sarbjit Singh _all_1755077516977_.xlsx
    │   ├── Sarai amant khan New Panchayat_all_1755074829314_.xlsx
    │   ├── Sangara singh _all_1755079806112_.xlsx
    │   ├── Sandeep singh_all_1755077252654_.xlsx
    │   ├── Sandeep Singh_all_1755079503473_.xlsx
    │   ├── Sahib singh_all_1755077391177_.xlsx
    │   ├── Sahejpreet singh_all_1755077619785_.xlsx
    │   ├── Sahab singh_all_1755079862661_.xlsx
    │   ├── Risky life_all_1755076920827_.xlsx
    │   ├── requirements.txt
    │   ├── README.md
    │   ├── Rawal_all_1755079906821_.xlsx
    │   ├── Ranjodh singh_all_1755077582779_.xlsx
    │   ├── Rana_all_1755077402431_.xlsx
    │   ├── Ranjit Singh _all_1755079810083_.xlsx
    │   ├── Ramlubhaya_all_1755079587806_.xlsx
    │   ├── Rajan singh_all_1755079734235_.xlsx
    │   ├── Punjab_all_1755077577320_.xlsx
    │   ├── Punjab sarkar_all_1755077628801_.xlsx
    │   ├── Punjab Official Alerts Tarn Taran_all_1755078747341_.xlsx
    │   ├── princ merpur_all_1755077417180_.xlsx
    │   ├── prince_all_1755079995621_.xlsx
    │   ├── Prabh _all_1755079649928_.xlsx
    │   ├── Prabh_all_1755077423708_.xlsx
    │   ├── PREET ayma_all_1755079885012_.xlsx
    │   ├── panchayat noordi_all_1755079568344_.xlsx
    │   ├── phone_number_extractor.py
    │   ├── Padhri kalan_all_1755079479944_.xlsx
    │   ├── Panchayat group _all_1755077169561_.xlsx
    │   ├── Padheri group_all_1755079830134_.xlsx
    │   ├── Nishu_all_1755079784069_.xlsx
    │   └── NURDI KS SINGH  _all_1755076969780_.xlsx
    └── 2025-08-16/                 # Date folder (YYYY-MM-DD format)
        └── messages/                # Messages folder
            ├── Aap_parti_2025-08-15.json (65KB, 1700 lines)
            ├── AAP_Pandori_sidhwan_2025-08-15 (1).json (3.1KB, 98 lines)
            ├── Aap_Paddhri_Khurd_2025-08-15.json (12KB, 344 lines)
            ├── Aap_nurdi_2025-08-15.json (59KB, 1730 lines)
            ├── Aap_Kot_Sivian_2025-08-15.json (49KB, 1110 lines)
            ├── AAP_KOT_DOSANDHI_MALL_2025-08-15.json (8.9KB, 286 lines)
            ├── Aap_Chabhal_Adda_2025-08-15.json (111KB, 2156 lines)
            ├── Aap_bhojian_2025-08-15.json (9.5KB, 142 lines)
            ├── Aam_adami_party_2025-08-15.json (62KB, 1490 lines)
            ├── Aam_adami_party_2025-08-15 (1).json (36KB, 1218 lines)
            └── Govt_Jobs_Alert_46_2025-08-15 (1).json (12KB, 242 lines)
```

### **📄 JSON Message Data Structure**
```json
[
  {
    "sender": {
      "name": "Dhillon",
      "phoneNumber": "919876125545"
    },
    "messageContent": "https://www.instagram.com/reel/DNEBx9Dz7wa/?igsh=cTBsMmlhZWNwcWR3",
    "messageType": "text",
    "imageUrl": null,
    "timestamp": "2025-08-15T03:56:42.837Z",
    "group_name": "Aap_Chabhal_Adda_2025-08-15",
    "date": "Test",
    "processed_time": "2025-08-16T16:12:37.723137",
    "predicted_label": "spam",
    "predicted_sentiment": "Positive",
    "processing_mode": "URL+Text"
  }
]
```

**JSON Message Fields:**
- **sender.name**: Sender's display name
- **sender.phoneNumber**: Sender's phone number (+91 format)
- **messageContent**: Actual message text/URL
- **messageType**: Type of message (text, image)
- **imageUrl**: Image blob URL if image message
- **timestamp**: Message timestamp
- **group_name**: WhatsApp group name
- **date**: Date label
- **processed_time**: When message was processed
- **predicted_label**: AI classification (spam, health_news, casual_chat)
- **predicted_sentiment**: AI sentiment analysis (Positive, Neutral)
- **processing_mode**: Processing method (URL+Text, Text-Only)

---

## 🛠️ **Installation & Setup**

### **1. Clone the Repository**
```bash
git clone <your-repo-url>
cd whatsapp-ui
```

### **2. Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### **3. Install Dependencies**
```bash
pip install -r requirements.txt
```

### **4. Environment Setup**
Create a `.env` file in the root directory:
```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///whatsapp_ui.db
```

### **5. Run the Application**
```bash
python app.py
```

The application will be available at `http://localhost:5000`

---

## 🔐 **Default Credentials**

### **👤 User Account**
- **Username**: `user`
- **Password**: `1234567890`

### **👑 Admin Account**
- **Username**: `admin`
- **Password**: `1234567890`

---

## 📱 **Usage Guide**

### **👤 User Dashboard**
1. Navigate to `/auth/user/login`
2. Login with user credentials
3. Access WhatsApp analytics and group management
4. Use sidebar navigation for different features:
   - Dashboard Statistics
   - WhatsApp Analysis
   - Advanced Search
   - Post Sending Groups
   - WhatsApp Groups List
   - Manage Topics

### **👑 Admin Dashboard**
1. Navigate to `/auth/admin/login`
2. Login with admin credentials
3. Access system overview and user management
4. Use sidebar navigation for different features:
   - Dashboard Statistics
   - Upload Reports
   - Upload Groups
   - Message Management
   - Manage Topics
   - Assembly List

---

## 🔧 **Configuration**

### **Development Configuration**
```python
# config.py
class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True
```

### **Production Configuration**
```python
# config.py
class ProductionConfig(Config):
    DEBUG = False
    SESSION_COOKIE_SECURE = True
    SECRET_KEY = os.environ.get('SECRET_KEY')
```

---

## 🗄️ **Database Configuration**

### **SQLite (Default)**
- File: `whatsapp_ui.db`
- Location: Project root directory
- Auto-created on first run

### **PostgreSQL (Production)**
```env
DATABASE_URL=postgresql://user:password@localhost/whatsapp_ui
```

---

## 🧪 **Testing**

### **Run Tests**
```bash
pytest
```

### **Test Coverage**
```bash
pytest --cov=app tests/
```

---

## 🚀 **Deployment**

### **Gunicorn (Production)**
```bash
gunicorn -w 4 -b 0.0.0.0:8000 "app:create_app()"
```

### **Docker (Optional)**
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:create_app()"]
```

---

## 🎨 **Customization**

### **Styling**
- Modify `static/css/main.css` for custom styles
- Update color scheme in CSS variables
- Add custom components and layouts

### **JavaScript**
- Extend `static/js/dashboard.js` for additional functionality
- Add chart libraries (Chart.js, D3.js)
- Implement real-time updates with WebSockets

### **Templates**
- Customize Jinja2 templates in `templates/` directory
- Add new dashboard sections
- Modify sidebar navigation

---

## 🔒 **Security Features**

### **Production Deployment**
- Use strong `SECRET_KEY`
- Enable HTTPS
- Set `SESSION_COOKIE_SECURE = True`
- Use environment variables for sensitive data
- Implement proper logging and monitoring

### **User Management**
- Regular password updates
- Account lockout policies
- Session timeout configuration
- Audit logging

---

## 📈 **Performance Optimization**

### **Database**
- Add database indexes
- Implement query optimization
- Use connection pooling
- Regular database maintenance

### **Caching**
- Redis for session storage
- Memcached for data caching
- Browser caching for static files

---

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Database errors**: Check database URL and permissions
2. **Import errors**: Verify virtual environment activation
3. **Template errors**: Check Jinja2 syntax and file paths
4. **Static files not loading**: Verify static folder structure

### **Debug Mode**
```bash
export FLASK_ENV=development
export FLASK_DEBUG=1
python app.py
```

---

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 **Support**

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

## 🔮 **Future Enhancements**

- Real-time messaging with WebSockets
- Advanced analytics and reporting
- WhatsApp Business API integration
- Mobile app development
- Multi-language support
- Advanced user permissions
- API rate limiting
- Automated testing pipeline
- Machine learning integration
- Advanced data visualization
- Real-time notifications
- Multi-tenant architecture

---

## 🏆 **Technical Achievements**

✅ **Professional Architecture**: Clean separation of concerns with blueprints  
✅ **Security First**: Comprehensive authentication and authorization  
✅ **Responsive Design**: Mobile-friendly modern interface  
✅ **Scalable Structure**: Easy to extend and maintain  
✅ **Data Management**: Advanced file upload and processing  
✅ **AI Integration**: Content classification and sentiment analysis  
✅ **Performance**: Optimized database queries and caching  
✅ **Documentation**: Comprehensive API and usage documentation  

---

**Built with ❤️ using Flask and modern web technologies**

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Status**: Production Ready 🚀
#   r a h u l e r e r  
 #   r a h u l e r e r  
 #   r a h u l e r e r  
 #   r a h u l e r e r  
 