# IntelliDiag - AI-Powered Medical Diagnostics Platform

A modern, responsive medical diagnostic platform built with Next.js, featuring AI-powered scan analysis, patient management, and comprehensive healthcare analytics.

## 🚀 Features

- **AI-Powered Diagnostics**: Advanced medical image analysis using artificial intelligence
- **Patient Management**: Complete patient records with medical history tracking
- **Medical Scan Upload**: Secure image upload and analysis system
- **Real-time Analytics**: Comprehensive dashboard with healthcare metrics
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Role-based Access**: Secure authentication for healthcare professionals
- **Interactive Animations**: Smooth GSAP animations and Framer Motion transitions

## 🏗️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **React 19** - Latest React features and hooks
- **Styled Components** - CSS-in-JS styling
- **GSAP** - Professional-grade animations
- **Framer Motion** - React animation library
- **React Icons** - Comprehensive icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite** - Lightweight database (development)
- **PostgreSQL** - Production database (planned)
- **JWT** - Secure authentication
- **Multer** - File upload handling

## 📱 Pages & Routes

- **`/`** - Landing page with immersive animations
- **`/dashboard`** - Medical dashboard with patient management
- **`/about`** - Company information
- **`/features`** - Platform features overview
- **`/contact`** - Contact information

## 🛠️ Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend setup)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd intellidiag-complete
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up assets**

   ```bash
   chmod +x setup-nextjs.sh
   ./setup-nextjs.sh
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.js          # Root layout
│   ├── page.js            # Home page
│   └── dashboard/         # Dashboard route
│       └── page.js        # Dashboard page
├── components/             # React components
│   ├── homepage/          # Dashboard components
│   ├── navbar/            # Navigation components
│   └── ...                # Other components
├── services/               # API services
│   └── api.js             # Backend API client
├── styles/                 # Global styles
│   └── globals.css        # Global CSS
└── lib/                    # Utility libraries
    └── registry.js        # Styled-components registry
```

### Key Components

#### Landing Page (`src/app/page.js`)

- **GSAP Animations**: Scroll-triggered frame animations
- **Canvas Rendering**: Dynamic image sequence display
- **Interactive Overlay**: Modal with smooth transitions
- **Responsive Design**: Mobile-optimized layout

#### Dashboard (`src/app/dashboard/page.js`)

- **Patient Management**: CRUD operations for patient records
- **Scan Analysis**: Medical image upload and AI analysis
- **Real-time Data**: Live healthcare metrics
- **Role-based UI**: Different views for different user types

#### Navigation (`src/components/navbar/`)

- **Sticky Navigation**: Modern navbar with backdrop blur
- **Responsive Menu**: Mobile-friendly navigation
- **Active States**: Visual feedback for current page

## 🎨 Design System

### Color Palette

- **Primary**: `#0694FB` (Blue)
- **Secondary**: `#0094FF` (Light Blue)
- **Background**: `#000000` (Black)
- **Surface**: `#0D0D0D` (Dark Gray)
- **Text**: `#FFFFFF` (White)
- **Muted**: `#A0A0A0` (Gray)

### Typography

- **Font Family**: SF Pro Display, system fonts
- **Headings**: 32px - 62px (responsive)
- **Body**: 14px - 18px
- **Weights**: 400, 500, 600

### Animations

- **GSAP ScrollTrigger**: Frame-by-frame animations
- **Framer Motion**: Component transitions
- **CSS Transitions**: Hover effects and micro-interactions

## 🔌 API Integration

### Backend Connection

The frontend connects to the backend API at `http://localhost:5000`:

```javascript
// Example API usage
import { patientAPI } from "@/services/api";

// Get all patients
const patients = await patientAPI.getAll();

// Create new patient
const newPatient = await patientAPI.create(patientData);
```

### Available API Services

- **`authAPI`** - Authentication and user management
- **`patientAPI`** - Patient CRUD operations
- **`scanAPI`** - Medical scan management
- **`diagnosisAPI`** - AI analysis results
- **`userAPI`** - User management (admin)
- **`analyticsAPI`** - Dashboard statistics

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Laptop**: 769px - 1024px
- **Desktop**: 1025px - 1200px
- **Large**: 1201px+

### Mobile Optimizations

- Touch-friendly interactions
- Optimized image loading
- Responsive typography
- Mobile-first navigation

## 🚀 Performance

### Optimization Features

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Component and image lazy loading
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Automatic static asset caching

### Performance Tips

- Use `next/image` for optimized images
- Implement proper loading states
- Optimize GSAP animations
- Use React.memo for expensive components

## 🔒 Security

### Frontend Security

- **Input Validation**: Client-side form validation
- **XSS Prevention**: Sanitized user inputs
- **CSRF Protection**: Built-in Next.js protection
- **Secure Headers**: Automatic security headers

### Authentication

- JWT token management
- Secure token storage
- Automatic token refresh
- Role-based access control

## 🧪 Testing

### Testing Setup

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Tools

- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **MSW** - API mocking (if needed)

## 📦 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deployment Options

- **Vercel** - Recommended (Next.js creators)
- **Netlify** - Static site hosting
- **AWS Amplify** - Full-stack hosting
- **Docker** - Containerized deployment

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=IntelliDiag
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- Use Prettier for formatting
- Follow ESLint rules
- Use TypeScript for new files (optional)
- Write meaningful commit messages

## 📚 Documentation

### Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [GSAP Documentation](https://greensock.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion)

### API Documentation

See the backend README for complete API documentation and endpoints.

## 🆘 Support

### Getting Help

- Check the documentation
- Review existing issues
- Create a new issue with details
- Contact the development team

### Common Issues

- **Images not loading**: Check public directory structure
- **Animations not working**: Ensure GSAP is properly imported
- **API errors**: Verify backend is running and accessible

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - Amazing React framework
- **GSAP Team** - Professional animation library
- **Framer Team** - Motion design tools
- **Healthcare Community** - Domain expertise and feedback

---

**Built with ❤️ for the future of healthcare diagnostics**
