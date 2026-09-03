import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import SecurityEvent from '../models/SecurityEvent.js';
import AuditLog from '../models/AuditLog.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'supersecretkeyplaceholderforsentinelai2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const ipAddress = req.ip || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';

  try {
    const user = await User.findOne({ email });

    // 1. Account exist checks
    if (!user) {
      // Record security event
      await SecurityEvent.create({
        eventType: 'FAILED_LOGIN',
        resource: '/api/auth/login',
        action: 'AUTHENTICATE',
        result: 'NOT_FOUND',
        severity: 'MEDIUM',
        ipAddress,
        userAgent,
        metadata: { attemptedEmail: email },
      });

      return res.status(401).json({ success: false, message: 'Invalid corporate credentials.' });
    }

    // 2. Lockout checks
    if (user.status === 'locked' && user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMin = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to repeated failures. Try again in ${remainingMin} minutes.`,
      });
    }

    // 3. Password match check
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      let reason = 'Incorrect passcode';

      // Lock account temporarily after 3 failed attempts
      if (user.failedLoginAttempts >= 3) {
        user.status = 'locked';
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        reason = `Account locked: exceeded failure limit.`;
      }

      await user.save();

      // Log security event
      await SecurityEvent.create({
        userId: user.email,
        departmentId: user.departmentId,
        eventType: user.failedLoginAttempts >= 3 ? 'FAILED_LOGIN_BURST' : 'FAILED_LOGIN',
        severity: user.failedLoginAttempts >= 3 ? 'HIGH' : 'LOW',
        resource: '/api/auth/login',
        action: 'AUTHENTICATE',
        result: 'DENIED',
        ipAddress,
        userAgent,
        metadata: {
          attemptsCount: user.failedLoginAttempts,
          reason,
        },
      });

      return res.status(401).json({
        success: false,
        message: user.failedLoginAttempts >= 3
          ? 'Too many failed login attempts. Your account has been temporarily locked for 15 minutes.'
          : 'Invalid credentials. Failed login attempt tracked.',
      });
    }

    // 4. Success logic: Reset locks
    user.failedLoginAttempts = 0;
    user.status = 'active';
    user.lockUntil = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    // Security logs
    await SecurityEvent.create({
      userId: user.email,
      departmentId: user.departmentId,
      eventType: 'SUCCESSFUL_LOGIN',
      resource: '/api/auth/login',
      action: 'AUTHENTICATE',
      result: 'SUCCESS',
      severity: 'LOW',
      ipAddress,
      userAgent,
      metadata: { lastLogin: user.lastLogin },
    });

    // Audit logs
    await AuditLog.create({
      userId: user.email,
      userName: user.name,
      role: user.role,
      action: 'USER_LOGIN_SESSION_ESTABLISHED',
      entityType: 'USER',
      entityId: user._id.toString(),
      newValue: { sessionStart: user.lastLogin },
      details: `Successful authentication by ${user.name} (${user.role}) from IP ${ipAddress}`,
      ipAddress,
      immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
      status: 'SUCCESS',
    });

    // Send response matching properties in frontend User
    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: user.roleTitle,
        department: user.departmentId,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        twoFactorEnabled: true,
        permissions: {
          canManageRules: user.role === 'ADMIN',
          canQuarantineTransactions: user.role !== 'DEPARTMENT_HEAD',
          canApproveBudgets: user.role === 'ADMIN',
          canExportForensics: true,
          canManageUsers: user.role === 'ADMIN',
          canRunSimulations: user.role !== 'DEPARTMENT_HEAD',
          canGenerateSAR: user.role !== 'DEPARTMENT_HEAD',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server authentication exception: ' + error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const ipAddress = req.ip || '127.0.0.1';
    if (req.user) {
      await AuditLog.create({
        userId: req.user.email,
        userName: req.user.name,
        role: req.user.role,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: req.user._id.toString(),
        details: `Session closed by user ${req.user.name}`,
        ipAddress,
        immutableHash: `0x${Math.random().toString(16).substring(2, 42)}`,
        status: 'SUCCESS',
      });
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        roleTitle: req.user.roleTitle,
        department: req.user.departmentId,
        avatar: req.user.avatar,
        lastLogin: req.user.lastLogin,
        twoFactorEnabled: true,
        permissions: {
          canManageRules: req.user.role === 'ADMIN',
          canQuarantineTransactions: req.user.role !== 'DEPARTMENT_HEAD',
          canApproveBudgets: req.user.role === 'ADMIN',
          canExportForensics: true,
          canManageUsers: req.user.role === 'ADMIN',
          canRunSimulations: req.user.role !== 'DEPARTMENT_HEAD',
          canGenerateSAR: req.user.role !== 'DEPARTMENT_HEAD',
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
