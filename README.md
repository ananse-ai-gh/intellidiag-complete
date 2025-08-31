# IntelliDiag - AI-Powered Medical Diagnostic Platform

A comprehensive medical diagnostic platform built with Next.js 14, TypeScript, and SQLite, featuring AI-powered scan analysis, patient management, and modern UI/UX with seamless animations.

## 🚀 Features

### 🔐 Authentication & Authorization

- **Modal-Based Authentication** - Seamless login/registration modals with smooth animations
- **JWT-based authentication** - Secure token-based authentication
- **Role-based access control** - Admin, Doctor, Radiologist, Patient roles
- **Secure password hashing** - bcrypt with salt rounds
- **Protected API routes** - Server-side route protection
- **Auto-login on registration** - Users are automatically logged in after successful registration

### 🎨 Modern UI/UX

- **Custom Font Integration** - Poppins font family for professional appearance
- **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- **Bubble-in Modal Effects** - Elegant modal animations with scale and fade effects
- **Page Transitions** - Animated transitions between pages and dashboard entry
- **Logout Animations** - Professional logout flow with animated transitions
- **Custom Cursor** - Interactive cursor with hover effects and click animations
- **Responsive Design** - Mobile-first responsive layout

### 👥 User Management

- **Streamlined Registration** - "Get Started" button opens registration modal
- **Form Switching** - Smooth transitions between login and registration forms
- **Profile management** - User profile updates and settings
- **Role-based permissions** - Granular access control
- **User activity tracking** - Session management and activity logs

### 🏥 Patient Management

- **Complete patient records** - Comprehensive patient information
- **Medical history tracking** - Detailed medical history and notes
- **Allergies and medications** - Patient allergy and medication records
- **Contact information** - Complete demographic and contact data
- **Doctor assignment** - Patient-doctor relationship management

### 🔬 Medical Scans

- **Multiple scan types** - X-Ray, CT, MRI, Ultrasound, PET scans
- **Image upload and storage** - Secure file upload system
- **Scan status tracking** - Pending, analyzing, completed, archived statuses
- **Priority-based queue** - Urgent, high, medium, low priority management
- **AI analysis integration** - Automated scan analysis pipeline

### 🤖 AI Analysis

- **Automated scan analysis** - AI-powered diagnostic assistance
- **Confidence scoring** - Analysis confidence metrics
- **Findings and recommendations** - Detailed diagnostic reports
- **Processing time tracking** - Analysis duration monitoring
- **Manual review integration** - Radiologist override and validation

### 📊 Analytics & Reporting

- **Real-time dashboard metrics** - Live data visualization
- **Scan type distribution** - Statistical analysis of scan types
- **Status tracking** - Real-time status monitoring
- **Monthly trends** - Historical data analysis
- **Recent activity feed** - User activity timeline
- **Performance metrics** - System performance monitoring

## 🛠️ Technology Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Styled-components** - CSS-in-JS styling with optimized performance
- **Framer Motion** - Advanced React animations and transitions
- **GSAP** - High-performance animations for complex sequences
- **React Icons** - Comprehensive icon library
- **Poppins Font** - Professional typography

### Backend (Next.js API Routes)

- **Next.js API Routes** - Serverless API endpoints
- **SQLite** - Lightweight database (development)
- **JWT** - Authentication tokens with configurable expiration
- **bcryptjs** - Password hashing with salt rounds
- **UUID** - Unique identifier generation

### Animation & UX Libraries

- **Framer Motion** - React animation library for smooth transitions
- **GSAP** - Professional animation library for complex sequences
- **Styled-components** - CSS-in-JS with optimized class generation
- **React Context** - Global state management for modals and auth

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
   curl -X POST http://localhost:3000/api/init
   ```

5. **Start the development server**

   ```bash
   # For port 3000 (recommended)
   npm run dev:3000

   # For port 8001
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000 (or http://localhost:8001)
   - API Health: http://localhost:3000/api/health

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
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── layout.tsx       # Root layout with global providers
│   │   └── page.tsx         # Homepage with animations
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── navbar/         # Navigation components
│   │   ├── homepage/       # Dashboard components
│   │   ├── cursor.tsx      # Custom cursor component
│   │   ├── PageTransition.tsx # Page transition animations
│   │   └── LogoutTransition.tsx # Logout animation component
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication context
│   │   └── ModalContext.tsx # Global modal state management
│   ├── lib/                # Utility libraries
│   │   └── database.ts    # Database configuration
│   ├── services/           # API services
│   │   └── api.ts         # API client
│   └── styles/            # Global styles
│       └── globals.css    # Global CSS with font variables
├── data/                  # SQLite database files
├── public/               # Static assets
│   ├── frames/           # Animation frame images
│   ├── manifest.json     # PWA manifest
│   └── robots.txt        # SEO robots file
├── .env.local            # Environment variables
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## 🎨 UI/UX Features

### Modal Authentication System

- **Bubble-in Animation** - Smooth modal entrance with scale and fade effects
- **Form Switching** - Animated transitions between login and registration forms
- **Success Animations** - Modal scaling and fade-out on successful authentication
- **Error Handling** - Graceful error display with user-friendly messages
- **Loading States** - Spinner animations during authentication processes

### Page Transitions

- **Dashboard Entry** - Welcome animation when entering dashboard
- **Route-based Messages** - Contextual transition messages
- **Loading Spinners** - Professional loading indicators
- **Smooth Fade Effects** - Elegant fade in/out transitions

### Interactive Elements

- **Custom Cursor** - Interactive cursor with hover and click effects
- **Hover Animations** - Micro-interactions on interactive elements
- **Button States** - Loading, disabled, and active states
- **Form Validation** - Real-time validation with visual feedback

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration with role assignment
- `POST /api/auth/login` - User login with JWT token
- `GET /api/auth/me` - Get current user profile

### Patients

- `GET /api/patients` - List patients (with pagination and search)
- `POST /api/patients` - Create new patient record
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient information
- `DELETE /api/patients/[id]` - Delete patient record

### Scans

- `GET /api/scans` - List scans (with filtering and pagination)
- `POST /api/scans` - Create new scan record
- `GET /api/scans/[id]` - Get scan details
- `PUT /api/scans/[id]` - Update scan information
- `DELETE /api/scans/[id]` - Delete scan record

### Users

- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create new user (admin only)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user profile
- `DELETE /api/users/[id]` - Delete user account

### Analytics

- `GET /api/analytics` - Get dashboard analytics and metrics

### System

- `GET /api/health` - Health check endpoint
- `POST /api/init` - Initialize database schema

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication with configurable expiration
- **Password Hashing** - bcrypt with salt rounds for secure password storage
- **Input Validation** - Comprehensive server-side validation for all inputs
- **SQL Injection Protection** - Parameterized queries with prepared statements
- **CORS Protection** - Configured for development and production environments
- **Role-Based Access** - Granular permissions based on user roles
- **Session Management** - Secure session handling with token storage

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
# For port 3000 (recommended)
npm run dev:3000

# For port 8001
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

- Set `JWT_SECRET` to a strong, unique secret
- Configure proper CORS origins for your production domain
- Set up database connection (PostgreSQL recommended for production)
- Configure file upload limits and storage paths

## 🎯 Key Features Summary

### ✅ Completed Features

- **Modal Authentication** - Seamless login/registration with animations
- **Modern UI/UX** - Professional design with smooth animations
- **Role-Based Access** - Complete user role management
- **Patient Management** - Comprehensive patient records
- **Scan Management** - Medical scan tracking and analysis
- **Dashboard Analytics** - Real-time metrics and reporting
- **Responsive Design** - Mobile-first responsive layout
- **Security** - JWT authentication and input validation
- **Database** - SQLite with comprehensive schema
- **API** - Complete REST API with Next.js routes

### 🚀 Performance Optimizations

- **Optimized Animations** - Efficient Framer Motion usage
- **Styled-components Optimization** - Reduced class generation
- **Image Optimization** - Proper image loading and caching
- **Code Splitting** - Automatic Next.js code splitting
- **Bundle Optimization** - Optimized production builds

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**IntelliDiag** - Revolutionizing medical diagnostics with AI-powered analysis and modern UX 🏥🤖✨

_Built with ❤️ using Next.js 14, TypeScript, and modern web technologies_
