/**
 * Seed script: inserts sample self-drive vehicles into MongoDB.
 * Run with: node src/scripts/seedVehicles.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/goto-cab';

const vehicles = [
    // ── BIKES ──────────────────────────────────────────────────────────────────
    {
        vehicleType: 'bike', brand: 'Royal Enfield', model: 'Classic 350',
        year: 2023, seatCapacity: 2, licensePlate: 'DL01AB1234',
        rentalType: 'self-drive', pricePerHour: 80, pricePerDay: 600,
        isAvailable: true, isActive: true, rating: 4.5, totalRides: 42,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
    },
    {
        vehicleType: 'bike', brand: 'Honda', model: 'CB Shine',
        year: 2022, seatCapacity: 2, licensePlate: 'MH02CD5678',
        rentalType: 'self-drive', pricePerHour: 50, pricePerDay: 350,
        isAvailable: true, isActive: true, rating: 4.2, totalRides: 78,
        location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
    },
    {
        vehicleType: 'bike', brand: 'Bajaj', model: 'Pulsar 150',
        year: 2023, seatCapacity: 2, licensePlate: 'KA03EF9012',
        rentalType: 'self-drive', pricePerHour: 55, pricePerDay: 380,
        isAvailable: true, isActive: true, rating: 4.3, totalRides: 55,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
    },
    // ── SCOOTERS ───────────────────────────────────────────────────────────────
    {
        vehicleType: 'scooter', brand: 'Honda', model: 'Activa 6G',
        year: 2023, seatCapacity: 2, licensePlate: 'TN04GH3456',
        rentalType: 'self-drive', pricePerHour: 45, pricePerDay: 300,
        isAvailable: true, isActive: true, rating: 4.6, totalRides: 120,
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // Chennai
    },
    {
        vehicleType: 'scooter', brand: 'TVS', model: 'Jupiter',
        year: 2022, seatCapacity: 2, licensePlate: 'GJ05IJ7890',
        rentalType: 'self-drive', pricePerHour: 40, pricePerDay: 280,
        isAvailable: true, isActive: true, rating: 4.1, totalRides: 89,
        location: { type: 'Point', coordinates: [72.5714, 23.0225] }, // Ahmedabad
    },
    {
        vehicleType: 'scooter', brand: 'Ola', model: 'S1 Pro (Electric)',
        year: 2023, seatCapacity: 2, licensePlate: 'DL06KL2345',
        rentalType: 'self-drive', pricePerHour: 60, pricePerDay: 420,
        isAvailable: true, isActive: true, rating: 4.7, totalRides: 34,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
    },
    // ── CARS ───────────────────────────────────────────────────────────────────
    {
        vehicleType: 'car', brand: 'Maruti Suzuki', model: 'Swift',
        year: 2022, seatCapacity: 5, licensePlate: 'MH07MN6789',
        rentalType: 'self-drive', pricePerHour: 150, pricePerDay: 1200,
        isAvailable: true, isActive: true, rating: 4.4, totalRides: 67,
        location: { type: 'Point', coordinates: [72.8777, 19.0760] }, // Mumbai
    },
    {
        vehicleType: 'car', brand: 'Hyundai', model: 'i20',
        year: 2023, seatCapacity: 5, licensePlate: 'KA08OP0123',
        rentalType: 'self-drive', pricePerHour: 160, pricePerDay: 1300,
        isAvailable: true, isActive: true, rating: 4.5, totalRides: 45,
        location: { type: 'Point', coordinates: [77.5946, 12.9716] }, // Bangalore
    },
    {
        vehicleType: 'car', brand: 'Tata', model: 'Nexon',
        year: 2023, seatCapacity: 5, licensePlate: 'DL09QR4567',
        rentalType: 'self-drive', pricePerHour: 180, pricePerDay: 1500,
        isAvailable: true, isActive: true, rating: 4.6, totalRides: 38,
        location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Delhi
    },
    {
        vehicleType: 'car', brand: 'Mahindra', model: 'XUV300',
        year: 2022, seatCapacity: 5, licensePlate: 'TN10ST8901',
        rentalType: 'self-drive', pricePerHour: 200, pricePerDay: 1800,
        isAvailable: true, isActive: true, rating: 4.3, totalRides: 29,
        location: { type: 'Point', coordinates: [80.2707, 13.0827] }, // Chennai
    },
    {
        vehicleType: 'car', brand: 'Toyota', model: 'Innova Crysta',
        year: 2022, seatCapacity: 7, licensePlate: 'GJ11UV2345',
        rentalType: 'self-drive', pricePerHour: 250, pricePerDay: 2200,
        isAvailable: true, isActive: true, rating: 4.8, totalRides: 22,
        location: { type: 'Point', coordinates: [72.5714, 23.0225] }, // Ahmedabad
    },
    {
        vehicleType: 'car', brand: 'Kia', model: 'Seltos',
        year: 2023, seatCapacity: 5, licensePlate: 'MH12WX6789',
        rentalType: 'self-drive', pricePerHour: 220, pricePerDay: 1900,
        isAvailable: true, isActive: true, rating: 4.7, totalRides: 18,
        location: { type: 'Point', coordinates: [73.8567, 18.5204] }, // Pune
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB:', MONGO_URI);

        // Remove existing self-drive vehicles
        const deleted = await Vehicle.deleteMany({ rentalType: 'self-drive' });
        console.log(`🗑️  Removed ${deleted.deletedCount} existing self-drive vehicles`);

        // Insert new vehicles
        const inserted = await Vehicle.insertMany(vehicles);
        console.log(`🚗 Inserted ${inserted.length} vehicles:`);
        inserted.forEach(v => console.log(`   • ${v.brand} ${v.model} (${v.vehicleType}) — ₹${v.pricePerDay}/day`));

        console.log('\n✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
        process.exit(1);
    }
}

seed();
