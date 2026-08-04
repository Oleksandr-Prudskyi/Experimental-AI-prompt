import { api } from './client';

export const trashApi = {
  list: () => api.get('/trash'),
  restore: (entityType: string, id: string) => api.post(`/trash/${entityType}/${id}/restore`),
  permanentDelete: (entityType: string, id: string) => api.delete(`/trash/${entityType}/${id}/permanent`),
};
