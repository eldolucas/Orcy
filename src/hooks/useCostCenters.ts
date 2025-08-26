import { useState, useEffect } from 'react';
import { CostCenter } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Função para converter dados do Supabase para o formato da aplicação
const mapSupabaseToCostCenter = (data: any): CostCenter => ({
  id: data.id,
  name: data.name,
  code: data.code,
  description: data.description,
  department: data.department,
  manager: data.manager,
  parentId: data.parent_id,
  level: data.level,
  path: data.path,
  budget: parseFloat(data.budget) || 0,
  spent: parseFloat(data.spent) || 0,
  allocatedBudget: parseFloat(data.allocated_budget) || 0,
  inheritedBudget: parseFloat(data.inherited_budget) || 0,
  status: data.status,
  createdAt: data.created_at?.split('T')[0] || '',
  isExpanded: false // Propriedade local para controle da UI
});

// Função para converter dados da aplicação para o formato do Supabase
const mapCostCenterToSupabase = (costCenter: Partial<CostCenter>) => ({
  name: costCenter.name,
  code: costCenter.code,
  description: costCenter.description,
  department: costCenter.department,
  manager: costCenter.manager,
  parent_id: costCenter.parentId,
  level: costCenter.level,
  path: costCenter.path,
  budget: costCenter.budget,
  spent: costCenter.spent || 0,
  allocated_budget: costCenter.allocatedBudget,
  inherited_budget: costCenter.inheritedBudget || 0,
  status: costCenter.status
});

export function useCostCenters() {
  const { activeCompany } = useAuth();
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCostCenters = async () => {
      if (!activeCompany) {
        setCostCenters([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('cost_centers')
          .select('*')
          .eq('company_id', activeCompany.id)
          .order('level', { ascending: true })
          .order('path', { ascending: true });

        if (error) throw error;

        const mappedCostCenters = data?.map(mapSupabaseToCostCenter) || [];
        setCostCenters(mappedCostCenters);
      } catch (err) {
        console.error('Erro ao buscar centros de custo:', err);
        setError('Erro ao carregar centros de custo. Por favor, tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCostCenters();
  }, [activeCompany]);

  const addCostCenter = async (costCenterData: Partial<CostCenter>): Promise<CostCenter> => {
    try {
      if (!activeCompany) {
        throw new Error('Nenhuma empresa ativa selecionada');
      }

      const supabaseData = {
        ...mapCostCenterToSupabase(costCenterData),
        company_id: activeCompany.id
      };

      const { data, error } = await supabase
        .from('cost_centers')
        .insert([supabaseData])
        .select()
        .single();

      if (error) throw error;

      const newCostCenter = mapSupabaseToCostCenter(data);
      setCostCenters(prev => [...prev, newCostCenter]);
      
      return newCostCenter;
    } catch (err) {
      console.error('Erro ao adicionar centro de custo:', err);
      setError('Erro ao adicionar centro de custo. Por favor, tente novamente.');
      throw err;
    }
  };

  const updateCostCenter = async (id: string, updates: Partial<CostCenter>): Promise<CostCenter> => {
    try {
      const supabaseUpdates = mapCostCenterToSupabase(updates);

      const { data, error } = await supabase
        .from('cost_centers')
        .update(supabaseUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedCostCenter = mapSupabaseToCostCenter(data);
      setCostCenters(prev => 
        prev.map(center => center.id === id ? updatedCostCenter : center)
      );
      
      return updatedCostCenter;
    } catch (err) {
      console.error('Erro ao atualizar centro de custo:', err);
      setError('Erro ao atualizar centro de custo. Por favor, tente novamente.');
      throw err;
    }
  };

  const deleteCostCenter = async (id: string): Promise<void> => {
    try {
      // Verifica se há centros de custo filhos
      const hasChildren = costCenters.some(center => center.parentId === id);
      if (hasChildren) {
        throw new Error('Não é possível excluir um centro de custo que possui centros filhos');
      }

      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCostCenters(prev => prev.filter(center => center.id !== id));
    } catch (err) {
      console.error('Erro ao excluir centro de custo:', err);
      setError('Erro ao excluir centro de custo. Por favor, tente novamente.');
      throw err;
    }
  };

  const buildHierarchy = (centers: CostCenter[]): CostCenter[] => {
    const centerMap = new Map<string, CostCenter>();
    const rootCenters: CostCenter[] = [];

    // Create a map of all centers
    centers.forEach(center => {
      centerMap.set(center.id, { ...center, children: [] });
    });

    // Build the hierarchy
    centers.forEach(center => {
      const centerWithChildren = centerMap.get(center.id)!;
      
      if (center.parentId) {
        const parent = centerMap.get(center.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(centerWithChildren);
        }
      } else {
        rootCenters.push(centerWithChildren);
      }
    });

    return rootCenters;
  };

  const toggleExpansion = (centerId: string) => {
    setCostCenters(prev => 
      prev.map(center => 
        center.id === centerId 
          ? { ...center, isExpanded: !center.isExpanded }
          : center
      )
    );
  };

  const getFilteredCenters = (searchTerm: string, statusFilter: string) => {
    let filtered = costCenters;

    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.manager.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(center => center.status === statusFilter);
    }

    return filtered;
  };

  const getCostCenterById = (id: string): CostCenter | undefined => {
    return costCenters.find(center => center.id === id);
  };

  const getCostCentersByParent = (parentId: string | null): CostCenter[] => {
    return costCenters.filter(center => center.parentId === parentId);
  };

  const getCostCentersByDepartment = (department: string): CostCenter[] => {
    return costCenters.filter(center => center.department === department);
  };

  const getTotalBudgetByDepartment = (department: string): number => {
    return costCenters
      .filter(center => center.department === department && center.status === 'active')
      .reduce((sum, center) => sum + center.budget, 0);
  };

  const getTotalSpentByDepartment = (department: string): number => {
    return costCenters
      .filter(center => center.department === department && center.status === 'active')
      .reduce((sum, center) => sum + center.spent, 0);
  };

  const hierarchicalCenters = buildHierarchy(costCenters);

  return {
    costCenters,
    hierarchicalCenters,
    isLoading,
    error,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    toggleExpansion,
    getFilteredCenters,
    getCostCenterById,
    getCostCentersByParent,
    getCostCentersByDepartment,
    getTotalBudgetByDepartment,
    getTotalSpentByDepartment,
    setCostCenters
  };
}