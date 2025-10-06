import express from 'express';
import { createBus, listBuses, getBus, getBusLocations } from '../controllers/busController.js';
import { requireAuth } from '../middlewares/auth.js';
const router = express.Router();

// Public routes
router.get('/', listBuses);
router.get('/:id', getBus);
router.get('/:id/locations', getBusLocations); // past locations

// Admin only routes
router.post('/', requireAuth, createBus);

export default router;