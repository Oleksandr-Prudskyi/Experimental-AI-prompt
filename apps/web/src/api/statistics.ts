import { api } from './client';

export const statisticsApi = {
  getDashboard: () => api.get('/statistics/dashboard'),
};
