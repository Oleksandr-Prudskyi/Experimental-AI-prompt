import { api } from './client';
import type { CreateWorkRecordInput, UpdateWorkRecordInput } from '@evidence/shared';

export const workRecordsApi = {
  list: (params?: Record<string, string>) =>
    api.get('/work-records', { params }),

  get: (id: string) => api.get(`/work-records/${id}`),

  create: (data: CreateWorkRecordInput) => api.post('/work-records', data),

  update: (id: string, data: UpdateWorkRecordInput) =>
    api.patch(`/work-records/${id}`, data),

  delete: (id: string) => api.delete(`/work-records/${id}`),

  duplicate: (id: string) => api.post(`/work-records/${id}/duplicate`),
};
