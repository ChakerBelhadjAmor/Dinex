const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'flousna-hackathon-secret-2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token invalide' });
  }
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

module.exports = { authenticateToken, generateToken, JWT_SECRET };
