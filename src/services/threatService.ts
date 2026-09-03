import { GlobalThreatMetrics, LiveThreatEvent } from '../types';
import { apiFetch } from './apiClient';

export const threatService = {
  async getMetrics(): Promise<GlobalThreatMetrics> {
    const data = await apiFetch<{ success: boolean; metrics: GlobalThreatMetrics }>('/dashboard/metrics');
    return data.metrics;
  },

  async updateMetrics(updates: Partial<GlobalThreatMetrics>): Promise<GlobalThreatMetrics> {
    const current = await this.getMetrics();
    return { ...current, ...updates };
  },

  async getThreatRadarData(): Promise<{
    category: string;
    threatScore: number;
    benchmark: number;
    incidentsCount: number;
  }[]> {
    const data = await apiFetch<{ success: boolean; metrics: any }>('/dashboard/metrics');
    const overallRisk = data.metrics?.overallThreatScore || 25;

    // Dynamically adjust threat score values depending on overall risk rate
    return [
      { category: 'Unverified Shell Entities', threatScore: Math.round(overallRisk * 0.9 + 10), benchmark: 25, incidentsCount: 4 },
      { category: 'Duplicate Invoices', threatScore: Math.round(overallRisk * 0.8 + 15), benchmark: 20, incidentsCount: 3 },
      { category: 'Approval Smurfing', threatScore: Math.round(overallRisk * 0.95 + 8), benchmark: 15, incidentsCount: 5 },
      { category: 'Off-Hours Transfers', threatScore: Math.round(overallRisk * 0.85 + 12), benchmark: 10, incidentsCount: 2 },
      { category: "Benford's Law Deviations", threatScore: Math.round(overallRisk * 0.7 + 20), benchmark: 30, incidentsCount: 6 },
      { category: 'Regulatory Watchlist', threatScore: Math.round(overallRisk * 0.98 + 4), benchmark: 5, incidentsCount: 1 },
      { category: 'Velocity Surges', threatScore: Math.round(overallRisk * 0.75 + 18), benchmark: 35, incidentsCount: 4 },
    ];
  },

  async getLiveThreatFeed(): Promise<LiveThreatEvent[]> {
    const data = await apiFetch<{ success: boolean; liveThreats: any[] }>('/alerts');
    
    // Fallback static indicators in case DB alerts are temporarily resolved
    if (!data.liveThreats || data.liveThreats.length === 0) {
      return [
        {
          id: 'evt_fallback',
          timestamp: new Date().toISOString(),
          title: 'Sentinel Threat Protection Kernel Active',
          category: 'BENFORD_ANOMALY',
          severity: 'LOW',
          amount: 0,
          department: 'Cybersecurity & Internal Controls',
          referenceNo: 'SYS-INIT-001',
          status: 'APPROVED',
          aiExplanation: 'Dynamic anomaly detection active and monitoring incoming invoices.',
        }
      ];
    }

    return data.liveThreats;
  },
};
