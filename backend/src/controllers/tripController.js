import Trip from '../models/Trip.js';

export async function createTrip(req, res) {
  const { routeId, busId, date, startTime, endTime } = req.body;
  try {
    const trip = new Trip({ route: routeId, bus: busId, date, startTime, endTime });
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ message: 'Error creating trip', error: err.message });
  }
}

export async function listTrips(req, res) {
  const filter = {};
  if (req.query.date) filter.date = new Date(req.query.date);
  if (req.query.routeId) filter.route = req.query.routeId;
  
  try {
    const trips = await Trip.find(filter).populate('route').populate('bus');
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trips' });
  }
}