import { api } from './client';
import type { User, Role, CreateUserInput, UpdateUserInput, ApiResponse } from '@evidence/shared';

export const usersApi = {
  list: (params?: { cursor?: string; limit?: number }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),

  get: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

  create: (data: CreateUserInput) => api.post<ApiResponse<User>>('/users', data),

  update: (id: string, data: UpdateUserInput) =>
    api.patch<ApiResponse<User>>(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),

  getRoles: () => api.get<ApiResponse<Role[]>>('/users/roles'),
};
