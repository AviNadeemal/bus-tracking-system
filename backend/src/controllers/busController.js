import Bus from '../models/Bus.js';
import LocationRecord from '../models/LocationRecord.js';

export async function createBus(req, res) {
  const { regNo, capacity, operator, routeId } = req.body;
  try {
    const bus = new Bus({ regNo, capacity, operator, currentRoute: routeId });
    await bus.save();
    res.status(201).json(bus);
  } catch (err) {
    res.status(400).json({ message: 'Error creating bus', error: err.message });
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
    // Fetch historical location records
    const recs = await LocationRecord.find(q).sort({ recordedAt: 1 }).limit(Number(limit)).lean();
    res.json(recs);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bus locations' });
  }
}