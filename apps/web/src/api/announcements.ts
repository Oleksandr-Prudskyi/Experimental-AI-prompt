import { api } from './client';

export const announcementsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/announcements', { params }),

  get: (id: string) =>
    api.get(`/announcements/${id}`),

  create: (data: { title: string; content: string; priority?: string; isActive?: boolean; expiresAt?: string }) =>
    api.post('/announcements', data),

  update: (id: string, data: { title?: string; content?: string; priority?: string; isActive?: boolean; expiresAt?: string }) =>
    api.patch(`/announcements/${id}`, data),

  delete: (id: string) =>
    api.delete(`/announcements/${id}`),
};
