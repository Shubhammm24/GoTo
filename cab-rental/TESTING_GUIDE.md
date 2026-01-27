# 🧪 QUICK TESTING GUIDE

## ✅ Server is Running on Port 5000

```
✅ MongoDB Connected Successfully
🚀 Server running on port 5000
```

---

## 🛠️ TEST THE ENDPOINTS

Use **Postman** or **Insomnia** to test these endpoints:

### 1. **Register User**
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "password123",
  "role": "customer"
}
```

**Expected Response (201):**
```json
{
  "message": "Registered successfully",
  "userId": "..."
}
```

---

### 2. **Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "name": "John Doe",
    "role": "customer"
  }
}
```

**Save the token for next requests!**

---

### 3. **Get User Profile** (Protected)
```http
GET http://localhost:5000/api/users/me
Authorization: Bearer <YOUR_TOKEN_HERE>
```

**Expected Response (200):**
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "role": "customer"
  // ... other fields
}
```

---

### 4. **Create Booking** (Customer Only)
```http
POST http://localhost:5000/api/bookings
Authorization: Bearer <YOUR_TOKEN_HERE>
Content-Type: application/json

{
  "estimatedDistance": 15.5,
  "estimatedDuration": 25,
  "vehicleType": "car",
  "pickupLocation": {
    "address": "123 Main St, City",
    "coordinates": [72.8479, 19.0176]
  },
  "dropoffLocation": {
    "address": "456 Park Ave, City",
    "coordinates": [72.8500, 19.0200]
  },
  "rentalType": "driver-operated"
}
```

**Expected Response (201):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "_id": "...",
    "customerId": "...",
    "baseFare": 50,
    "distanceFare": 186,
    "timeFare": 50,
    "surgePricing": 1.2,
    "totalAmount": 341.2,
    "status": "requested",
    "paymentStatus": "pending"
  }
}
```

---

### 5. **Create Payment**
```http
POST http://localhost:5000/api/payments
Authorization: Bearer <YOUR_TOKEN_HERE>
Content-Type: application/json

{
  "bookingId": "<BOOKING_ID_FROM_STEP_4>",
  "amount": 341.2,
  "paymentMethod": "credit_card"
}
```

**Expected Response (201):**
```json
{
  "message": "Payment created successfully",
  "payment": {
    "_id": "...",
    "bookingId": "...",
    "amount": 341.2,
    "paymentMethod": "credit_card",
    "status": "pending"
  }
}
```

---

### 6. **Add Review** (After Booking)
```http
POST http://localhost:5000/api/reviews
Authorization: Bearer <YOUR_TOKEN_HERE>
Content-Type: application/json

{
  "vehicleId": "<VEHICLE_ID>",
  "rating": 5,
  "comment": "Excellent ride! Very clean vehicle."
}
```

**Expected Response (201):**
```json
{
  "message": "Review added successfully",
  "review": {
    "_id": "...",
    "vehicleId": "...",
    "rating": 5,
    "comment": "Excellent ride! Very clean vehicle.",
    "reviewerId": "..."
  }
}
```

---

## ❌ TEST ERROR HANDLING

### 1. **Missing Token** (Should return 401)
```http
GET http://localhost:5000/api/users/me
```

**Expected Response (401):**
```json
{
  "message": "No token provided"
}
```

---

### 2. **Invalid Token** (Should return 401)
```http
GET http://localhost:5000/api/users/me
Authorization: Bearer invalid_token_here
```

**Expected Response (401):**
```json
{
  "message": "Invalid token"
}
```

---

### 3. **Role-Based Access** (Should return 403)
First, register as a "customer", then try:

```http
GET http://localhost:5000/api/admin/dashboard
Authorization: Bearer <CUSTOMER_TOKEN>
```

**Expected Response (403):**
```json
{
  "message": "Unauthorized - insufficient permissions"
}
```

---

### 4. **Missing Required Fields** (Should return 400)
```http
POST http://localhost:5000/api/bookings
Authorization: Bearer <YOUR_TOKEN_HERE>
Content-Type: application/json

{
  "estimatedDistance": 15.5
  // Missing other required fields
}
```

**Expected Response (400):**
```json
{
  "message": "Missing required booking fields"
}
```

---

### 5. **Non-existent Resource** (Should return 404)
```http
GET http://localhost:5000/api/bookings/invalid_id/complete
Authorization: Bearer <YOUR_TOKEN_HERE>
```

**Expected Response (404):**
```json
{
  "message": "Booking not found"
}
```

---

## ✅ TEST CHECKLIST

- [ ] Register user successfully
- [ ] Login and get token
- [ ] Access protected route with token
- [ ] Try accessing protected route without token → 401
- [ ] Try accessing admin route as customer → 403
- [ ] Create booking with all required fields → 201
- [ ] Create booking with missing fields → 400
- [ ] Create payment successfully
- [ ] Add review with valid rating (1-5) → 201
- [ ] Add review with rating > 5 → 400
- [ ] Test error messages are descriptive
- [ ] All responses have proper HTTP status codes

---

## 🐛 TROUBLESHOOTING

### Port 5000 Already in Use
```powershell
netstat -ano | Select-String ":5000"
taskkill /PID <PID> /F
```

### MongoDB Not Connected
- Check `.env` has `MONGO_URI`
- Verify MongoDB is running
- Check connection string is valid

### CORS Errors in Frontend
- Update `frontend/.env`: `VITE_API_URL=http://localhost:5000/api`
- Or set `CORS_ORIGIN=http://localhost:3000` in backend `.env`

### JWT Token Expired
- Token expires in 7 days
- Login again to get new token

---

## 📝 ENVIRONMENT VARIABLES

Check your `backend/.env` file has:
```env
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:3000
GOOGLE_MAPS_API_KEY=your_api_key
```

---

## 🚀 WHAT'S NEXT?

1. ✅ Test all endpoints from this guide
2. ✅ Verify error handling works
3. ✅ Check response formats are consistent
4. ⬜ Connect frontend to backend
5. ⬜ Test real-time features with Socket.io
6. ⬜ Complete payment gateway integration

---

**Backend is ready for testing! Start with the endpoints above.**
