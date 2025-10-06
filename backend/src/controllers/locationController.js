import Bus from '../models/Bus.js';
import LocationRecord from '../models/LocationRecord.js';
import { io } from '../server.js'; 

// POST /api/buses/:id/location
export async function postLocation(req, res) {
  const busId = req.params.id;
  // GeoJSON stores coordinates as [lon, lat]
  const { lat, lon, speed, heading, recordedAt } = req.body; 
  
  try {
    const bus = await Bus.findById(busId);
    if (!bus) return res.status(404).json({ message: 'Bus not found' });

    const routeId = bus.currentRoute || null;
    const tripId = bus.currentTrip || null;

    //historical record
    const rec = new LocationRecord({
      bus: bus._id,
      route: routeId,
      trip: tripId,
      location: { type: 'Point', coordinates: [lon, lat] },
      speed,
      heading,
      recordedAt: recordedAt ? new Date(recordedAt) : new Date()
    });
    await rec.save();

    //Update bus last location
    bus.lastLocation = { type: 'Point', coordinates: [lon, lat] };
    bus.lastSeenAt = new Date();
    await bus.save();

    //Broadcast via Socket.IO
    const payload = {
      busId: bus._id.toString(),
      regNo: bus.regNo,
      lat,
      lon,
      speed: speed || 0,
      heading: heading || 0,
      recordedAt: rec.recordedAt
    };

    //Broadcast to route-specific room
    if (routeId) {
      io.to(`route_${routeId}`).emit('locationUpdate', payload);
    }
    // Broadcast to the general all room
    io.to('all').emit('locationUpdate', payload);

    res.status(201).json({ ok: true, rec });
  } catch (err) {
    res.status(500).json({ message: 'Error processing location update', error: err.message });
  }
}

// GET /api/map/active-buses
export async function getActiveBuses(req, res) {

  // Return the latest positions for all buses 
  try {
    const buses = await Bus.find().select('_id regNo lastSeenAt lastLocation currentRoute').lean();
    
    // Transform data for map consumption
    const transformed = buses.map(b => ({
      _id: b._id,
      regNo: b.regNo,
      lastSeenAt: b.lastSeenAt,
      routeId: b.currentRoute,
      lat: b.lastLocation?.coordinates[1], 
      lon: b.lastLocation?.coordinates[0] 
    }));
    
    res.json(transformed);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching active buses' });
  }
}