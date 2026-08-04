import { api } from './client';

export const shiftsApi = {
  list: () => api.get<{ data: any[] }>('/shifts'),
  create: (data: any) => api.post('/shifts', data),
  update: (id: string, data: any) => api.patch(`/shifts/${id}`, data),
  delete: (id: string) => api.delete(`/shifts/${id}`),
};
