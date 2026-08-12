import { api } from './client';

export const teamsApi = {
  list: (workshopId?: string) =>
    api.get<{ data: any[] }>('/teams', { params: workshopId ? { workshop_id: workshopId } : {} }),
  get: (id: string) => api.get<{ data: any }>(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  delete: (id: string) => api.delete(`/teams/${id}`),
  addMembers: (teamId: string, userIds: string[]) =>
    api.post(`/teams/${teamId}/members`, { userIds }),
  addMember: (teamId: string, userId: string) =>
    api.post(`/teams/${teamId}/members`, { userIds: [userId] }),
  removeMember: (teamId: string, userId: string) =>
    api.delete(`/teams/${teamId}/members/${userId}`),
};
