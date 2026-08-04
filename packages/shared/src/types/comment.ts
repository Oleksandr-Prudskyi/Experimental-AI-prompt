export interface Comment {
  id: string;
  authorId: string;
  entityType: string;
  entityId: string;
  content: string;
  author?: import('./user').User;
  createdAt: string;
  updatedAt: string;
}
