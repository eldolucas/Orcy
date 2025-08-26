import { useState, useEffect } from 'react';
import { LaborBudget, LaborBudgetFormData, defaultBenefits, defaultCharges } from '../types/laborBudget';
import { useAuth } from '../contexts/AuthContext';

// Mock data para mão de obra orçada
const mockLaborBudgets: LaborBudget[] = [
  {
    id: '1',
    position: 'Desenvolvedor Sênior',
    department: 'Tecnologia da Informação',
    baseSalary: 12000,
    benefits: [
      { id: '1', name: 'Vale Refeição', value: 600, type: 'fixed', isMonthly: true, months: 12 },
      { id: '2', name: 'Vale Transporte', value: 300, type: 'fixed', isMonthly: true, months: 12 },
      { id: '3', name: 'Plano de Saúde', value: 500, type: 'fixed', isMonthly: true, months: 12 },
      { id: '4', name: '13º Salário', value: 100, type: 'percentage', isMonthly: false, months: 1 },
      { id: '5', name: 'Férias', value: 133.33, type: 'percentage', isMonthly: false, months: 1 }
    ],
    charges: [
      { id: '1', name: 'INSS', percentage: 20, baseIncludesBenefits: false },
      { id: '2', name: 'FGTS', percentage: 8, baseIncludesBenefits: false },
      { id: '3', name: 'PIS/PASEP', percentage: 1, baseIncludesBenefits: false },
      { id: '4', name: 'Provisão para Rescisão', percentage: 4, baseIncludesBenefits: true }
    ],
    quantity: 3,
    totalCost: 58320,
    costCenterId: '11',
    fiscalYearId: '1',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'João Silva'
  },
  {
    id: '2',
    position: 'Analista de Marketing',
    department: 'Marketing',
    baseSalary: 7000,
    benefits: [
      { id: '6', name: 'Vale Refeição', value: 500, type: 'fixed', isMonthly: true, months: 12 },
      { id: '7', name: 'Vale Transporte', value: 250, type: 'fixed', isMonthly: true, months: 12 },
      { id: '8', name: 'Plano de Saúde', value: 400, type: 'fixed', isMonthly: true, months: 12 },
      { id: '9', name: '13º Salário', value: 100, type: 'percentage', isMonthly: false, months: 1 },
      { id: '10', name: 'Férias', value: 133.33, type: 'percentage', isMonthly: false, months: 1 }
    ],
    charges: [
      { id: '5', name: 'INSS', percentage: 20, baseIncludesBenefits: false },
      { id: '6', name: 'FGTS', percentage: 8, baseIncludesBenefits: false },
      { id: '7', name: 'PIS/PASEP', percentage: 1, baseIncludesBenefits: false },
      { id: '8', name: 'Provisão para Rescisão', percentage: 4, baseIncludesBenefits: true }
    ],
    quantity: 2,
    totalCost: 22680,
    costCenterId: '21',
    fiscalYearId: '1',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Maria Santos'
  },
  {
    id: '3',
    position: 'Gerente Financeiro',
    department: 'Financeiro',
    baseSalary: 15000,
    benefits: [
      { id: '11', name: 'Vale Refeição', value: 700, type: 'fixed', isMonthly: true, months: 12 },
      { id: '12', name: 'Vale Transporte', value: 0, type: 'fixed', isMonthly: true, months: 12 },
      { id: '13', name: 'Plano de Saúde', value: 800, type: 'fixed', isMonthly: true, months: 12 },
      { id: '14', name: '13º Salário', value: 100, type: 'percentage', isMonthly: false, months: 1 },
      { id: '15', name: 'Férias', value: 133.33, type: 'percentage', isMonthly: false, months: 1 }
    ],
    charges: [
      { id: '9', name: 'INSS', percentage: 20, baseIncludesBenefits: false },
      { id: '10', name: 'FGTS', percentage: 8, baseIncludesBenefits: false },
      { id: '11', name: 'PIS/PASEP', percentage: 1, baseIncludesBenefits: false },
      { id: '12', name: 'Provisão para Rescisão', percentage: 4, baseIncludesBenefits: true }
    ],
    quantity: 1,
    totalCost: 24300,
    costCenterId: '3',
    fiscalYearId: '1',
    isActive: true,
    companyId: '1',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'Pedro Costa'
  },
  {
    id: '4',
    position: 'Assistente Administrativo',
    department: 'Administrativo',
    baseSalary: 3500,
    benefits: [
      { id: '16', name: 'Vale Refeição', value: 400, type: 'fixed', isMonthly: true, months: 12 },
      { id: '17', name: 'Vale Transporte', value: 200, type: 'fixed', isMonthly: true, months: 12 },
      { id: '18', name: 'Plano de Saúde', value: 300, type: 'fixed', isMonthly: true, months: 12 },
      { id: '19', name: '13º Salário', value: 100, type: 'percentage', isMonthly: false, months: 1 },
      { id: '20', name: 'Férias', value: 133.33, type: 'percentage', isMonthly: false, months: 1 }
    ],
    charges: [
      { id: '13', name: 'INSS', percentage: 20, baseIncludesBenefits: false },
      { id: '14', name: 'FGTS', percentage: 8, baseIncludesBenefits: false },
      { id: '15', name: 'PIS/PASEP', percentage: 1, baseIncludesBenefits: false },
      { id: '16', name: 'Provisão para Rescisão', percentage: 4, baseIncludesBenefits: true }
    ],
    quantity: 2,
    totalCost: 11760,
    costCenterId: '2',
    fiscalYearId: '1',
    isActive: false,
    companyId: '2',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    createdBy: 'Ana Rodrigues'
  }
];

export function useLaborBudget() {
  const { activeCompany } = useAuth();
  const [laborBudgets, setLaborBudgets] = useState<LaborBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchLaborBudgets = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtra mão de obra pela empresa ativa
        const filteredLaborBudgets = activeCompany 
          ? mockLaborBudgets.filter(labor => labor.companyId === activeCompany.id)
          : mockLaborBudgets;
        
        setLaborBudgets(filteredLaborBudgets);
      } catch (err) {
        setError('Erro ao carregar dados de mão de obra. Por favor, tente novamente.');
        console.error('Erro ao buscar mão de obra:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaborBudgets();
  }, [activeCompany]);

  // Calcula o custo total de um item de mão de obra
  const calculateTotalCost = (
    baseSalary: number,
    benefits: Omit<LaborBudget['benefits'][0], 'id'>[],
    charges: Omit<LaborBudget['charges'][0], 'id'>[],
    quantity: number
  ): number => {
    // Calcula o custo mensal dos benefícios fixos
    const monthlyFixedBenefits = benefits
      .filter(b => b.type === 'fixed' && b.isMonthly)
      .reduce((sum, b) => sum + b.value, 0);
    
    // Calcula o valor anualizado dos benefícios fixos
    const annualFixedBenefits = benefits
      .filter(b => b.type === 'fixed')
      .reduce((sum, b) => sum + (b.value * b.months), 0);
    
    // Calcula o valor dos benefícios percentuais
    const percentageBenefits = benefits
      .filter(b => b.type === 'percentage')
      .reduce((sum, b) => sum + ((baseSalary * b.value / 100) * b.months), 0);
    
    // Calcula o total de benefícios
    const totalBenefits = annualFixedBenefits + percentageBenefits;
    
    // Calcula os encargos
    const chargesAmount = charges.reduce((sum, charge) => {
      const base = charge.baseIncludesBenefits 
        ? baseSalary * 12 + totalBenefits 
        : baseSalary * 12;
      return sum + (base * charge.percentage / 100);
    }, 0);
    
    // Calcula o custo total anual por funcionário
    const annualCostPerEmployee = baseSalary * 12 + totalBenefits + chargesAmount;
    
    // Multiplica pelo número de funcionários
    return annualCostPerEmployee * quantity;
  };

  const addLaborBudget = async (laborData: LaborBudgetFormData): Promise<LaborBudget> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }
      
      // Calcula o custo total
      const totalCost = calculateTotalCost(
        laborData.baseSalary,
        laborData.benefits,
        laborData.charges,
        laborData.quantity
      );
      
      // Gera IDs para benefícios e encargos
      const benefitsWithIds = laborData.benefits.map((benefit, index) => ({
        ...benefit,
        id: `new-benefit-${index + 1}`
      }));
      
      const chargesWithIds = laborData.charges.map((charge, index) => ({
        ...charge,
        id: `new-charge-${index + 1}`
      }));
      
      const newLaborBudget: LaborBudget = {
        id: Date.now().toString(),
        ...laborData,
        benefits: benefitsWithIds,
        charges: chargesWithIds,
        totalCost,
        companyId: activeCompany.id,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        createdBy: 'Usuário Atual' // Em uma implementação real, viria do contexto de autenticação
      };
      
      setLaborBudgets(prev => [newLaborBudget, ...prev]);
      return newLaborBudget;
    } catch (err) {
      setError('Erro ao adicionar mão de obra. Por favor, tente novamente.');
      console.error('Erro ao adicionar mão de obra:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateLaborBudget = async (id: string, updates: Partial<LaborBudgetFormData>): Promise<LaborBudget> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedLaborBudget: LaborBudget | undefined;
      
      setLaborBudgets(prev => 
        prev.map(labor => {
          if (labor.id === id) {
            // Se estamos atualizando dados que afetam o custo total, recalcule-o
            let totalCost = labor.totalCost;
            
            if (
              updates.baseSalary !== undefined || 
              updates.benefits !== undefined || 
              updates.charges !== undefined || 
              updates.quantity !== undefined
            ) {
              const baseSalary = updates.baseSalary ?? labor.baseSalary;
              const benefits = updates.benefits 
                ? updates.benefits.map((b, i) => ({ ...b, id: `updated-benefit-${i + 1}` }))
                : labor.benefits;
              const charges = updates.charges 
                ? updates.charges.map((c, i) => ({ ...c, id: `updated-charge-${i + 1}` }))
                : labor.charges;
              const quantity = updates.quantity ?? labor.quantity;
              
              totalCost = calculateTotalCost(
                baseSalary,
                benefits,
                charges,
                quantity
              );
            }
            
            updatedLaborBudget = {
              ...labor,
              ...updates,
              benefits: updates.benefits 
                ? updates.benefits.map((b, i) => ({ ...b, id: `updated-benefit-${i + 1}` }))
                : labor.benefits,
              charges: updates.charges 
                ? updates.charges.map((c, i) => ({ ...c, id: `updated-charge-${i + 1}` }))
                : labor.charges,
              totalCost,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedLaborBudget;
          }
          return labor;
        })
      );
      
      if (!updatedLaborBudget) {
        throw new Error('Mão de obra não encontrada');
      }
      
      return updatedLaborBudget;
    } catch (err) {
      setError('Erro ao atualizar mão de obra. Por favor, tente novamente.');
      console.error('Erro ao atualizar mão de obra:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLaborBudget = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLaborBudgets(prev => prev.filter(labor => labor.id !== id));
    } catch (err) {
      setError('Erro ao excluir mão de obra. Por favor, tente novamente.');
      console.error('Erro ao excluir mão de obra:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getLaborBudgetById = (id: string): LaborBudget | undefined => {
    return laborBudgets.find(labor => labor.id === id);
  };

  const getFilteredLaborBudgets = (
    searchTerm: string = '', 
    departmentFilter: string = 'all',
    statusFilter: string = 'all',
    costCenterFilter: string = 'all',
    fiscalYearFilter: string = 'all'
  ): LaborBudget[] => {
    let filtered = laborBudgets;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(labor => 
        labor.position.toLowerCase().includes(term) ||
        labor.department.toLowerCase().includes(term)
      );
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(labor => labor.department === departmentFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(labor => labor.isActive === isActive);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(labor => labor.costCenterId === costCenterFilter);
    }

    if (fiscalYearFilter !== 'all') {
      filtered = filtered.filter(labor => labor.fiscalYearId === fiscalYearFilter);
    }

    return filtered;
  };

  const getDepartments = (): string[] => {
    const departments = [...new Set(laborBudgets.map(labor => labor.department))];
    return departments.sort();
  };

  const getTotalCostByDepartment = (department: string): number => {
    return laborBudgets
      .filter(labor => labor.department === department && labor.isActive)
      .reduce((sum, labor) => sum + labor.totalCost, 0);
  };

  const getTotalCostByCostCenter = (costCenterId: string): number => {
    return laborBudgets
      .filter(labor => labor.costCenterId === costCenterId && labor.isActive)
      .reduce((sum, labor) => sum + labor.totalCost, 0);
  };

  const getTotalCostByFiscalYear = (fiscalYearId: string): number => {
    return laborBudgets
      .filter(labor => labor.fiscalYearId === fiscalYearId && labor.isActive)
      .reduce((sum, labor) => sum + labor.totalCost, 0);
  };

  return {
    laborBudgets,
    isLoading,
    error,
    addLaborBudget,
    updateLaborBudget,
    deleteLaborBudget,
    getLaborBudgetById,
    getFilteredLaborBudgets,
    getDepartments,
    getTotalCostByDepartment,
    getTotalCostByCostCenter,
    getTotalCostByFiscalYear,
    calculateTotalCost,
    defaultBenefits,
    defaultCharges
  };
}