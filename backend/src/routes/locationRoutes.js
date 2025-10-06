import express from 'express';
import { postLocation, getActiveBuses } from '../controllers/locationController.js';
import { body } from 'express-validator';
const router = express.Router();

// POST route for a bus to report its location
router.post('/buses/:id/location', [
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
], postLocation);

// GET route for the map to fetch all currently known bus positions
router.get('/map/active-buses', getActiveBuses);

export default router;