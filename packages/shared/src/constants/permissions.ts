export const PERMISSIONS = {
  RECORDS_CREATE: 'records.create',
  RECORDS_EDIT_ALL: 'records.edit_all',
  RECORDS_DELETE: 'records.delete',
  MACHINES_MANAGE: 'machines.manage',
  WORKSHOPS_MANAGE: 'workshops.manage',
  TEAMS_MANAGE: 'teams.manage',
  USERS_MANAGE: 'users.manage',
  USERS_GRANT_PERMISSIONS: 'users.grant_permissions',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  CHAT_CREATE_CHANNEL: 'chat.create_channel',
  STATISTICS_VIEW_ALL: 'statistics.view_all',
  REPORTS_GENERATE: 'reports.generate',
  AUDIT_VIEW: 'audit.view',
  SETTINGS_MANAGE: 'settings.manage',
  TRASH_RESTORE: 'trash.restore',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  administrator: Object.values(PERMISSIONS),
  mistr: [
    PERMISSIONS.RECORDS_CREATE,
    PERMISSIONS.RECORDS_EDIT_ALL,
    PERMISSIONS.RECORDS_DELETE,
    PERMISSIONS.MACHINES_MANAGE,
    PERMISSIONS.WORKSHOPS_MANAGE,
    PERMISSIONS.TEAMS_MANAGE,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_GRANT_PERMISSIONS,
    PERMISSIONS.ANNOUNCEMENTS_MANAGE,
    PERMISSIONS.CHAT_CREATE_CHANNEL,
    PERMISSIONS.STATISTICS_VIEW_ALL,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.TRASH_RESTORE,
  ],
  serizovac: [PERMISSIONS.RECORDS_CREATE],
  vedouci_vyroby: [PERMISSIONS.STATISTICS_VIEW_ALL, PERMISSIONS.REPORTS_GENERATE],
};
