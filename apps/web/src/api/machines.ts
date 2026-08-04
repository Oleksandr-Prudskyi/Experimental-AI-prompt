import { api } from './client';

export const machinesApi = {
  list: (params?: { line_id?: string; workshop_id?: string; status?: string }) =>
    api.get<{ data: any[] }>('/machines', { params }),
  get: (id: string) => api.get<{ data: any }>(`/machines/${id}`),
  create: (data: any) => api.post('/machines', data),
  update: (id: string, data: any) => api.patch(`/machines/${id}`, data),
  delete: (id: string) => api.delete(`/machines/${id}`),
  getHistory: (id: string, params?: { cursor?: string; limit?: number }) =>
    api.get<{ data: any[]; meta: any }>(`/machines/${id}/history`, { params }),
};
