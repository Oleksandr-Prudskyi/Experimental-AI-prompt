import { api } from './client';

export const auditLogApi = {
  list: (params?: Record<string, string>) =>
    api.get('/audit-logs', { params }),
};
