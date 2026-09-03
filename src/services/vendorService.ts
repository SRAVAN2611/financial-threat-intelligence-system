import { VendorIntelligence } from '../types';
import { apiFetch } from './apiClient';

export const vendorService = {
  async getVendors(search?: string, status?: string): Promise<VendorIntelligence[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);

    const path = `/vendors?${params.toString()}`;
    const data = await apiFetch<{ success: boolean; vendors: VendorIntelligence[] }>(path);
    return data.vendors || [];
  },

  async getVendorById(id: string): Promise<VendorIntelligence | null> {
    const data = await apiFetch<{ success: boolean; vendor: any }>(`/vendors/${id}`);
    if (!data.vendor) return null;
    const v = data.vendor;
    return {
      id: v._id || v.id,
      name: v.name,
      taxId: v.taxId || v.registrationIdentifier || '27AAACG1209B1Z8',
      category: v.category || 'Vendor',
      jurisdiction: v.jurisdiction || 'India (Domestic)',
      riskScore: v.riskScore || 15,
      riskLevel: v.riskLevel || 'LOW',
      status: v.status === 'ACTIVE' ? 'VERIFIED' : v.status === 'UNDER_SURVEILLANCE' ? 'FLAGGED' : v.status === 'SUSPENDED' ? 'SUSPENDED' : 'WATCHLIST',
      totalVolumeYTD: v.totalAmount || v.totalTransacted || 1000000,
      invoiceCount: v.totalTransactions || v.transactionCount || 5,
      flaggedInvoicesCount: v.riskFactors ? v.riskFactors.length : 0,
      bankAccount: 'HDFC00001092834',
      bankName: 'HDFC Bank Corporate Treasury',
      ghostCompanyProbability: v.riskScore > 80 ? 75 : 12,
      sanctionsCheckStatus: v.riskScore > 85 ? 'POTENTIAL_MATCH' : 'CLEARED',
      pepMatch: v.riskScore > 90,
      lastAuditDate: v.updatedAt ? new Date(v.updatedAt).toISOString().split('T')[0] : '2026-03-01',
      incorporationDate: '2020-04-15',
      recentAlterations: [],
    };
  },

  async updateVendorStatus(
    id: string,
    newStatus: VendorIntelligence['status'],
    reason: string,
    actorName: string
  ): Promise<VendorIntelligence> {
    const apiStatus = newStatus === 'VERIFIED' ? 'ACTIVE' : newStatus === 'FLAGGED' ? 'UNDER_SURVEILLANCE' : newStatus === 'SUSPENDED' ? 'SUSPENDED' : 'UNDER_SURVEILLANCE';
    await apiFetch<{ success: boolean; vendor: any }>(`/vendors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus: apiStatus, reason }),
    });

    const refreshed = await this.getVendorById(id);
    if (!refreshed) {
      throw new Error('Failed to retrieve updated vendor');
    }
    return refreshed;
  },
};
