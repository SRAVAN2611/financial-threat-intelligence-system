import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });

    const formatted = users.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      roleTitle: u.roleTitle,
      departmentId: u.departmentId,
      status: u.status,
      avatar: u.avatar,
      lastLogin: u.lastLogin ? u.lastLogin.toISOString() : 'Never',
    }));

    res.json({ success: true, users: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { name, email, password, role, roleTitle, departmentId } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password || 'password123', salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role || 'FINANCE_OFFICER',
      roleTitle: roleTitle || 'Sentinel Analyst',
      departmentId: departmentId || 'FIN-04',
      status: 'active',
    });

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'USER_ACCOUNT_CREATED',
      entityType: 'USER',
      entityId: user.email,
      newValue: { role: user.role, departmentId: user.departmentId },
      details: `Created new user account for ${user.name} (${user.email}) with role ${user.role}.`,
      ipAddress,
      immutableHash: `0x${Date.now().toString(16)}`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roleTitle: user.roleTitle,
        departmentId: user.departmentId,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: 'USER_STATUS_UPDATED',
      entityType: 'USER',
      entityId: user.email,
      oldValue: { status: oldStatus },
      newValue: { status: user.status },
      details: `User ${user.email} account status updated to ${status}.`,
      ipAddress,
      immutableHash: `0x${Date.now().toString(16)}`,
      status: status === 'suspended' || status === 'locked' ? 'WARNING' : 'SUCCESS',
    });

    res.json({ success: true, message: `User status set to ${status}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
