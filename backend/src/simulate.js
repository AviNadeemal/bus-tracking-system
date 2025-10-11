import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import Bus from './models/Bus.js';
import Stop from './models/Stop.js';
import Route from './models/Route.js';

const MONGO_URI = process.env.MONGO_URI;

const API_BASE = process.env.SIM_API_BASE || `http://localhost:${process.env.PORT || 4000}/api`;
const INTERVAL = Number(process.env.SIMULATION_INTERVAL_MS || 5000);


function lerp(a, b, t) { 
  return a + (b - a) * t; 
}

function interpolateBetweenStops(s1, s2, steps = 30) {
  // s1 and s2 are Stop documents, coordinates are [lon, lat]
  const [lon1, lat1] = s1.location.coordinates;
  const [lon2, lat2] = s2.location.coordinates;
  const arr = [];
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    arr.push({ 
      lon: lerp(lon1, lon2, t), 
      lat: lerp(lat1, lat2, t) 
    });
  }
  return arr;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Simulator connected to DB.');

  // Fetch all buses and their fully populated routes/stops
  const buses = await Bus.find().populate({ 
    path: 'currentRoute', 
    populate: { path: 'stops' } 
  }).exec();

  if (buses.length === 0) {
    console.warn('No buses found. Run npm run seed first.');
    mongoose.disconnect();
    return;
  }

  // Paths for Each Bus
  const busPaths = buses.map(bus => {
    const route = bus.currentRoute;
    const stops = route ? route.stops.sort((a, b) => a.order - b.order) : [];
    const segments = [];

    if (stops.length > 1) {

      // Forward path (Stop 1 to Stop N)
      for (let i = 0; i < stops.length - 1; i++) {
        const seg = interpolateBetweenStops(stops[i], stops[i + 1], 30);
        segments.push(...seg);
      }
      
      // Backward path (Stop N back to Stop 1)
      for (let i = stops.length - 1; i > 0; i--) {
        const seg = interpolateBetweenStops(stops[i], stops[i - 1], 30);
        segments.push(...seg);
      }
    } else {
      console.warn(`Bus ${bus.regNo} has a route with fewer than 2 stops. Skipping simulation path.`);
    }

    return { bus, routeId: route?._id.toString(), path: segments, idx: 0 };
  });

  console.log('Starting simulation loop with', busPaths.length, 'buses. Interval:', INTERVAL, 'ms.');

  //Simulation Loop 
  setInterval(async () => {
    for (const bp of busPaths) {
      if (!bp.path.length) continue;
      
      // Get the next point in the path 
      const point = bp.path[bp.idx % bp.path.length];
      bp.idx++;

      // POST location to backend API
      try {
        await axios.post(`${API_BASE}/buses/${bp.bus._id}/location`, {
          lat: point.lat,
          lon: point.lon,
          
          speed: 40 + Math.random() * 20, // 40-60 km/h
          heading: Math.floor(Math.random() * 360)
        });
      } catch (err) {
        console.error('Simulator POST error:', 
          err?.response?.data?.message || err.message || 'Unknown error');
      }
    }
  }, INTERVAL);
}

run().catch(err => {
  console.error('Simulator main error:', err);
  mongoose.disconnect();
  process.exit(1);
});