export interface FixedAsset {
  id: string;
  name: string;
  description?: string;
  category: 'equipment' | 'vehicle' | 'furniture' | 'building' | 'land' | 'software' | 'other';
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionValue: number;
  depreciationRate: number; // Annual depreciation rate in percentage
  depreciationMethod: 'linear' | 'accelerated' | 'none';
  usefulLifeYears: number;
  currentValue: number;
  status: 'planned' | 'acquired' | 'active' | 'inactive' | 'disposed';
  disposalDate?: string; // YYYY-MM-DD, if applicable
  disposalValue?: number;
  costCenterId: string;
  fiscalYearId: string;
  supplier?: string;
  invoiceNumber?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface FixedAssetFormData {
  name: string;
  description?: string;
  category: 'equipment' | 'vehicle' | 'furniture' | 'building' | 'land' | 'software' | 'other';
  acquisitionDate: string;
  acquisitionValue: number;
  depreciationRate: number;
  depreciationMethod: 'linear' | 'accelerated' | 'none';
  usefulLifeYears: number;
  status: 'planned' | 'acquired' | 'active' | 'inactive' | 'disposed';
  disposalDate?: string;
  disposalValue?: number;
  costCenterId: string;
  fiscalYearId: string;
  supplier?: string;
  invoiceNumber?: string;
  serialNumber?: string;
  location?: string;
  notes?: string;
}

export const assetCategoryLabels = {
  equipment: 'Equipamentos',
  vehicle: 'Veículos',
  furniture: 'Móveis e Utensílios',
  building: 'Edificações',
  land: 'Terrenos',
  software: 'Software',
  other: 'Outros'
};

export const assetStatusLabels = {
  planned: 'Planejado',
  acquired: 'Adquirido',
  active: 'Ativo',
  inactive: 'Inativo',
  disposed: 'Baixado'
};

export const depreciationMethodLabels = {
  linear: 'Linear',
  accelerated: 'Acelerada',
  none: 'Sem Depreciação'
};