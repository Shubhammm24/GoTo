# 🧪 Frontend Testing Guide

## Prerequisites

- Backend running on `http://localhost:5000` with MongoDB connected
- Frontend running on `http://localhost:5173`
- `.env` file configured with `VITE_API_URL=http://localhost:5000/api`

## 🚀 Quick Start Testing

### 1. Install & Run Backend
```bash
cd backend
npm install
npm run dev
# Backend should be running on port 5000
```

### 2. Install & Run Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend should be running on port 5173
```

### 3. Open Browser
Navigate to `http://localhost:5173`

## 📋 Test Scenarios

### Scenario 1: User Registration & Login
1. Click "Register" in navbar
2. Fill in details:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `9876543210`
   - Password: `Test@123`
   - Role: Select `Customer`
3. Click "Create Account"
4. Navigate to "Login"
5. Enter credentials:
   - Email: `john@example.com`
   - Password: `Test@123`
6. Click "Sign In"
7. ✅ Should redirect to home page with navbar showing logout option

### Scenario 2: Book a Ride (Customer)
1. After login, click "Book a Ride" in navbar or hero section
2. Select vehicle type:
   - Try: Bike (30 base fare)
   - Try: Car (50 base fare)
   - Try: Scooter
3. Select rental type:
   - Driver-Operated (default)
   - Self-Drive
4. Enter locations:
   - Pickup: "Downtown Station"
   - Dropoff: "Airport"
5. Enter distance: `25` km
6. Enter duration: `35` minutes
7. ✅ Fare should calculate as: 30 + (25 × 7) + (35 × 1) = 245 (for bike)
8. Click "Continue to Payment"

### Scenario 3: Select Payment Method
1. On payment page, try different payment options:
   - Credit Card 💳
   - Digital Wallet 📱
   - Bank Transfer 🏦
   - Cash 💵
2. Click "Pay Now"
3. ✅ Should show success confirmation

### Scenario 4: View Ride History
1. Navigate to "History" in navbar or dashboard
2. ✅ Should show list of past rides with:
   - Pickup/Dropoff locations
   - Distance, Duration, Fare
   - Driver name & rating
   - Date of ride
3. Try filtering by:
   - All rides
   - Last week
   - Last month
4. ✅ Stats card should show:
   - Total Rides: 23
   - Total Distance: 450 km
   - Total Spent: ₹8,450

### Scenario 5: Submit a Review
1. Navigate to "Reviews" in navbar
2. Rate your experience with stars (1-5)
3. Add comment in textarea
4. Click "Submit Review"
5. ✅ Review should appear in "Your Reviews" section below

### Scenario 6: Customer Dashboard
1. Navigate to "Dashboard" in navbar
2. ✅ Should display:
   - User profile card with avatar & stats
   - Total Rides: 23
   - Total Spent: ₹8,450
   - Rating: 4.8 ⭐
   - Member Since: 1 year
3. Click quick action buttons:
   - "Book a Ride" → Goes to /booking
   - "Ride History" → Goes to /history
   - "Wallet & Payments" → Goes to /payment

### Scenario 7: Live Tracking
1. After booking a ride, click "View Tracking"
2. ✅ Should show:
   - Map placeholder with booking ID
   - Route information (pickup/dropoff)
   - Driver info card with avatar & rating
   - Call driver button
   - Cancel ride button
3. Route should show:
   - Green dot for pickup
   - Red dot for dropoff
   - Connected line showing route

### Scenario 8: Driver Registration & Dashboard
1. Register as a driver:
   - Name: `Rajesh Kumar`
   - Email: `driver@example.com`
   - Phone: `9999999999`
   - Password: `Driver@123`
   - Role: Select `Driver`
2. Navigate to driver dashboard
3. ✅ Should show:
   - On/Off duty toggle (initially off)
   - Today's Earnings: ₹1,850
   - Week's Earnings: ₹9,250
   - Month's Earnings: ₹35,400
   - Trips Completed: 142
4. Click "On Duty" button
5. ✅ Should toggle to green "🟢 On Duty"
6. ✅ Should show incoming ride requests with:
   - Passenger name & rating
   - Pickup/Dropoff locations
   - Distance & estimated fare
   - Accept/Decline buttons

### Scenario 9: Admin Registration & Dashboard
1. Register as admin:
   - Name: `Admin User`
   - Email: `admin@example.com`
   - Phone: `8888888888`
   - Password: `Admin@123`
   - Role: Select `Admin`
2. Navigate to admin dashboard
3. ✅ Should display:
   - Total Users: 2,345
   - Total Bookings: 8,921
   - Total Revenue: ₹42,50,000
   - Pending Approvals: 12
4. ✅ Should show sections for:
   - Pending Driver Approvals (with approve/reject buttons)
   - Pending Vehicle Approvals (with approve/reject buttons)

### Scenario 10: Responsive Design
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different breakpoints:
   - Mobile (375px) ✅
   - Tablet (768px) ✅
   - Desktop (1024px+) ✅
4. ✅ All layouts should be responsive and functional

## 🧩 Component Testing

### NavBar Component
- ✅ Logo visible on all pages
- ✅ Navigation links change based on auth state
- ✅ Mobile menu toggle works
- ✅ Logout button appears when logged in
- ✅ Dashboard link shows for appropriate roles

### HomePage Component
- ✅ Hero section with animated gradient
- ✅ 6 Feature cards with hover effects
- ✅ How-it-works section with 4 steps
- ✅ CTA section with "Book Now" button
- ✅ All animations smooth and no jank

### Forms
- ✅ Input validation working
- ✅ Error messages display correctly
- ✅ Form submission creates data
- ✅ Loading states show during submission
- ✅ Success messages display after submission

### Cards & Modals
- ✅ Cards have proper shadows
- ✅ Hover effects work smoothly
- ✅ Animations don't cause layout shift
- ✅ Text is readable with proper contrast

## 📊 Fare Calculation Testing

Test the fare calculator with different inputs:

```
Bike (₹30 base, ₹7/km, ₹1/min):
- 10 km, 15 min = 30 + (10×7) + (15×1) = 115 ✅

Car (₹50 base, ₹12/km, ₹2/min):
- 20 km, 30 min = 50 + (20×12) + (30×2) = 290 ✅
- With surge (1.2x) = 348 ✅

Scooter (₹40 base, ₹5/km, ₹0.5/min):
- 5 km, 10 min = 40 + (5×5) + (10×0.5) = 75 ✅
```

## 🐛 Common Issues & Solutions

### Issue: Blank page on load
**Solution**: Check browser console for errors. Ensure backend is running.

### Issue: "Cannot read property 'token' of undefined"
**Solution**: Clear localStorage and re-login. Check Zustand store initialization.

### Issue: API calls returning 401
**Solution**: JWT token expired. Log out and log back in.

### Issue: Styles not loading
**Solution**: Clear browser cache and rebuild:
```bash
npm run dev
```

### Issue: Images/Icons not showing
**Solution**: Use Lucide React icons (already imported) or emojis.

## ✅ Checklist Before Production

- [ ] All pages load without errors
- [ ] Forms validate inputs correctly
- [ ] API calls complete successfully
- [ ] JWT authentication works
- [ ] Role-based access control works
- [ ] Animations are smooth
- [ ] Responsive design works on all devices
- [ ] Error handling shows user-friendly messages
- [ ] Loading states appear during async operations
- [ ] Console has no errors or warnings
- [ ] All routes are accessible
- [ ] Navigation links work correctly
- [ ] Logout clears session properly

## 🎬 Demo Flows

### Complete User Journey
1. Register as customer → 2. Login → 3. Book ride → 4. Select payment → 5. View tracking → 6. View history → 7. Submit review → 8. Dashboard

### Complete Driver Journey
1. Register as driver → 2. Login → 3. Go to dashboard → 4. Toggle on duty → 5. Accept ride requests → 6. View earnings

### Complete Admin Journey
1. Register as admin → 2. Login → 3. Go to dashboard → 4. View approvals → 5. Approve/reject drivers → 6. Approve/reject vehicles

## 📞 Need Help?

Refer to:
- Frontend component source code
- Backend API documentation in `backend/README.md`
- Zustand store implementation in `src/store/index.js`
- API service implementation in `src/services/api.js`
