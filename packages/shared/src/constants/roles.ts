export const ROLE_SLUGS = {
  ADMINISTRATOR: 'administrator',
  MISTR: 'mistr',
  SERIZOVAC: 'serizovac',
  VEDOUCI_VYROBY: 'vedouci_vyroby',
} as const;

export type RoleSlug = (typeof ROLE_SLUGS)[keyof typeof ROLE_SLUGS];

export const ROLE_NAMES: Record<RoleSlug, string> = {
  administrator: 'Administrátor',
  mistr: 'Mistr',
  serizovac: 'Seřizovač',
  vedouci_vyroby: 'Vedoucí výroby',
};

export const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  administrator: 100,
  mistr: 80,
  serizovac: 20,
  vedouci_vyroby: 10,
};
