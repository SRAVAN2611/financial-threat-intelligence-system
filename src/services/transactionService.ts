import { Transaction, TransactionStatus, RiskLevel } from '../types';
import { apiFetch } from './apiClient';

export interface TransactionFilterParams {
  search?: string;
  department?: string;
  riskLevel?: RiskLevel | 'ALL';
  status?: TransactionStatus | 'ALL';
  threatCategory?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: keyof Transaction;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const transactionService = {
  async getTransactions(params: TransactionFilterParams = {}): Promise<{
    transactions: Transaction[];
    total: number;
    flaggedCount: number;
    quarantinedCount: number;
    totalAmount: number;
  }> {
    const query = new URLSearchParams();

    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.riskLevel && params.riskLevel !== 'ALL') query.append('riskLevel', params.riskLevel);
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.minAmount !== undefined) query.append('minAmount', String(params.minAmount));
    if (params.maxAmount !== undefined) query.append('maxAmount', String(params.maxAmount));
    if (params.page) query.append('page', String(params.page));
    if (params.pageSize) query.append('pageSize', String(params.pageSize));
    if (params.sortBy) query.append('sortBy', String(params.sortBy));
    if (params.sortOrder) query.append('sortOrder', String(params.sortOrder));

    const path = `/expenditures?${query.toString()}`;
    const data = await apiFetch<{
      success: boolean;
      transactions: Transaction[];
      total: number;
      flaggedCount: number;
      quarantinedCount: number;
      totalAmount: number;
    }>(path);

    return {
      transactions: data.transactions || [],
      total: data.total || 0,
      flaggedCount: data.flaggedCount || 0,
      quarantinedCount: data.quarantinedCount || 0,
      totalAmount: data.totalAmount || 0,
    };
  },

  async getTransactionById(id: string): Promise<Transaction | null> {
    const res = await this.getTransactions({ search: id });
    if (res.transactions.length > 0) {
      return res.transactions[0];
    }
    return null;
  },

  async updateTransactionStatus(
    id: string,
    newStatus: TransactionStatus,
    reason: string,
    actorName: string
  ): Promise<Transaction> {
    const data = await apiFetch<{ success: boolean; transaction: any }>(`/expenditures/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ newStatus, reason }),
    });

    const refreshed = await this.getTransactionById(id);
    if (!refreshed) {
      throw new Error(`Failed to restore updated transaction ${id}`);
    }
    return refreshed;
  },

  async addForensicNote(id: string, note: string, author: string): Promise<Transaction> {
    await apiFetch<{ success: boolean }>(`/expenditures/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });

    const refreshed = await this.getTransactionById(id);
    if (!refreshed) {
      throw new Error('Failed to retrieve updated transaction');
    }
    return refreshed;
  },

  async batchQuarantine(ids: string[], reason: string, actorName: string): Promise<number> {
    const data = await apiFetch<{ success: boolean; count: number }>('/expenditures/batch-quarantine', {
      method: 'POST',
      body: JSON.stringify({ ids, reason }),
    });
    return data.count || 0;
  },

  // Facilitate creating new expenditures via the frontend form
  async createExpenditure(payload: {
    amount: number;
    category: string;
    description: string;
    transactionDate: string;
    documentReference: string;
    departmentId: string;
    destinationAccount?: string;
  }): Promise<{ success: boolean; transaction: { id: string; referenceNo: string } }> {
    return await apiFetch<{ success: boolean; transaction: { id: string; referenceNo: string } }>('/expenditures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
