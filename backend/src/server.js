import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config();

// Import all required route modules
import authRoutes from './routes/authRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import busRoutes from './routes/busRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import locationRoutes from './routes/locationRoutes.js';

const app = express();
const server = http.createServer(app);

export const io = new IOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET','POST']
  }
});

//Middleware 
app.use(express.json()); 
app.use(helmet());
app.use(cors({ origin: '*' })); 
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 })); 
app.use(morgan('dev')); 

// API Routes 
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api', locationRoutes); 

app.get('/healthz', (req, res) => res.json({ ok: true })); // Health check endpoint

//Socket.IO Connection Handling
io.on('connection', (socket) => {
  console.log('WS client connected:', socket.id);

  // Clients can subscribe specific routes or all buses
  socket.on('subscribeRoute', (routeId) => {
    socket.join(`route_${routeId}`);
    console.log(`Client ${socket.id} subscribed to route: ${routeId}`);
  });

  socket.on('unsubscribeRoute', (routeId) => {
    socket.leave(`route_${routeId}`);
  });

  socket.on('subscribeAll', () => socket.join('all'));
  
  socket.on('disconnect', () => console.log('WS client disconnected:', socket.id));
});

//DB Connection and Server
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { })
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });