export interface LaborBudget {
  id: string;
  position: string;           // Cargo/Função
  department: string;         // Departamento
  baseSalary: number;         // Salário base
  benefits: LaborBenefit[];   // Benefícios
  charges: LaborCharge[];     // Encargos
  quantity: number;           // Quantidade de funcionários nesta função
  totalCost: number;          // Custo total (calculado)
  costCenterId: string;       // Centro de custo
  fiscalYearId: string;       // Exercício financeiro
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LaborBenefit {
  id: string;
  name: string;             // Nome do benefício (ex: Vale Refeição, Plano de Saúde)
  value: number;            // Valor do benefício
  type: 'fixed' | 'percentage'; // Tipo: valor fixo ou percentual do salário
  isMonthly: boolean;       // Se é mensal ou não (ex: 13º não é mensal)
  months: number;           // Quantidade de meses no ano (geralmente 12, mas pode ser diferente)
}

export interface LaborCharge {
  id: string;
  name: string;             // Nome do encargo (ex: INSS, FGTS)
  percentage: number;       // Percentual sobre o salário
  baseIncludesBenefits: boolean; // Se a base de cálculo inclui benefícios
}

export interface LaborBudgetFormData {
  position: string;
  department: string;
  baseSalary: number;
  benefits: Omit<LaborBenefit, 'id'>[];
  charges: Omit<LaborCharge, 'id'>[];
  quantity: number;
  costCenterId: string;
  fiscalYearId: string;
  isActive: boolean;
}

export const defaultBenefits: Omit<LaborBenefit, 'id'>[] = [
  {
    name: 'Vale Refeição',
    value: 500,
    type: 'fixed',
    isMonthly: true,
    months: 12
  },
  {
    name: 'Vale Transporte',
    value: 220,
    type: 'fixed',
    isMonthly: true,
    months: 12
  },
  {
    name: 'Plano de Saúde',
    value: 400,
    type: 'fixed',
    isMonthly: true,
    months: 12
  },
  {
    name: '13º Salário',
    value: 100,
    type: 'percentage',
    isMonthly: false,
    months: 1
  },
  {
    name: 'Férias',
    value: 133.33,
    type: 'percentage',
    isMonthly: false,
    months: 1
  }
];

export const defaultCharges: Omit<LaborCharge, 'id'>[] = [
  {
    name: 'INSS',
    percentage: 20,
    baseIncludesBenefits: false
  },
  {
    name: 'FGTS',
    percentage: 8,
    baseIncludesBenefits: false
  },
  {
    name: 'PIS/PASEP',
    percentage: 1,
    baseIncludesBenefits: false
  },
  {
    name: 'Provisão para Rescisão',
    percentage: 4,
    baseIncludesBenefits: true
  }
];

export const departmentOptions = [
  'Administrativo',
  'Comercial',
  'Financeiro',
  'Marketing',
  'Operações',
  'Produção',
  'Recursos Humanos',
  'Tecnologia da Informação',
  'Outros'
];