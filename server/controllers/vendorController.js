import Vendor from '../models/Vendor.js';
import AuditLog from '../models/AuditLog.js';

export const getVendors = async (req, res) => {
  const { search, status } = req.query;

  try {
    const filter = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [
        { name: regex },
        { registrationIdentifier: regex },
        { taxId: regex },
        { category: regex },
        { jurisdiction: regex },
      ];
    }

    if (status && status !== 'ALL') {
      const dbStatus = status === 'VERIFIED' ? 'ACTIVE' : status === 'FLAGGED' ? 'UNDER_SURVEILLANCE' : status === 'SUSPENDED' ? 'SUSPENDED' : status;
      filter.status = dbStatus;
    }

    const vendors = await Vendor.find(filter).sort({ riskScore: -1 });

    const formatted = vendors.map((v) => ({
      id: v._id.toString(),
      name: v.name,
      taxId: v.taxId || v.registrationIdentifier || '27AAACG1209B1Z8',
      category: v.category,
      jurisdiction: v.jurisdiction,
      riskScore: v.riskScore,
      riskLevel: v.riskLevel,
      status: v.status === 'ACTIVE' ? 'VERIFIED' : v.status === 'UNDER_SURVEILLANCE' ? 'FLAGGED' : v.status === 'SUSPENDED' ? 'SUSPENDED' : 'WATCHLIST',
      totalVolumeYTD: v.totalAmount,
      invoiceCount: v.totalTransactions,
      flaggedInvoicesCount: v.riskFactors ? v.riskFactors.length : 0,
      bankAccount: 'HDFC00001092834',
      bankName: 'HDFC Bank Corporate Treasury',
      ghostCompanyProbability: v.riskScore > 80 ? 75 : 12,
      sanctionsCheckStatus: v.riskScore > 85 ? 'POTENTIAL_MATCH' : 'CLEARED',
      pepMatch: v.riskScore > 90,
      lastAuditDate: v.updatedAt ? v.updatedAt.toISOString().split('T')[0] : '2026-03-01',
      incorporationDate: '2020-04-15',
      recentAlterations: [],
    }));

    res.json({ success: true, vendors: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  const { id } = req.params;

  try {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    res.json({ success: true, vendor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendorStatus = async (req, res) => {
  const { id } = req.params;
  const { newStatus, reason } = req.body;
  const ipAddress = req.ip || '127.0.0.1';

  try {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor record not found' });
    }

    const oldStatus = vendor.status;
    vendor.status = newStatus;
    await vendor.save();

    await AuditLog.create({
      userId: req.user.email,
      userName: req.user.name,
      role: req.user.role,
      action: `VENDOR_STATUS_CHANGE`,
      entityType: 'VENDOR',
      entityId: vendor.name,
      oldValue: { status: oldStatus },
      newValue: { status: newStatus },
      details: `Vendor status adjusted to ${newStatus}. Reason: ${reason || 'Manual administrative review'}`,
      ipAddress,
      immutableHash: `0x${Date.now().toString(16)}`,
      status: newStatus === 'SUSPENDED' ? 'CRITICAL' : 'WARNING',
    });

    res.json({
      success: true,
      message: `Vendor status updated to ${newStatus}`,
      vendor,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
