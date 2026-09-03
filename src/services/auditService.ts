import { AuditLog } from '../types';
import { apiFetch } from './apiClient';
import { INITIAL_AUDIT_LOGS } from '../mockData/compliance';

export const auditService = {
  async getLogs(filter?: { targetType?: string; status?: string; search?: string }): Promise<AuditLog[]> {
    let list: any[] = [];
    try {
      const data = await apiFetch<{ success: boolean; logs: any[] }>('/audit-logs');
      list = data.logs || [];
    } catch (e) {
      console.warn('Backend audit logs fetch skipped, using initial audit logs fallback:', e);
    }

    // Map Mongoose backend schema properties to match UI AuditLog properties
    let mappedList: AuditLog[] = list.length > 0
      ? list.map((log) => ({
          id: log._id ? log._id.toString() : log.id || `log_${Math.random()}`,
          timestamp: log.timestamp ? new Date(log.timestamp).toISOString() : new Date().toISOString(),
          userId: log.userId || 'usr_sys',
          userName: log.userName || (log.userId ? log.userId.split('@')[0] : 'System Actor'),
          userRole: log.role || log.userRole || 'ADMIN',
          action: log.action || 'SYSTEM_ACTION',
          targetType: log.entityType || log.targetType || 'SYSTEM',
          targetId: log.entityId || log.targetId || 'N/A',
          details: log.details || '',
          ipAddress: log.ipAddress || '127.0.0.1',
          immutableHash: log.immutableHash || '0x00000000000000000',
          status: log.status || 'SUCCESS',
        }))
      : INITIAL_AUDIT_LOGS;

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      mappedList = mappedList.filter(
        (l) =>
          l.details.toLowerCase().includes(q) ||
          l.targetId.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q)
      );
    }

    if (filter?.targetType && filter.targetType !== 'ALL') {
      mappedList = mappedList.filter((l) => l.targetType === filter.targetType);
    }

    if (filter?.status && filter.status !== 'ALL') {
      mappedList = mappedList.filter((l) => l.status === filter.status);
    }

    return mappedList;
  },

  async addLog(entry: Omit<AuditLog, 'id' | 'timestamp' | 'ipAddress' | 'immutableHash' | 'userId'> & { userId?: string }): Promise<AuditLog> {
    return {
      id: `virtual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: entry.userId || 'usr_current',
      userName: entry.userName,
      userRole: entry.userRole,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      details: entry.details,
      ipAddress: '127.0.0.1',
      immutableHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: entry.status || 'SUCCESS',
    };
  },
};
