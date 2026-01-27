# 🚀 Quick Start Guide - GoTo Cab Rental

## ⚡ 5-Minute Setup

### Step 1: Backend Setup (Terminal 1)
```bash
cd cab-rental/backend
npm install
npm run dev
# ✅ Server running on http://localhost:5000
```

### Step 2: Frontend Setup (Terminal 2)
```bash
cd cab-rental/frontend
npm install
echo VITE_API_URL=http://localhost:5000/api > .env
npm run dev
# ✅ Frontend running on http://localhost:5173
```

### Step 3: Open Browser
Navigate to `http://localhost:5173`

---

## 🧑‍💻 Test Accounts

### Customer Account
```
Email: customer@example.com
Password: Customer@123
Role: Customer
```

### Driver Account
```
Email: driver@example.com
Password: Driver@123
Role: Driver
```

### Admin Account
```
Email: admin@example.com
Password: Admin@123
Role: Admin
```

**Don't have these? Register new accounts in the UI!**

---

## 📱 Main Features to Try

### 1️⃣ Book a Ride
- Home page → "Book Now"
- Select vehicle (Bike/Car/Scooter)
- Toggle rental type
- Enter pickup/dropoff locations
- See real-time fare calculation
- Click "Continue to Payment"

### 2️⃣ Make Payment
- Select payment method
- Click "Pay Now"
- Confirmation received

### 3️⃣ View Ride History
- Dashboard → "Ride History"
- Filter by date range
- See trip details & stats

### 4️⃣ Submit Review
- Dashboard → "Reviews"
- Rate 1-5 stars
- Add feedback
- Submit

### 5️⃣ Driver Dashboard (if registered as driver)
- Toggle "On Duty" status
- View earnings (today/week/month)
- See incoming ride requests
- Accept/decline rides

### 6️⃣ Admin Dashboard (if registered as admin)
- View platform statistics
- Review pending approvals
- Approve/reject drivers & vehicles

---

## 🎨 Design Highlights

✨ **Smooth Animations**
- Page transitions fade smoothly
- Cards scale on hover
- Buttons have tap feedback
- Staggered list animations

📱 **Responsive Design**
- Mobile: Full-width cards
- Tablet: 2-column layout
- Desktop: 3-4 column layout

🎯 **Intuitive Navigation**
- Sticky navbar with mobile menu
- Role-based dashboard links
- Quick action buttons
- Clear call-to-action sections

---

## 📊 Fare Calculator

The booking page has a real-time fare calculator:

```
Formula: (BaseFare + Distance×PerKm + Duration×PerMin) × SurgeMultiplier

Bike:
  Base: ₹30
  Distance: ₹7/km
  Duration: ₹1/min

Car:
  Base: ₹50
  Distance: ₹12/km
  Duration: ₹2/min

Scooter:
  Base: ₹40
  Distance: ₹5/km
  Duration: ₹0.5/min

Example: 20km, 25min car ride
= (50 + 20×12 + 25×2) × 1.0
= (50 + 240 + 50) × 1.0
= ₹340
```

---

## 🔧 Project Structure

```
cab-rental/
├── backend/                 ← Express.js API
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/         ← Database, auth, etc.
│   │   ├── controllers/    ← Business logic
│   │   ├── models/         ← MongoDB schemas
│   │   ├── routes/         ← API endpoints
│   │   ├── middleware/     ← Auth, validation, etc.
│   │   ├── services/       ← Email, SMS, maps, etc.
│   │   └── sockets/        ← Real-time updates
│   └── package.json
│
├── frontend/                ← React + Vite
│   ├── src/
│   │   ├── pages/          ← Page components
│   │   ├── components/     ← Reusable components
│   │   ├── store/          ← Zustand state management
│   │   ├── services/       ← API client (axios)
│   │   ├── App.jsx         ← Main router
│   │   ├── main.jsx        ← Entry point
│   │   └── index.css       ← Global styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env                ← API URL config
│   └── package.json
│
├── PROJECT_STRUCTURE/
├── FRONTEND_FEATURES.md    ← Complete feature list
├── FRONTEND_SETUP.md       ← Setup & installation
├── FRONTEND_TESTING_GUIDE.md
└── README.md
```

---

## 🐛 Troubleshooting

### Backend won't start?
```bash
# Make sure MongoDB is running
# Check if port 5000 is available
# Clear node_modules and reinstall
rm -rf backend/node_modules
cd backend && npm install
```

### Frontend shows blank page?
```bash
# Check browser console for errors
# Make sure backend is running
# Check .env file for correct API URL
cat frontend/.env  # Should show VITE_API_URL=http://localhost:5000/api
```

### API calls failing?
```bash
# Backend must be running on port 5000
# Frontend must have correct .env
# Check browser Network tab for API responses
# Clear localStorage and re-login
# localhost:5173 → DevTools → Storage → LocalStorage → Clear
```

### Styles not loading?
```bash
npm run dev  # Restart frontend dev server
```

---

## 📖 Documentation

- **`FRONTEND_SETUP.md`** - Detailed setup instructions
- **`FRONTEND_TESTING_GUIDE.md`** - Testing procedures & scenarios
- **`FRONTEND_FEATURES.md`** - Complete feature documentation
- **`backend/README.md`** - Backend API documentation
- **`backend/TESTING_GUIDE.md`** - Backend testing guide

---

## 🎯 What's Implemented

### ✅ Completed Features (100%)
- User registration & login (3 roles: customer, driver, admin)
- JWT authentication with auto-refresh
- Protected routes with role-based access
- Book a ride with fare calculator
- Select payment method
- View ride history with filters
- Submit & view reviews
- Customer dashboard with stats
- Driver dashboard with earnings & requests
- Admin dashboard with approvals
- Responsive mobile design
- Smooth animations & transitions
- Form validation
- Error handling
- Toast notifications

### 🚀 Ready to Implement (Infrastructure in place)
- Real-time live tracking (Socket.io ready)
- Interactive maps (Leaflet ready)
- Push notifications
- Chat with driver/admin

---

## 💡 Pro Tips

1. **Test Different Roles**
   - Register as customer → Book rides
   - Register as driver → View requests
   - Register as admin → Approve submissions

2. **Check Responsive Design**
   - Press F12 → Toggle device toolbar (Ctrl+Shift+M)
   - Test on mobile (375px), tablet (768px), desktop

3. **Experiment with Animations**
   - Hover over cards to see scale effects
   - Click buttons to see tap feedback
   - Page transitions have smooth fades

4. **Review Code Structure**
   - `src/store/index.js` - State management patterns
   - `src/services/api.js` - API client setup
   - `src/components/ProtectedRoute.jsx` - Route protection
   - `src/pages/BookingPage.jsx` - Complex form with calculations

5. **Monitor API Calls**
   - Open DevTools Network tab
   - Make a booking
   - See all API requests with JWT tokens

---

## 📞 Next Steps

1. ✅ **Run the app** - Follow 5-minute setup above
2. 📝 **Test features** - Try all pages and interactions
3. 🔍 **Review code** - Check implementation patterns
4. 🚀 **Deploy** - Build & deploy to production
5. 📱 **Mobile app** - Create React Native version

---

## 🎉 You're All Set!

Your complete cab rental platform is ready to use:
- **Backend**: API server running
- **Frontend**: React app with all features
- **Database**: MongoDB connected
- **Authentication**: JWT with roles
- **Payments**: 4 payment methods
- **Real-time**: Socket.io infrastructure
- **Design**: Responsive, smooth, modern

Happy coding! 🚗✨

---

**Need Help?**
- Check the detailed guides in the docs folder
- Review the component source code
- Check browser console for errors
- Ensure both backend and frontend are running
