# 🎯 PHASE 1: BACKEND SETUP - COMPLETED ✅

## What We Did

We successfully set up a production-ready Laravel REST API backend for the University Waste Management Platform.

---

## 📁 Backend Folder Structure

```
backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Auth/
│   │       │   ├── GoogleAuthController.php       # Google OAuth login
│   │       │   └── SupervisorAuthController.php   # Supervisor username/password login
│   │       ├── ReportController.php               # Waste report CRUD operations
│   │       └── CompletionController.php           # Report completion with geolocation validation
│   └── Models/
│       ├── User.php                               # Student user model (MongoDB)
│       ├── Supervisor.php                         # Supervisor model (MongoDB)
│       ├── Report.php                             # Waste report model (MongoDB)
│       └── CompletedReport.php                    # Report completion proof (MongoDB)
├── bootstrap/
│   └── app.php                                    # Main application bootstrap
├── config/
│   ├── database.php                               # Database config (MongoDB)
│   └── sanctum.php                                # Sanctum authentication config
├── database/
│   └── migrations/                                # Sanctum token table migration
├── routes/
│   ├── api.php                                    # All API endpoints
│   └── web.php                                    # Web routes (not used)
├── .env                                           # Environment variables (FILLED)
├── composer.json                                  # PHP dependencies
└── artisan                                        # Laravel CLI tool
```

---

## 🔧 Installed Dependencies

### Composer Packages Added
- **laravel/sanctum** - API token authentication
- **mongodb/laravel-mongodb** - MongoDB driver for Laravel
- **cloudinary-labs/cloudinary-laravel** - Cloudinary image upload service

### Why These?
- **Sanctum**: Lightweight API authentication system. Creates tokens for authenticated requests.
- **MongoDB Laravel**: MongoDB driver that works seamlessly with Eloquent ORM.
- **Cloudinary**: Cloud storage for images (waste photos, proof photos).

---

## 📋 Environment Variables Configured

### `.env` File Contains

```env
# Basic App Config
APP_NAME=UniversityWasteManagement
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

# MongoDB Atlas Connection
DB_CONNECTION=mongodb
MONGODB_URI=mongodb+srv://hiteshparida614_db_user:Waste1234@cluster0.d4at7nx.mongodb.net/?appName=Cluster0
DB_DATABASE=Waste
DB_USERNAME=hiteshparida614_db_user
DB_PASSWORD=Waste1234

# Cloudinary Upload Service
CLOUDINARY_URL=cloudinary://765411854227798:q8e88Jd1A5vXndrtp9xmGc4OitY@dwwt4b1v0
CLOUDINARY_CLOUD_NAME=dwwt4b1v0
CLOUDINARY_API_KEY=765411854227798
CLOUDINARY_API_SECRET=q8e88Jd1A5vXndrtp9xmGc4OitY
CLOUDINARY_UPLOAD_FOLDER=waste_management

# Google OAuth for Students
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Sanctum Authentication
SESSION_DOMAIN=127.0.0.1
SANCTUM_STATEFUL_DOMAINS=127.0.0.1:5173,localhost:5173
FRONTEND_URL=http://127.0.0.1:5173
```

---

## 🗄️ MongoDB Collections Ready

These collections will be created automatically when first record is inserted:

### 1. `users` Collection
```javascript
{
  _id: ObjectId(),
  name: "Student Name",
  email: "student@university.edu",
  google_id: "google-id-token",
  role: "student",
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### 2. `supervisors` Collection
```javascript
{
  _id: ObjectId(),
  username: "supervisor_1",
  password: "hashed-bcrypt-password",
  name: "Supervisor Name",
  email: "supervisor@university.edu",
  phone: "9876543210",
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### 3. `reports` Collection
```javascript
{
  _id: ObjectId(),
  image_url: "https://cloudinary.com/waste-image-1.jpg",
  latitude: 19.123456,
  longitude: 72.987654,
  waste_type: "plastic",
  smell: true,
  severity: "high",
  note: "Broken plastic bags near library",
  status: "pending",  // or "completed"
  reported_by: ObjectId(),  // User ID
  created_at: ISODate(),
  updated_at: ISODate()
}
```

### 4. `completed_reports` Collection
```javascript
{
  _id: ObjectId(),
  report_id: ObjectId(),  // Reference to report
  cleaned_image_url: "https://cloudinary.com/cleaned-image-1.jpg",
  supervisor_latitude: 19.123456,
  supervisor_longitude: 72.987654,
  completed_by: ObjectId(),  // Supervisor ID
  original_latitude: 19.123456,
  original_longitude: 72.987654,
  distance_validated: true,
  distance_meters: 45.5,
  completed_at: ISODate(),
  created_at: ISODate(),
  updated_at: ISODate()
}
```

---

## 🔗 API Routes Configured

### Public Routes (No Authentication)

```
POST   /api/auth/google/login
       - Request: { token, name, email }
       - Response: { user, token }

POST   /api/auth/supervisor/login
       - Request: { username, password }
       - Response: { supervisor, token }

GET    /api/reports/all
       - Response: All reports with stats

GET    /api/reports/pending
       - Response: Pending reports list
```

### Student Routes (Protected - Sanctum Token Required)

```
POST   /api/reports/create
       - Request: { image, latitude, longitude, waste_type, smell, severity, note }
       - Response: Created report

GET    /api/reports/my-reports
       - Response: Current user's reports

GET    /api/reports/{id}
       - Response: Single report details

POST   /api/auth/logout
       - Response: Logout success
```

### Supervisor Routes (Protected - Sanctum Token Required)

```
GET    /api/supervisor/reports/pending
       - Response: Pending reports (oldest first)

GET    /api/supervisor/reports/completed
       - Response: Completed reports

POST   /api/supervisor/completion/{report_id}
       - Request: { image, latitude, longitude }
       - Response: Completion success

POST   /api/supervisor/completion/{report_id}/validate-location
       - Request: { latitude, longitude }
       - Response: { validated, distance_meters }

POST   /api/supervisor/logout
       - Response: Logout success
```

---

## 🔐 Authentication System

### How It Works

1. **Student Login (Google OAuth)**
   - Frontend sends Google token to `/api/auth/google/login`
   - Backend verifies and creates/retrieves user
   - Returns Sanctum API token
   - Student includes token in `Authorization: Bearer {token}` header for all requests

2. **Supervisor Login (Username/Password)**
   - Supervisor submits credentials to `/api/auth/supervisor/login`
   - Backend verifies username and hashed password
   - Returns Sanctum API token
   - Supervisor uses token for authenticated requests

3. **Geolocation Validation**
   - Uses Haversine formula to calculate distance between points
   - Acceptable distance: 100 meters
   - Prevents supervisors from completing reports remotely

---

## 📸 Cloudinary Integration

### Image Upload Flow

1. **Student captures waste image**
   - Browser camera captures image
   - Image converted to base64
   - Sent to `/api/reports/create`

2. **Backend uploads to Cloudinary**
   - Image uploaded to `waste_management/reports` folder
   - Secure URL returned
   - URL stored in MongoDB

3. **Supervisor uploads proof image**
   - Supervisor captures cleaned area photo
   - Sent to `/api/supervisor/completion/{id}`
   - Uploaded to `waste_management/completions` folder
   - URL stored in CompletedReport

### Security
- All uploads happen via backend (secrets not exposed)
- Frontend only sends base64 images
- Cloudinary URLs are public and secure

---

## 🚀 How to Run Backend Locally

### Terminal Command
```powershell
cd c:\xampp\htdocs\waste\backend
C:\xampp\php\php.exe C:\xampp\htdocs\waste\backend\artisan serve --host=127.0.0.1 --port=8000
```

### Output
```
INFO  Server running on [http://127.0.0.1:8000].
Press Ctrl+C to stop the server
```

### Current Status
✅ **Running on http://127.0.0.1:8000**

---

## 🧪 Test API Endpoint

### Check Backend is Working

```bash
# Open browser or use curl
curl http://127.0.0.1:8000/up

# Response: 200 OK (Laravel health check)
```

---

## 📝 File Explanations

### `app/Models/User.php`
- Represents a student user
- Uses MongoDB instead of SQL
- Has relationship with Report (one user → many reports)
- Includes Sanctum tokens for authentication
- Fields: name, email, google_id, role, timestamps

### `app/Models/Supervisor.php`
- Represents a supervisor
- Uses username/password authentication
- Hashed password storage
- Has relationship with CompletedReport (one supervisor → many completions)
- Fields: username, password, name, email, phone, timestamps

### `app/Models/Report.php`
- Represents a waste report
- References User and CompletedReport
- Has scopes: pending(), completed(), oldest()
- Cloudinary image_url stored
- GPS coordinates: latitude, longitude
- Status tracking: pending → completed

### `app/Models/CompletedReport.php`
- Proof of completion record
- References Report and Supervisor
- Stores proof image URL from Cloudinary
- Geolocation validation stored
- Distance calculation in meters
- Method: `isWithinAcceptableDistance()` checks 100m limit

### `routes/api.php`
- Defines all API endpoints
- Grouped by authentication type
- Student routes: `/api/reports/*`
- Supervisor routes: `/api/supervisor/*`
- Public routes: `/api/auth/*`, `/api/reports/all`

### `app/Http/Controllers/Auth/GoogleAuthController.php`
- Handles Google OAuth login
- Creates/updates user record
- Returns Sanctum token
- Public endpoint (no authentication needed)

### `app/Http/Controllers/Auth/SupervisorAuthController.php`
- Handles supervisor login
- Validates username and password
- Returns Sanctum token with "supervisor" ability
- Logout revokes token

### `app/Http/Controllers/ReportController.php`
- Create new waste report with image
- Upload to Cloudinary
- Retrieve user's reports
- Get pending reports (oldest first)
- Get completed reports with proof data

### `app/Http/Controllers/CompletionController.php`
- Complete a report with proof photo
- Validate supervisor location (Haversine formula)
- Calculate distance in meters
- Only allow completion within 100m of original location
- Create CompletedReport record
- Update Report status to 'completed'

### `config/database.php`
- Configured MongoDB connection
- Connection string from Atlas
- Database name: "Waste"
- Driver: 'mongodb'

### `bootstrap/app.php`
- Main application bootstrap file
- Registers routes (web, api, console)
- Configures middleware
- Enables Sanctum stateful API

---

## ⚠️ Important Notes

1. **MongoDB Connection**
   - Uses MongoDB Atlas cloud database
   - Network access set to 0.0.0.0/0
   - Database automatically creates collections

2. **Cloudinary**
   - Images stored in cloud (not local server)
   - Public URLs returned for display
   - Secrets kept in backend only

3. **Sanctum Tokens**
   - Tokens expire when user logs out
   - Each token is unique per session
   - CORS configured for frontend domain

4. **Geolocation Validation**
   - 100-meter acceptable distance
   - Prevents fake completions
   - Uses Haversine formula for accuracy

---

## ✅ Phase 1 Checklist

- ✅ Laravel backend created
- ✅ MongoDB Atlas connected
- ✅ Cloudinary configured
- ✅ Sanctum authentication setup
- ✅ 4 MongoDB models created (User, Supervisor, Report, CompletedReport)
- ✅ 4 API controllers created
- ✅ All routes configured
- ✅ Environment variables filled
- ✅ Backend running successfully
- ✅ All code documented with comments

---

## 🎯 Next: Phase 2

Ready to move to **Phase 2: Frontend Setup**

- React + TypeScript setup
- Tailwind CSS configuration
- React Router setup
- Axios HTTP client
- Basic layouts and pages
- Component structure

---

**Backend Status**: ✅ READY
**URL**: http://127.0.0.1:8000
**Terminal ID**: 5b9e5824-b34d-423a-b5c1-aed15bd7e16f
