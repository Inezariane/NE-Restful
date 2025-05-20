const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (!token) {
        throw new Error('Authentication required');
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        throw new Error('Access denied');
      }

      next();
    } catch (error) {
      logger.error(`Auth error: ${error.message}`);
      res.status(401).json({ error: error.message });
    }
  };
};

module.exports = auth;