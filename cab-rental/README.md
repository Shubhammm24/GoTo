<div align="center">
  <h1 align="center">🚗 GoTo Cab Rental Platform</h1>
  
  <p align="center">
    <strong>A complete, real-time MERN stack ride-hailing application</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-18.x-blue?style=flat-square&logo=react" alt="React 18" />
    <img src="https://img.shields.io/badge/Node.js-Express-forestgreen?style=flat-square&logo=node.js" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-Mongoose-success?style=flat-square&logo=mongodb" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Socket.io-Real--Time-black?style=flat-square&logo=socket.io" alt="Socket.io" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  </p>
</div>

---

## ✨ Overview

**GoTo** is a production-ready, full-stack cab rental and tracking platform aiming to seamlessly connect customers with drivers in real-time. Built around a robust, Event-Driven WebSocket architecture and MongoDB Geospatial routing, this application actively manages dynamic driver matching, live GPS tracking, exact route pricing, and secure role-based access.

---

## 🚀 Key Features & Highlights

- **Near-Instant Ride Matching:** Utilizes WebSocket architecture (`Socket.io`) and MongoDB's `$near` 2dsphere index to auto-assign the closest active drivers to a customer within milliseconds.
- **Live GPS Tracking:** Customers can view the driver's exact location dynamically updating on an interactive map.
- **Dynamic Fare Calculation:** Integrating Google Maps Distance Matrix API exclusively on the backend to avoid client-side tampering, instantly calculating base rates per meter.
- **Robust Role-Based Security:** Features completely segmented dashboards and private routes for `Customers`, `Drivers`, and `Administrators`, secured strictly by JWTs and HttpOnly cookies.
- **Enterprise-Grade Payments:** Razorpay integration allowing seamless checkout via Cards, Wallets, UPI, or Cash-On-Delivery. Utilizes backend cryptographic Webhooks to prevent transaction spoofing.
- **Multi-Factor Authentication (MFA):** Mandatory OTP verification via SMS (Twilio) and Email (Nodemailer/SMTP) before account activation.

---

## 🛠️ Architecture & Tech Stack

### Client-Side (Frontend)
*   **Core:** React 18, Vite (for optimized HMR and fast builds)
*   **State Management:** Zustand (lightweight global state across multiple flows)
*   **Styling & UI:** Tailwind CSS, Framer Motion (for smooth micro-interactions)
*   **Maps & Routing:** Leaflet / Google Maps integration

### Server-Side (Backend)
*   **Core API:** Node.js, Express.js
*   **Database:** MongoDB via Mongoose ORM
*   **Real-time Engine:** Socket.io
*   **Authentication & Security:** JWT (JSON Web Tokens), `bcryptjs`, Node `crypto` module

### Third-Party APIs
*   **Google Maps API** (Geocoding & Distance Matrices)
*   **Razorpay SDK** (Payment Gateway)
*   **Twilio** (SMS Gateway)
*   **Nodemailer** (SMTP Emissary)

---

## 📦 Quick Start & Installation

Getting the platform running locally is straightforward.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/GoTo-Cab-Rental.git
cd GoTo-Cab-Rental
```

### 2. Backend Setup
Navigate into the backend directory and install the necessary dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the root of the `backend` directory. *(Replace placeholders with your actual API keys)*:
```env
# Application
PORT=5000
NODE_ENV=development

# Database & Auth
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_strong_secret

# External APIs
GOOGLE_MAPS_API_KEY=your_google_maps_key
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# OTP Integrations
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=your_twilio_phone

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the root of the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_RAZORPAY_KEY_ID=your_razorpay_id
```

Start the Vite development server:
```bash
npm run dev
```

The application will now be running on `http://localhost:5173`.

---

## 📖 Testing Accounts

To skip the live OTP verification step and test the core application immediately, use the hardcoded seed accounts:

| Role        | Email                  | Password      |
| ----------- | ---------------------- | ------------- |
| **Customer**| `customer@example.com` | `Customer@123`|
| **Driver**  | `driver@example.com`   | `Driver@123`  |
| **Admin**   | `admin@example.com`    | `Admin@123`   |

*(We recommend logging into the Customer and Driver accounts simultaneously across two different browsers or Incognito mode to witness the real-time WebSocket matching functionality!)*

---

## 🤝 Contributing
Contributions, issues, and feature requests are heartily welcome! 

## 📝 License
This project is [MIT](https://choosealicense.com/licenses/mit/) licensed.
