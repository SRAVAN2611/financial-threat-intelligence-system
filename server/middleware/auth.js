import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SecurityEvent from '../models/SecurityEvent.js';

// Protect Routes (JWT Validation)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    await SecurityEvent.create({
      eventType: 'UNAUTHORIZED_API_REQUEST',
      resource: req.originalUrl,
      action: req.method,
      result: 'BLOCKED',
      severity: 'HIGH',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata: { reason: 'Missing JWT token' },
    });

    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token missing or signature invalid.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyplaceholderforsentinelai2026');
    
    let user;
    if (decoded.id) {
      user = await User.findById(decoded.id).select('-passwordHash');
    }
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-passwordHash');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: User session expired or database re-indexed. Please log in again.',
      });
    }

    if (user.status === 'suspended' || user.status === 'locked') {
      return res.status(403).json({
        success: false,
        message: 'Account is restricted or locked. Please contact information security.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    await SecurityEvent.create({
      eventType: 'INVALID_TOKEN_ATTEMPT',
      resource: req.originalUrl,
      action: req.method,
      result: 'BLOCKED',
      severity: 'HIGH',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Unknown',
      metadata: { reason: error.message },
    });

    return res.status(401).json({
      success: false,
      message: 'Not authorized: Token expired or invalid.',
    });
  }
};

// Role-Based Authorization
export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      await SecurityEvent.create({
        userId: req.user ? req.user.email : 'UNKNOWN',
        departmentId: req.user ? req.user.departmentId : '',
        eventType: 'PRIVILEGE_VIOLATION',
        resource: req.originalUrl,
        action: req.method,
        result: 'BLOCKED',
        severity: 'HIGH',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        metadata: {
          userRole: req.user ? req.user.role : 'NONE',
          requiredRoles: roles,
        },
      });

      return res.status(403).json({
        success: false,
        message: `Privilege Violation: User role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this endpoint.`,
      });
    }
    next();
  };
};

// Department-Level Access Control Boundary
export const restrictToOwnDepartment = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'ADMIN' || req.user.role === 'FINANCE_OFFICER') {
    return next();
  }

  const targetDepartmentId = req.params.departmentId || req.body.departmentId || req.query.departmentId;

  if (targetDepartmentId) {
    const formattedTarget = targetDepartmentId.toUpperCase().trim();
    const formattedUserDept = req.user.departmentId.toUpperCase().trim();

    if (formattedTarget !== formattedUserDept) {
      await SecurityEvent.create({
        userId: req.user.email,
        departmentId: req.user.departmentId,
        eventType: 'UNAUTHORIZED_DEPARTMENT_ACCESS',
        resource: req.originalUrl,
        action: req.method,
        result: 'BLOCKED',
        severity: 'HIGH',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown',
        metadata: {
          userDepartment: req.user.departmentId,
          targetDepartment: targetDepartmentId,
        },
      });

      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view or edit other departments.',
      });
    }
  }

  next();
};
