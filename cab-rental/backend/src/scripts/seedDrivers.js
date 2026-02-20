/**
 * Seed script: creates dummy driver Users + Driver profiles for testing.
 * Run with:  node src/scripts/seedDrivers.js
 *
 * Creates 8 drivers (4 car, 2 bike, 2 scooter / parcel).
 * All use password: driver123  |  All start on-duty and approved.
 *
 * Re-running the script is safe — it deletes the old dummy drivers first.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Driver = require('../models/Driver');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/goto-cab';

// Email domain used to identify all dummy drivers
const DUMMY_DOMAIN = '@dummydriver.goto.test';

const DUMMY_PASSWORD = 'driver123';

const dummyDrivers = [
    // ── CAR DRIVERS ────────────────────────────────────────────
    {
        name: 'Rajesh Kumar', phone: '9100000001', email: `rajesh${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'car', brand: 'Maruti Suzuki', model: 'Swift Dzire', licensePlate: 'DL01AB1001', color: 'White', year: 2023 },
        license: 'DL-0420230001', experience: 5, rating: 4.7, completedRides: 312,
        coords: [77.2090, 28.6139], // Delhi
    },
    {
        name: 'Amit Sharma', phone: '9100000002', email: `amit${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'car', brand: 'Hyundai', model: 'Grand i10 Nios', licensePlate: 'MH02CD2002', color: 'Silver', year: 2022 },
        license: 'MH-0420220002', experience: 3, rating: 4.5, completedRides: 187,
        coords: [72.8777, 19.0760], // Mumbai
    },
    {
        name: 'Suresh Reddy', phone: '9100000003', email: `suresh${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'car', brand: 'Toyota', model: 'Innova Crysta', licensePlate: 'KA03EF3003', color: 'Grey', year: 2023 },
        license: 'KA-0420230003', experience: 7, rating: 4.9, completedRides: 524,
        coords: [77.5946, 12.9716], // Bangalore
    },
    {
        name: 'Priya Singh', phone: '9100000004', email: `priya${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'car', brand: 'Tata', model: 'Nexon', licensePlate: 'TN04GH4004', color: 'Blue', year: 2024 },
        license: 'TN-0420240004', experience: 2, rating: 4.3, completedRides: 98,
        coords: [80.2707, 13.0827], // Chennai
    },

    // ── BIKE DRIVERS ───────────────────────────────────────────
    {
        name: 'Vikram Yadav', phone: '9100000005', email: `vikram${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'bike', brand: 'Royal Enfield', model: 'Classic 350', licensePlate: 'DL05IJ5005', color: 'Black', year: 2023 },
        license: 'DL-0420230005', experience: 4, rating: 4.6, completedRides: 245,
        coords: [77.2090, 28.6139], // Delhi
    },
    {
        name: 'Arun Patel', phone: '9100000006', email: `arun${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'bike', brand: 'Bajaj', model: 'Pulsar 150', licensePlate: 'GJ06KL6006', color: 'Red', year: 2022 },
        license: 'GJ-0420220006', experience: 3, rating: 4.4, completedRides: 178,
        coords: [72.5714, 23.0225], // Ahmedabad
    },

    // ── SCOOTER / PARCEL DRIVERS ───────────────────────────────
    {
        name: 'Deepak Chauhan', phone: '9100000007', email: `deepak${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'scooter', brand: 'Honda', model: 'Activa 6G', licensePlate: 'MH07MN7007', color: 'White', year: 2023 },
        license: 'MH-0420230007', experience: 2, rating: 4.2, completedRides: 156,
        coords: [72.8777, 19.0760], // Mumbai
    },
    {
        name: 'Kavita Nair', phone: '9100000008', email: `kavita${DUMMY_DOMAIN}`,
        vehicle: { vehicleType: 'scooter', brand: 'TVS', model: 'Jupiter', licensePlate: 'KA08OP8008', color: 'Grey', year: 2022 },
        license: 'KA-0420220008', experience: 3, rating: 4.5, completedRides: 203,
        coords: [77.5946, 12.9716], // Bangalore
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB:', MONGO_URI);

        const hash = await bcrypt.hash(DUMMY_PASSWORD, 10);

        // 1. Remove old dummy users + drivers
        const oldUsers = await User.find({ email: { $regex: DUMMY_DOMAIN.replace('.', '\\.') } });
        const oldUserIds = oldUsers.map(u => u._id);
        if (oldUserIds.length) {
            await Driver.deleteMany({ userId: { $in: oldUserIds } });
            await User.deleteMany({ _id: { $in: oldUserIds } });
            console.log(`🗑️  Removed ${oldUserIds.length} old dummy drivers`);
        }

        // 2. Create new users + driver profiles
        for (const d of dummyDrivers) {
            const user = await User.create({
                name: d.name,
                email: d.email,
                phone: d.phone,
                password: hash,
                role: 'driver',
                isVerified: true,
                rating: d.rating,
            });

            await Driver.create({
                userId: user._id,
                licenseNumber: d.license,
                licenseExpiry: new Date('2030-12-31'),
                backgroundCheck: true,
                backgroundCheckDate: new Date(),
                vehicleDetails: d.vehicle,
                currentLocation: {
                    type: 'Point',
                    coordinates: d.coords, // [lng, lat]
                },
                isOnDuty: true,
                isActive: true,
                isApproved: true,
                rating: d.rating,
                completedRides: d.completedRides,
                bankDetails: {
                    accountNumber: '00000000' + d.phone.slice(-4),
                    ifsc: 'DUMMY0001234',
                    accountName: d.name,
                },
            });

            console.log(`   ✅ ${d.name}  •  ${d.vehicle.vehicleType} (${d.vehicle.brand} ${d.vehicle.model})  •  📍 [${d.coords}]`);
        }

        console.log(`\n🎉 Seeded ${dummyDrivers.length} dummy drivers! (password: ${DUMMY_PASSWORD})`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
