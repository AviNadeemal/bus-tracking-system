import express from 'express';
import { createRoute, listRoutes, getRoute, addStop } from '../controllers/routeController.js';
import { requireAuth } from '../middlewares/auth.js';
const router = express.Router();

// Public routes
router.get('/', listRoutes);
router.get('/:id', getRoute);

// Admin only routes
router.post('/', requireAuth, createRoute);
router.post('/:routeId/stops', requireAuth, addStop); // Add a stop to a route

export default router;