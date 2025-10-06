import express from 'express';
import { createTrip, listTrips } from '../controllers/tripController.js';
import { requireAuth } from '../middlewares/auth.js';
const router = express.Router();

// Public routes
router.get('/', listTrips);

// Admin only routes
router.post('/', requireAuth, createTrip);

export default router;