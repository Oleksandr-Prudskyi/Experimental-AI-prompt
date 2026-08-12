import type { User } from './user';

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  priority: string;
  isActive: boolean;
  expiresAt: string | null;
  author?: User;
  createdAt: string;
  updatedAt: string;
}
