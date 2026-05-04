const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found. Token invalid.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden. Insufficient permissions.' });
    }
    next();
  };
};

const checkProjectRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      const { ProjectMember } = require('../models');
      const projectId = req.params.id || req.params.projectId || req.body.projectId;

      const membership = await ProjectMember.findOne({
        where: { userId: req.user.id, projectId },
      });

      if (!membership) {
        return res.status(403).json({ message: 'You are not a member of this project.' });
      }

      if (requiredRoles && !requiredRoles.includes(membership.role)) {
        return res.status(403).json({ message: 'Insufficient project permissions.' });
      }

      req.projectMembership = membership;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { verifyToken, checkRole, checkProjectRole };
