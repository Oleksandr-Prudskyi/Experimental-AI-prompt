export interface Setting {
  id: string;
  key: string;
  value: unknown;
  updatedBy: string | null;
  updatedAt: string;
}

export interface BrandingSettings {
  companyName: string;
  logoUrl: string | null;
  primaryColor: string;
}
