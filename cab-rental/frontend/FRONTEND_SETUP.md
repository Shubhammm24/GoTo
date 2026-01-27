# 🚗 GoTo Cab Rental - Frontend Setup Guide

## Overview
Complete React frontend for the GoTo Cab Rental platform with modern design, smooth animations, and full feature coverage.

## ✨ Technology Stack

- **Framework**: React 18.2 with Vite
- **Styling**: Tailwind CSS 3.4 with custom animations
- **State Management**: Zustand (lightweight, simple, no boilerplate)
- **HTTP Client**: Axios with JWT interceptors
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Lucide React
- **Routing**: React Router DOM v6
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io client (prepared)
- **Maps**: Leaflet + React Leaflet (prepared)

## 📦 Installation

### 1. Navigate to frontend folder
```bash
cd frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
```bash
# Create a file named .env in the frontend folder
echo VITE_API_URL=http://localhost:5000/api > .env
```

### 4. Start development server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── NavBar.jsx      # Navigation with mobile menu
│   ├── Footer.jsx      # Footer component
│   └── ProtectedRoute.jsx  # Route protection with role checking
├── pages/              # Page components
│   ├── HomePage.jsx    # Landing page with hero section
│   ├── BookingPage.jsx # Vehicle booking & fare calculation
│   ├── PaymentPage.jsx # Payment method selection
│   ├── TrackingPage.jsx # Live tracking
│   ├── ReviewsPage.jsx # Submit & view reviews
│   ├── RideHistoryPage.jsx # User ride history
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── dashboards/
│       ├── UserDashboard.jsx     # Customer dashboard
│       ├── DriverDashboard.jsx   # Driver earnings & requests
│       └── AdminDashboard.jsx    # Admin approvals & stats
├── services/           # API & external services
│   └── api.js         # Axios instance with JWT interceptors
├── store/             # Zustand state management
│   └── index.js       # Auth, Booking, Payment, Vehicle stores
├── App.jsx            # Main router with 11 routes
├── main.jsx           # React entry point
├── index.css          # Global styles & animations
├── vite.config.js     # Vite configuration
└── postcss.config.js  # PostCSS with Tailwind
```

## 🎨 Key Features

### 1. **Authentication System**
- Login/Register with email & password
- Role-based registration (customer/driver/vehicle_owner)
- JWT token management with auto-refresh
- Protected routes with role-based access control

### 2. **Booking System**
- Vehicle selection (bike/car/scooter)
- Rental type toggle (driver-operated/self-drive)
- Real-time fare calculator with surge pricing
- Distance & duration based pricing

### 3. **Payment**
- 4 payment method options (credit card, wallet, bank transfer, cash)
- Smooth payment flow with animations

### 4. **Live Tracking**
- Real-time driver location tracking
- Route visualization
- Driver info & contact

### 5. **Ride History**
- Filter by date range
- Sort by fare/date
- Complete trip details

### 6. **Reviews System**
- Submit ratings & feedback
- View past reviews
- Star rating selector

### 7. **Dashboards**

#### Customer Dashboard
- Profile management
- Total rides & spending stats
- Rating display
- Quick links to booking/history/reviews
- Upcoming rides section

#### Driver Dashboard
- Earnings tracking (daily/weekly/monthly)
- Incoming ride requests with accept/decline
- On-duty toggle
- Trip history
- Passenger ratings

#### Admin Dashboard
- Platform statistics
- Pending driver approvals
- Pending vehicle approvals
- Approve/Reject functionality
- Revenue tracking

## 🔐 Authentication Flow

1. User registers/logs in → JWT token stored in Zustand store
2. Axios interceptor adds token to all requests
3. 401 responses trigger automatic logout
4. ProtectedRoute component checks token & role
5. Conditional navigation based on user type

## 🎬 Animation Details

- **Fade animations**: Page transitions, component reveals
- **Slide animations**: Sidebar, modals, dropdowns
- **Scale animations**: Button hover/tap effects
- **Stagger animations**: List items appear sequentially
- **Gradient animations**: Hero section, card backgrounds

## 📡 API Integration

All API calls use Zustand stores with async actions:

```javascript
// Example: Login
const { login, isLoading } = useAuthStore();
await login(email, password);

// Example: Create booking
const { createBooking } = useBookingStore();
await createBooking(bookingData);
```

JWT token is automatically added to all requests via Axios interceptor.

## 🚀 Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login form
- `/register` - Registration form

### Protected Routes (Customer)
- `/booking` - Book a ride
- `/history` - Ride history
- `/reviews` - Submit/view reviews
- `/tracking/:bookingId` - Live tracking
- `/payment` - Payment methods
- `/dashboard/user` - Customer dashboard

### Protected Routes (Driver)
- `/dashboard/driver` - Driver dashboard
- `/tracking/:bookingId` - Tracking

### Protected Routes (Admin)
- `/dashboard/admin` - Admin dashboard

## 🎯 Next Steps (To Complete Real-time Features)

1. **Socket.io Integration**
   ```javascript
   // Connect in useEffect
   const socket = io('http://localhost:5000', {
     auth: { token },
   });
   ```

2. **Leaflet Maps Integration**
   ```javascript
   // Replace map placeholder in TrackingPage
   import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
   ```

3. **Start Backend Server**
   ```bash
   cd ../backend
   npm run dev
   # Server runs on http://localhost:5000
   ```

## 🔧 Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

## 📝 Notes

- All forms include validation
- Responsive design for mobile/tablet/desktop
- Smooth loading states & error handling
- Toast notifications for user feedback
- Custom scrollbar styling
- Accessible keyboard navigation

## 🐛 Troubleshooting

### Port 5173 already in use?
```bash
npm run dev -- --port 3000
```

### API calls failing?
- Ensure backend is running on port 5000
- Check `.env` file has correct `VITE_API_URL`
- Check CORS settings in backend

### Styles not loading?
```bash
# Rebuild Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
```

## 📞 Support

For issues or questions, check:
1. Backend API documentation in `/backend/README.md`
2. Backend API testing guide in `/backend/TESTING_GUIDE.md`
3. Frontend components for usage examples
