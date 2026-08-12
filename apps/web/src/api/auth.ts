import { api } from './client';
import type { LoginInput } from '@evidence/shared';
import type { User } from '@evidence/shared';

export const authApi = {
  login: (data: LoginInput) =>
    api.post<{ data: { accessToken: string; user: User } }>('/auth/login', data),

  refresh: () =>
    api.post<{ data: { accessToken: string; user: User } }>('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<{ data: User }>('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};
