import { api } from './client';

export const commentsApi = {
  list: (entityType: string, entityId: string) =>
    api.get('/comments', { params: { entity_type: entityType, entity_id: entityId } }),

  create: (data: { entityType: string; entityId: string; content: string }) =>
    api.post('/comments', data),

  update: (id: string, content: string) =>
    api.patch(`/comments/${id}`, { content }),

  delete: (id: string) => api.delete(`/comments/${id}`),
};
