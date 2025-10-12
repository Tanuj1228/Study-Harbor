const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Get token from header (Format: Bearer <token>)
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adds { userId, role } to the request
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied: Admin role required' });
  }
  next();
}

module.exports = { auth, requireAdmin };