import { DepartmentBudget } from '../types';
import { apiFetch } from './apiClient';

export const budgetService = {
  async getDepartments(): Promise<DepartmentBudget[]> {
    const data = await apiFetch<{ success: boolean; departments: DepartmentBudget[] }>('/dashboard/metrics');
    return data.departments || [];
  },

  async getDepartmentById(id: string): Promise<DepartmentBudget | null> {
    const departments = await this.getDepartments();
    return departments.find((d) => d.id === id || d.code === id) || null;
  },

  async getBudgetSummary(): Promise<{
    totalAllocated: number;
    totalSpent: number;
    totalCommitted: number;
    totalRemaining: number;
    totalProjectedOverspend: number;
    averageBurnRate: number;
  }> {
    const data = await apiFetch<{
      success: boolean;
      totalBudget: number;
      totalSpent: number;
      totalCommitted: number;
      remainingBudget: number;
      utilizationPercent: number;
      departments: DepartmentBudget[];
    }>('/dashboard/metrics');

    const totalProjectedOverspend = data.departments?.reduce((acc, d) => acc + (d.projectedOverspend || 0), 0) || 0;

    return {
      totalAllocated: data.totalBudget || 0,
      totalSpent: data.totalSpent || 0,
      totalCommitted: data.totalCommitted || 0,
      totalRemaining: data.remainingBudget || 0,
      totalProjectedOverspend,
      averageBurnRate: data.utilizationPercent || 0,
    };
  },

  async adjustBudget(
    departmentId: string,
    newAllocation: number,
    reason: string,
    actorName: string
  ): Promise<DepartmentBudget> {
    const data = await apiFetch<{ success: boolean; budget: any }>([
      `/budgets/${departmentId}/adjust`
    ].join(''), {
      method: 'PUT',
      body: JSON.stringify({ newAllocation, reason }),
    });

    const refreshed = await this.getDepartmentById(departmentId);
    if (!refreshed) {
      throw new Error('Failed to retrieve adjusted budget');
    }
    return refreshed;
  },
};
