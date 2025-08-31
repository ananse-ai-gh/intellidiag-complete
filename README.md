# IntelliDiag - AI-Powered Medical Diagnostic Platform

A comprehensive medical diagnostic platform built with Next.js 14, TypeScript, and SQLite, featuring AI-powered scan analysis and patient management.

## 🚀 Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Doctor, Radiologist, Patient)
- Secure password hashing with bcrypt
- Protected API routes

### 👥 User Management

- User registration and login
- Profile management
- Role-based permissions
- User activity tracking

### 🏥 Patient Management

- Complete patient records
- Medical history tracking
- Allergies and medications
- Contact information and demographics

### 🔬 Medical Scans

- Multiple scan types (X-Ray, CT, MRI, Ultrasound, PET)
- Image upload and storage
- Scan status tracking (pending, analyzing, completed, archived)
- Priority-based queue management

### 🤖 AI Analysis

- Automated scan analysis
- Confidence scoring
- Findings and recommendations
- Processing time tracking

### 📊 Analytics & Reporting

- Real-time dashboard metrics
- Scan type distribution
- Status tracking
- Monthly trends
- Recent activity feed

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Styled-components** - CSS-in-JS styling
- **GSAP** - Advanced animations
- **Framer Motion** - React animations
- **React Icons** - Icon library

### Backend (Next.js API Routes)

- **Next.js API Routes** - Serverless API endpoints
- **SQLite** - Lightweight database (development)
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **UUID** - Unique identifier generation

### Database Schema

- **Users** - Authentication and user profiles
- **Patients** - Patient information and demographics
- **Scans** - Medical scan records
- **AI Analysis** - Automated analysis results
- **Manual Analysis** - Radiologist reviews
- **Medical History** - Patient medical records
- **Allergies** - Patient allergies
- **Medications** - Current medications

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd intellidiag-complete
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.local.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Frontend Environment Variables
   NEXT_PUBLIC_API_URL=http://localhost:8001
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8001

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d

   # File Upload
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads

   # Database
   DB_PATH=./data/intellidiag.db
   ```

4. **Initialize the database**

   ```bash
   curl -X POST http://localhost:8001/api/init
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:8001
   - API Health: http://localhost:8001/api/health

### Default Admin Account

- **Email**: admin@intellidiag.com
- **Password**: admin123

## 📁 Project Structure

```
intellidiag-complete/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── patients/      # Patient management
│   │   │   ├── scans/        # Scan management
│   │   │   ├── users/        # User management
│   │   │   ├── analytics/    # Analytics and reporting
│   │   │   ├── health/       # Health check
│   │   │   └── init/         # Database initialization
│   │   ├── dashboard/        # Dashboard page
│   │   ├── login/           # Login page
│   │   ├── register/        # Registration page
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Homepage
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── navbar/         # Navigation components
│   │   └── homepage/       # Homepage components
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx # Authentication context
│   ├── lib/                # Utility libraries
│   │   └── database.ts    # Database configuration
│   ├── services/           # API services
│   │   └── api.ts         # API client
│   └── styles/            # Global styles
│       └── globals.css    # Global CSS
├── data/                  # SQLite database files
├── public/               # Static assets
├── .env.local            # Environment variables
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Patients

- `GET /api/patients` - List patients (with pagination and search)
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

### Scans

- `GET /api/scans` - List scans (with filtering and pagination)
- `POST /api/scans` - Create new scan
- `GET /api/scans/[id]` - Get scan details
- `PUT /api/scans/[id]` - Update scan
- `DELETE /api/scans/[id]` - Delete scan

### Users

- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create new user (admin only)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Analytics

- `GET /api/analytics` - Get dashboard analytics

### System

- `GET /api/health` - Health check
- `POST /api/init` - Initialize database

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Protection** - Parameterized queries
- **CORS Protection** - Configured for development and production
- **Rate Limiting** - API rate limiting (can be added)
- **Role-Based Access** - Granular permissions based on user roles

## 📊 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT CHECK(role IN ('doctor', 'radiologist', 'admin', 'patient')) DEFAULT 'doctor',
  specialization TEXT,
  licenseNumber TEXT,
  isActive BOOLEAN DEFAULT 1,
  lastLogin DATETIME,
  profileImage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Patients Table

```sql
CREATE TABLE patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patientId TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender TEXT CHECK(gender IN ('male', 'female', 'other')) NOT NULL,
  contactNumber TEXT,
  email TEXT,
  street TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  country TEXT,
  assignedDoctorId INTEGER,
  isActive BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedDoctorId) REFERENCES users (id)
);
```

### Scans Table

```sql
CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scanId TEXT UNIQUE NOT NULL,
  patientId INTEGER NOT NULL,
  scanType TEXT CHECK(scanType IN ('X-Ray', 'CT', 'MRI', 'Ultrasound', 'PET', 'Other')) NOT NULL,
  bodyPart TEXT NOT NULL,
  scanDate DATE NOT NULL,
  uploadedById INTEGER NOT NULL,
  priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK(status IN ('pending', 'analyzing', 'completed', 'archived')) DEFAULT 'pending',
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patientId) REFERENCES patients (id),
  FOREIGN KEY (uploadedById) REFERENCES users (id)
);
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

- Set `JWT_SECRET` to a strong, unique secret
- Configure `NEXT_PUBLIC_API_URL` for your production domain
- Set up proper CORS origins
- Configure database connection (PostgreSQL recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team

---

**IntelliDiag** - Revolutionizing medical diagnostics with AI-powered analysis 🏥🤖
