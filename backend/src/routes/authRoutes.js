import express from 'express';
import { body } from 'express-validator';
import { registerController, loginController } from '../controllers/authController.js';
const router = express.Router();

router.post('/register', [
  // validation for admin creation
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], registerController);

router.post('/login', [
  body('username').isString().notEmpty().withMessage('Username is required'),
  body('password').isString().notEmpty().withMessage('Password is required')
], loginController);

export default router;