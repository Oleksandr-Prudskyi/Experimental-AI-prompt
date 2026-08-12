import type { User } from './user';

export interface ChatChannel {
  id: string;
  name: string | null;
  type: 'department' | 'direct' | 'group';
  workshopId: string | null;
  createdById: string;
  members?: ChatMember[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMember {
  channelId: string;
  userId: string;
  lastReadAt: string;
  joinedAt: string;
  user?: User;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
