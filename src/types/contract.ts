export interface Contract {
  id: string;
  name: string;
  description?: string;
  contractNumber: string;
  contractType: 'service' | 'lease' | 'rental' | 'other';
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, if applicable
  value: number; // Monthly or total value
  currency: string; // e.g., 'BRL', 'USD'
  recurrenceType: 'monthly' | 'quarterly' | 'yearly' | 'none';
  nextPaymentDate?: string; // YYYY-MM-DD, for recurring contracts
  partnerName: string; // Name of the supplier/customer
  costCenterId: string;
  fiscalYearId: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  attachments?: string[]; // List of file names/URLs
  notes?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ContractFormData {
  name: string;
  description?: string;
  contractNumber: string;
  contractType: 'service' | 'lease' | 'rental' | 'other';
  startDate: string;
  endDate?: string;
  value: number;
  currency: string;
  recurrenceType: 'monthly' | 'quarterly' | 'yearly' | 'none';
  nextPaymentDate?: string;
  partnerName: string;
  costCenterId: string;
  fiscalYearId: string;
  status: 'active' | 'inactive' | 'expired' | 'cancelled';
  notes?: string;
}

export const contractTypeLabels = {
  service: 'Prestação de Serviço',
  lease: 'Locação',
  rental: 'Aluguel',
  other: 'Outro',
};

export const contractRecurrenceLabels = {
  none: 'Sem recorrência',
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
};

export const contractStatusLabels = {
  active: 'Ativo',
  inactive: 'Inativo',
  expired: 'Expirado',
  cancelled: 'Cancelado',
};

export const currencyOptions = [
  { value: 'BRL', label: 'Real Brasileiro (R$)' },
  { value: 'USD', label: 'Dólar Americano (US$)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'Libra Esterlina (£)' },
];