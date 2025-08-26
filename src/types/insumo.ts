export interface Insumo {
  id: string;
  name: string;
  description?: string;
  type: 'product' | 'service' | 'fund'; // Produto, Serviço, Verba
  unit: string; // Unidade de medida (ex: UN, KG, HORA, MÊS)
  cost: number; // Custo unitário
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface InsumoFormData {
  name: string;
  description?: string;
  type: 'product' | 'service' | 'fund';
  unit: string;
  cost: number;
  isActive: boolean;
}

export const insumoTypeLabels = {
  product: 'Produto',
  service: 'Serviço',
  fund: 'Verba',
};

export const insumoUnitLabels = {
  UN: 'Unidade',
  KG: 'Quilograma',
  L: 'Litro',
  M: 'Metro',
  M2: 'Metro Quadrado',
  M3: 'Metro Cúbico',
  HR: 'Hora',
  DIA: 'Dia',
  MES: 'Mês',
  ANO: 'Ano',
  PCT: 'Pacote',
  CX: 'Caixa',
  SERV: 'Serviço',
  OUTRO: 'Outro',
};