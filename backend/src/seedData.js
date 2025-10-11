import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt'; 
dotenv.config();

import Route from './models/Route.js';
import Stop from './models/Stop.js';
import Bus from './models/Bus.js';
import Trip from './models/Trip.js';
import User from './models/User.js'; 

const MONGO_URI = process.env.MONGO_URI;

// Admin User Setup
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password123'; 

// Sample routes based on Sri Lankan cities
const sampleRoutes = [
  { name: 'Colombo → Kandy', code: 'CMB-KDY', stops: [
    { name: 'Colombo Fort', lon: 79.8612, lat: 6.9319 },
    { name: 'Kegalle', lon: 80.3396, lat: 7.2590 },
    { name: 'Kandy', lon: 80.6337, lat: 7.2906 }
  ]},
  { name: 'Colombo → Galle', code: 'CMB-GL', stops: [
    { name: 'Colombo Fort', lon: 79.8612, lat: 6.9319 },
    { name: 'Beruwala', lon: 79.9845, lat: 6.4651 },
    { name: 'Galle', lon: 80.2167, lat: 6.0535 }
  ]},
  { name: 'Colombo → Badulla', code: 'CMB-BDL', stops: [
    { name: 'Colombo Fort', lon: 79.8612, lat: 6.9319 },
    { name: 'Nuwara Eliya', lon: 80.7718, lat: 6.9497 },
    { name: 'Badulla', lon: 81.0589, lat: 6.9841 }
  ]},
  { name: 'Colombo → Jaffna', code: 'CMB-JFN', stops: [
    { name: 'Colombo Fort', lon: 79.8612, lat: 6.9319 },
    { name: 'Vavuniya', lon: 80.5000, lat: 8.7500 },
    { name: 'Jaffna', lon: 79.7036, lat: 9.6615 }
  ]},
  { name: 'Colombo → Batticaloa', code: 'CMB-BTCL', stops: [
    { name: 'Colombo Fort', lon: 79.8612, lat: 6.9319 },
    { name: 'Polonnaruwa', lon: 81.0000, lat: 7.9400 },
    { name: 'Batticaloa', lon: 81.7016, lat: 7.7191 }
  ]}
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for seeding.');

  console.log('Cleaning up existing data...');
  await Route.deleteMany({});
  await Stop.deleteMany({});
  await Bus.deleteMany({});
  await Trip.deleteMany({});
  await User.deleteMany({});


  console.log('Creating admin user...');
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const adminUser = new User({ 
    username: ADMIN_USERNAME, 
    passwordHash: passwordHash, 
    role: 'admin' 
  });
  await adminUser.save();
  console.log(`Admin user created: ${ADMIN_USERNAME}`);
  

  console.log('Creating 5 routes and their stops...');
  const createdRoutes = [];
  for (const r of sampleRoutes) {
    const route = new Route({ name: r.name, code: r.code, description: r.name });
    await route.save();
    for (let i = 0; i < r.stops.length; i++) {
      const s = r.stops[i];
      const stop = new Stop({
        route: route._id,
        name: s.name,
        order: i + 1,
        location: { type: 'Point', coordinates: [s.lon, s.lat] }
      });
      await stop.save();
      route.stops.push(stop._id);
    }
    await route.save();
    createdRoutes.push(route);
  }

  // Create Buses 
  console.log('Creating 25 buses...');
  const buses = [];
  let idx = 0;
  for (let i = 0; i < 25; i++) {
    const r = createdRoutes[idx % createdRoutes.length];
    const initialLocation = r.stops && r.stops.length ? 
        (await Stop.findById(r.stops[0])).location : 
        { type: 'Point', coordinates: [79.8612, 6.9319] }; 
        
    const bus = new Bus({
      regNo: `BUS-${1000 + i}`,
      capacity: 50,
      operator: 'DemoOperator',
      currentRoute: r._id,
      lastLocation: initialLocation
    });
    await bus.save();
    buses.push(bus);
    idx++;
  }

  //Create Simple Trips for the next 7 days
  console.log('Creating scheduled trips for the next 7 days...');
  const startDate = new Date();
  for (let d = 0; d < 7; d++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + d);
    
    for (const bus of buses) {
      const trip = new Trip({
        route: bus.currentRoute,
        bus: bus._id,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 6, 0),
        endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0),
        status: 'scheduled'
      });
      await trip.save();
    }
  }

  console.log('Seed complete. Total routes:', createdRoutes.length, 'Total buses:', buses.length);
  mongoose.disconnect();
}

run().catch(err => {
  console.error('Seed script failed:', err);
  mongoose.disconnect();
  process.exit(1);
});