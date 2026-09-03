import { AnomalyRule } from '../types';
import { apiFetch } from './apiClient';

export const rulesService = {
  async getRules(): Promise<AnomalyRule[]> {
    const data = await apiFetch<{ success: boolean; rules: AnomalyRule[] }>('/rules');
    return data.rules || [];
  },

  async toggleRule(id: string, enabled: boolean, actorName: string): Promise<AnomalyRule> {
    const data = await apiFetch<{ success: boolean; rule: AnomalyRule }>(`/rules/${id}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });

    const refreshed = (await this.getRules()).find((r) => r.id === id || r.code === id);
    if (!refreshed) {
      throw new Error('Failed to retrieve toggled rule');
    }
    return refreshed;
  },

  async createRule(
    newRule: Omit<AnomalyRule, 'id' | 'triggerCount24h' | 'lastTriggered' | 'createdAt'>,
    actorName: string
  ): Promise<AnomalyRule> {
    const data = await apiFetch<{ success: boolean; rule: AnomalyRule }>('/rules', {
      method: 'POST',
      body: JSON.stringify(newRule),
    });

    return data.rule;
  },
};
