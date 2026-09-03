import { ComplianceStandard } from '../types';
import { apiFetch } from './apiClient';

export const complianceService = {
  async getStandards(): Promise<ComplianceStandard[]> {
    const data = await apiFetch<{ success: boolean; standards: ComplianceStandard[] }>('/reports/standards');
    return data.standards || [];
  },

  async generateSARPacket(incidentId: string, narrative: string): Promise<{
    sarFilingId: string;
    filingTimestamp: string;
    sha256Verification: string;
    narrative: string;
    status: string;
  }> {
    return await apiFetch<{
      success: boolean;
      sarFilingId: string;
      filingTimestamp: string;
      sha256Verification: string;
      narrative: string;
      status: string;
    }>('/reports/sar', {
      method: 'POST',
      body: JSON.stringify({ incidentId, narrative }),
    });
  },
};
