const jwt = require('jsonwebtoken');

const JWT_SECRET = 'my_super_simple_secret_key_123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please login first.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = { authMiddleware, JWT_SECRET };

