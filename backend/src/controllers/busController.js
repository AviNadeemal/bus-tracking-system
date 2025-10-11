import Bus from '../models/Bus.js';
import LocationRecord from '../models/LocationRecord.js';
import Route from '../models/Route.js'; 
import Stop from '../models/Stop.js';  

export async function createBus(req, res) {
  const { regNo, capacity, operator, routeId } = req.body;
  
  // Define a default location 
  const defaultLocation = { 
    type: 'Point', 
    coordinates: [79.8612, 6.9319] // [lon, lat] for Colombo Fort
  };

  let initialLocation = defaultLocation;

  try {
    
    if (routeId) {
      const route = await Route.findById(routeId).populate('stops');
      if (route && route.stops.length > 0) {
        // first stop
        const firstStopId = route.stops.sort((a, b) => a.order - b.order)[0]._id;
        const firstStop = await Stop.findById(firstStopId);
        
        if (firstStop && firstStop.location && firstStop.location.coordinates) {
          initialLocation = firstStop.location;
        }
      }
    }

    // the bus with the initial location
    const bus = new Bus({ 
      regNo, 
      capacity, 
      operator, 
      currentRoute: routeId, 
      lastLocation: initialLocation,
      lastSeenAt: new Date()
    });
    
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    // catches the GeoJSON validation error and other DB errors
    res.status(400).json({ 
      message: 'Error creating bus', 
      error: err.message,
      detail: "Ensure the routeId is valid and the route has at least one stop, or the default GeoJSON location is valid."
    });
  }
}

export async function listBuses(req, res) {
  try {
    const filter = {};
    if (req.query.routeId) filter.currentRoute = req.query.routeId;
    const buses = await Bus.find(filter).populate('currentRoute').lean();
    res.json(buses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching buses' });
  }
}

export async function getBus(req, res) {
  try {
    const bus = await Bus.findById(req.params.id).populate('currentRoute');
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bus details' });
  }
}

export async function getBusLocations(req, res) {
  const { id } = req.params;
  const { from, to, limit = 500 } = req.query;
  const q = { bus: id };
  
  if (from || to) q.recordedAt = {};
  if (from) q.recordedAt.$gte = new Date(from);
  if (to) q.recordedAt.$lte = new Date(to);
  
  try {

    const recs = await LocationRecord.find(q).sort({ recordedAt: 1 }).limit(Number(limit)).lean();
    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bus locations' });
  }
}