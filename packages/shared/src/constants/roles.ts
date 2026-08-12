export const ROLE_SLUGS = {
  ADMINISTRATOR: 'administrator',
  MISTR: 'mistr',
  SERIZOVAC: 'serizovac',
  VEDOUCI_VYROBY: 'vedouci_vyroby',
  OBSLUHA_STROJE: 'obsluha_stroje',
} as const;

export type RoleSlug = (typeof ROLE_SLUGS)[keyof typeof ROLE_SLUGS];

export const ROLE_NAMES: Record<RoleSlug, string> = {
  administrator: 'Administrátor',
  mistr: 'Mistr',
  serizovac: 'Seřizovač',
  vedouci_vyroby: 'Vedoucí výroby',
  obsluha_stroje: 'Obsluha stroje',
};

export const ROLE_HIERARCHY: Record<RoleSlug, number> = {
  administrator: 100,
  mistr: 80,
  vedouci_vyroby: 60,
  serizovac: 20,
  obsluha_stroje: 10,
};
