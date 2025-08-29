# IntelliDiag Backend API

A comprehensive backend API for the IntelliDiag medical diagnostic platform, built with Node.js, Express, and SQLite.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Patient Management**: Complete CRUD operations for patient records
- **Medical Scan Management**: Upload, analyze, and manage medical images
- **AI Analysis Integration**: Framework for AI-powered diagnostic analysis
- **Analytics & Reporting**: Comprehensive dashboard statistics and metrics
- **File Upload**: Secure image upload and storage
- **Security**: Rate limiting, input validation, XSS protection

## 🏗️ Architecture

```
backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Authentication & validation
├── routes/          # API endpoints
├── scripts/         # Database initialization
├── data/            # SQLite database files
├── uploads/         # Uploaded medical images
└── server.js        # Main server file
```

## 📊 Database Schema

### Core Tables

- **users**: Healthcare professionals and administrators
- **patients**: Patient information and demographics
- **scans**: Medical scan records and metadata
- **scan_images**: Medical image files and metadata
- **ai_analysis**: AI-powered diagnostic analysis
- **manual_analysis**: Radiologist manual analysis
- **medical_history**: Patient medical history
- **allergies**: Patient allergy information
- **medications**: Patient medication records

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**

   ```bash
   npm run db:init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

## 🚀 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PATCH /api/auth/update-password` - Update password
- `PATCH /api/auth/update-profile` - Update profile

### Patients

- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PATCH /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/patients/:id/medical-history` - Add medical history
- `POST /api/patients/:id/allergies` - Add allergy
- `POST /api/patients/:id/medications` - Add medication

### Scans

- `GET /api/scans` - Get all scans
- `GET /api/scans/:id` - Get scan by ID
- `POST /api/scans` - Upload new scan
- `PATCH /api/scans/:id/analysis` - Update scan analysis
- `PATCH /api/scans/:id/ai-analysis` - Update AI analysis
- `DELETE /api/scans/:id` - Delete scan
- `GET /api/scans/patient/:patientId` - Get scans by patient

### Diagnosis

- `GET /api/diagnosis` - Get all diagnoses
- `GET /api/diagnosis/stats` - Get diagnosis statistics
- `GET /api/diagnosis/:id` - Get diagnosis by ID
- `PATCH /api/diagnosis/:id/confidence` - Update confidence
- `GET /api/diagnosis/:scanId/compare` - Compare AI vs Manual
- `GET /api/diagnosis/:scanId/recommendations` - Get recommendations

### Users (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user
- `PATCH /api/users/:id/reactivate` - Reactivate user
- `GET /api/users/:id/stats` - Get user statistics
- `GET /api/users/role/:role` - Get users by role

### Analytics

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/scans` - Scan statistics
- `GET /api/analytics/patients` - Patient statistics
- `GET /api/analytics/users` - User activity statistics
- `GET /api/analytics/performance` - Performance metrics

## 🔐 Authentication & Authorization

### User Roles

- **admin**: Full system access
- **doctor**: Patient and scan management
- **radiologist**: Scan analysis and diagnosis
- **patient**: Limited access (future feature)

### Protected Routes

Most routes require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 File Upload

Medical images are uploaded via multipart/form-data:

- Supported formats: JPG, PNG, GIF, BMP
- Maximum file size: 10MB (configurable)
- Maximum files per scan: 10
- Files stored in `uploads/` directory

## 🧪 Testing

```bash
npm test
```

## 📊 Database Management

### Initialize Database

```bash
npm run db:init
```

### Reset Database

```bash
rm data/intellidiag.db
npm run db:init
```

## 🚀 Production Deployment

For production, consider:

1. **Database**: Switch to PostgreSQL (as planned)
2. **File Storage**: Use cloud storage (AWS S3, Cloudinary)
3. **Environment**: Set `NODE_ENV=production`
4. **Security**: Use strong JWT secrets and HTTPS
5. **Monitoring**: Add logging and health checks

## 🔧 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run db:init` - Initialize database
- `npm run db:migrate` - Run database migrations

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Middleware**: Authentication, validation, and security
- **Routes**: Define API endpoints and HTTP methods
- **Config**: Database and application configuration

## 📚 API Documentation

### Request/Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "data": { ... },
  "message": "Optional message"
}
```

### Error Handling

```json
{
  "status": "error",
  "message": "Error description",
  "errors": [ ... ] // Validation errors
}
```

### Pagination

```json
{
  "data": [ ... ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🤝 Contributing

1. Follow the existing code style
2. Add validation for new endpoints
3. Include error handling
4. Update documentation
5. Test your changes

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:

- Check the API documentation
- Review error logs
- Contact the development team

---

**Note**: This backend is designed for development with SQLite. For production, it will be migrated to PostgreSQL as planned.
