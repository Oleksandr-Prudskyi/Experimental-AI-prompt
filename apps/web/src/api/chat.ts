import { api } from './client';

export const chatApi = {
  getChannels: () =>
    api.get('/chat/channels'),

  getOrCreateDirect: (userId: string) =>
    api.post('/chat/channels/direct', { userId }),

  createGroup: (name: string, memberIds: string[]) =>
    api.post('/chat/channels/group', { name, memberIds }),

  createDepartment: (workshopId: string) =>
    api.post('/chat/channels/department', { workshopId }),

  getMessages: (channelId: string, params?: Record<string, string>) =>
    api.get(`/chat/channels/${channelId}/messages`, { params }),

  sendMessage: (channelId: string, content: string) =>
    api.post(`/chat/channels/${channelId}/messages`, { content }),

  markRead: (channelId: string) =>
    api.post(`/chat/channels/${channelId}/read`),

  addMembers: (channelId: string, userIds: string[]) =>
    api.post(`/chat/channels/${channelId}/members`, { userIds }),

  leaveChannel: (channelId: string) =>
    api.delete(`/chat/channels/${channelId}/members/me`),
};
