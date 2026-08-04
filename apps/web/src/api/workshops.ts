import { api } from './client';

export const workshopsApi = {
  list: () => api.get<{ data: any[] }>('/workshops'),
  get: (id: string) => api.get<{ data: any }>(`/workshops/${id}`),
  create: (data: any) => api.post('/workshops', data),
  update: (id: string, data: any) => api.patch(`/workshops/${id}`, data),
  delete: (id: string) => api.delete(`/workshops/${id}`),
};

export const productionLinesApi = {
  list: (workshopId?: string) =>
    api.get<{ data: any[] }>('/production-lines', { params: workshopId ? { workshop_id: workshopId } : {} }),
  create: (data: any) => api.post('/production-lines', data),
  update: (id: string, data: any) => api.patch(`/production-lines/${id}`, data),
  delete: (id: string) => api.delete(`/production-lines/${id}`),
};

export const teamsApi = {
  list: (workshopId?: string) =>
    api.get<{ data: any[] }>('/teams', { params: workshopId ? { workshop_id: workshopId } : {} }),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  addMember: (teamId: string, userId: string) => api.post(`/teams/${teamId}/members`, { userId }),
  removeMember: (teamId: string, userId: string) => api.delete(`/teams/${teamId}/members/${userId}`),
};
