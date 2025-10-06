import Route from '../models/Route.js';
import Stop from '../models/Stop.js';

export async function createRoute(req, res) {
  const { name, code, description } = req.body;
  try {
    const route = new Route({ name, code, description });
    await route.save();
    res.status(201).json(route);
  } catch (err) {
    res.status(400).json({ message: 'Error creating route', error: err.message });
  }
}

export async function listRoutes(req, res) {
  try {
    // Populate stops to see the full route structure
    const routes = await Route.find().populate('stops').lean();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching routes' });
  }
}

export async function getRoute(req, res) {
  try {
    const route = await Route.findById(req.params.id).populate('stops');
    if (!route) return res.status(404).json({ message: 'Route not found' });
    res.json(route);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching route' });
  }
}

export async function addStop(req, res) {
  const { name, order, lon, lat } = req.body;
  try {
    const route = await Route.findById(req.params.routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });
    
    // Create the new Stop document
    const stop = new Stop({
      route: route._id,
      name,
      order,
      location: { type: 'Point', coordinates: [lon, lat] } // GeoJSON format
    });
    await stop.save();
    
    // Link the stop to the route
    route.stops.push(stop._id);
    await route.save();
    
    res.status(201).json(stop);
  } catch (err) {
    res.status(400).json({ message: 'Error adding stop', error: err.message });
  }
}