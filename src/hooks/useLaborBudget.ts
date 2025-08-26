import { useState, useEffect } from 'react';
import { LaborBudget, LaborBudgetFormData, defaultBenefits, defaultCharges } from '../types/laborBudget';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToLaborBudget = (data: any): LaborBudget => ({
  id: data.id,
  position: data.position,
  department: data.department,
  baseSalary: parseFloat(data.base_salary) || 0,
  benefits: data.benefits || [],
  charges: data.charges || [],
  quantity: data.quantity || 1,
  totalCost: parseFloat(data.total_cost) || 0,
  costCenterId: data.cost_center_id,
  fiscalYearId: data.fiscal_year_id,
  isActive: data.is_active,
  companyId: data.company_id,
  createdAt: data.created_at?.split('T')[0] || '',
  updatedAt: data.updated_at?.split('T')[0] || '',
  createdBy: data.created_by
});

// Função para converter dados da aplicação para o formato do Supabase
const mapLaborBudgetToSupabase = (laborBudget: LaborBudgetFormData & { totalCost: number }) => ({
  position: laborBudget.position,
  department: laborBudget.department,
  base_salary: laborBudget.baseSalary,
  benefits: laborBudget.benefits,
  charges: laborBudget.charges,
  quantity: laborBudget.quantity,
  total_cost: laborBudget.totalCost,
  cost_center_id: laborBudget.costCenterId,
  fiscal_year_id: laborBudget.fiscalYearId,
  is_active: laborBudget.isActive
});

export function useLaborBudget() {
  const { activeCompany, user } = useAuth();
  const [laborBudgets, setLaborBudgets] = useState<LaborBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaborBudgets = async () => {
      if (!activeCompany) {
        setLaborBudgets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('labor_budget')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedLaborBudgets = data?.map(mapSupabaseToLaborBudget) || [];
        setLaborBudgets(mappedLaborBudgets);
      } catch (err) {
        console.error('Erro ao buscar mão de obra:', err);
        setError('Erro ao carregar dados de mão de obra. Por favor, tente novamente.');
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
    try {
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
      
      const supabaseData = {
        ...mapLaborBudgetToSupabase({ ...laborData, totalCost }),
        company_id: activeCompany.id,
        created_by: user?.name || 'Usuário Atual'
      };

      const { data, error } = await supabase
        .from('labor_budget')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newLaborBudget = mapSupabaseToLaborBudget(data);
      setLaborBudgets(prev => [newLaborBudget, ...prev]);
      
      return newLaborBudget;
    } catch (err) {
      console.error('Erro ao adicionar mão de obra:', err);
      setError('Erro ao adicionar mão de obra. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateLaborBudget = async (id: string, updates: Partial<LaborBudgetFormData>): Promise<LaborBudget> => {
    try {
      // Busca o registro atual para calcular o novo custo total
      const currentLaborBudget = laborBudgets.find(l => l.id === id);
      if (!currentLaborBudget) {
        throw new Error('Registro de mão de obra não encontrado');
      }
      
      // Mescla os dados atuais com as atualizações
      const updatedData = {
        baseSalary: updates.baseSalary ?? currentLaborBudget.baseSalary,
        benefits: updates.benefits ?? currentLaborBudget.benefits,
        charges: updates.charges ?? currentLaborBudget.charges,
        quantity: updates.quantity ?? currentLaborBudget.quantity,
        position: updates.position ?? currentLaborBudget.position,
        department: updates.department ?? currentLaborBudget.department,
        costCenterId: updates.costCenterId ?? currentLaborBudget.costCenterId,
        fiscalYearId: updates.fiscalYearId ?? currentLaborBudget.fiscalYearId,
        isActive: updates.isActive ?? currentLaborBudget.isActive
      };
      
      // Calcula o novo custo total
      const totalCost = calculateTotalCost(
        updatedData.baseSalary,
        updatedData.benefits,
        updatedData.charges,
        updatedData.quantity
      );
      
      const supabaseUpdates = mapLaborBudgetToSupabase({ ...updatedData, totalCost });

      const { data, error } = await supabase
        .from('labor_budget')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedLaborBudget = mapSupabaseToLaborBudget(data);
      setLaborBudgets(prev => 
        prev.map(labor => labor.id === id ? updatedLaborBudget : labor)
      );
      
      return updatedLaborBudget;
    } catch (err) {
      console.error('Erro ao atualizar mão de obra:', err);
      setError('Erro ao atualizar mão de obra. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteLaborBudget = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('labor_budget')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLaborBudgets(prev => prev.filter(labor => labor.id !== id));
    } catch (err) {
      console.error('Erro ao excluir mão de obra:', err);
      setError('Erro ao excluir mão de obra. Por favor, tente novamente.');
      throw err;
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