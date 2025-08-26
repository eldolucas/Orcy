export interface BusinessGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  headquartersAddress?: string;
  headquartersCity?: string;
  headquartersState?: string;
  headquartersCountry?: string;
  mainCnpj?: string;
  website?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'dissolved';
  totalCompanies: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BusinessGroupFormData {
  name: string;
  code: string;
  description?: string;
  headquartersAddress?: string;
  headquartersCity?: string;
  headquartersState?: string;
  headquartersCountry?: string;
  mainCnpj?: string;
  website?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'dissolved';
}

export interface BusinessGroupMembership {
  id: string;
  businessGroupId: string;
  companyId: string;
  action: 'joined' | 'left' | 'transferred_from' | 'transferred_to';
  previousGroupId?: string;
  effectiveDate: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface CompanyGroupAssociation {
  companyId: string;
  businessGroupId: string;
  reason?: string;
}

export interface CompanyGroupTransfer {
  companyId: string;
  fromGroupId: string;
  toGroupId: string;
  reason?: string;
}

export const businessGroupStatusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  dissolved: 'Dissolvido'
};

export const membershipActionLabels = {
  joined: 'Ingressou',
  left: 'Saiu',
  transferred_from: 'Transferido de',
  transferred_to: 'Transferido para'
};

// Estados brasileiros para o formulário
export const brazilianStates = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];