import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

//JWT authentication
export function requireAuth(req, res, next) {
  const a = req.headers.authorization;
  if (!a) return res.status(401).json({ message: 'No authorization header' });
  
  const parts = a.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Bad authorization header format' });
  
  const token = parts[1];
  
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // user payload (userId, role) to the request
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}