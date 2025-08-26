import { useState, useEffect } from 'react';
import { Revenue } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Mock data for revenues
const mockRevenues: Revenue[] = [
  {
    id: '1',
    description: 'Receita de Vendas - Janeiro',
    amount: 150000,
    source: 'Vendas Diretas',
    costCenterId: '2',
    budgetId: '2',
    fiscalYearId: '1',
    date: '2024-01-31',
    createdBy: 'Maria Santos',
    status: 'confirmed',
    lastUpdated: '2024-02-01',
    confirmedBy: 'João Silva',
    confirmedAt: '2024-02-01',
    notes: 'Receita mensal de vendas diretas',
    recurrenceType: 'monthly',
    nextRecurrenceDate: '2024-02-28'
  },
  {
    id: '2',
    description: 'Licenciamento de Software',
    amount: 45000,
    source: 'Licenças',
    costCenterId: '1',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-15',
    createdBy: 'Carlos Oliveira',
    status: 'confirmed',
    lastUpdated: '2024-01-16',
    confirmedBy: 'João Silva',
    confirmedAt: '2024-01-16',
    notes: 'Receita trimestral de licenciamento',
    recurrenceType: 'quarterly',
    nextRecurrenceDate: '2024-04-15'
  },
  {
    id: '3',
    description: 'Consultoria Especializada',
    amount: 25000,
    source: 'Serviços',
    costCenterId: '1',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-20',
    createdBy: 'Ana Rodrigues',
    status: 'pending',
    lastUpdated: '2024-01-20',
    notes: 'Projeto de consultoria em andamento'
  },
  {
    id: '4',
    description: 'Receita de Publicidade',
    amount: 12000,
    source: 'Publicidade',
    costCenterId: '21',
    budgetId: '2',
    fiscalYearId: '1',
    date: '2024-01-25',
    createdBy: 'Juliana Costa',
    status: 'confirmed',
    lastUpdated: '2024-01-26',
    confirmedBy: 'Ricardo Pereira',
    confirmedAt: '2024-01-26',
    notes: 'Receita de campanhas publicitárias'
  },
  {
    id: '5',
    description: 'Venda de Equipamentos',
    amount: 8500,
    source: 'Vendas de Ativos',
    costCenterId: '12',
    budgetId: '1',
    fiscalYearId: '1',
    date: '2024-01-10',
    createdBy: 'Roberto Lima',
    status: 'cancelled',
    lastUpdated: '2024-01-12',
    cancelledBy: 'João Silva',
    cancelledAt: '2024-01-12',
    notes: 'Venda cancelada por problemas técnicos'
  },
  {
    id: '6',
    description: 'Receita de Treinamentos',
    amount: 18000,
    source: 'Educação',
    costCenterId: '3',
    budgetId: '3',
    fiscalYearId: '1',
    date: '2024-01-28',
    createdBy: 'Pedro Costa',
    status: 'confirmed',
    lastUpdated: '2024-01-29',
    confirmedBy: 'Maria Santos',
    confirmedAt: '2024-01-29',
    notes: 'Receita de cursos e treinamentos corporativos'
  }
];

export function useRevenues() {
  const { activeCompany } = useAuth();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filtrar receitas pela empresa ativa (simulação)
      // Em uma implementação real, isso seria feito no backend
      const filteredRevenues = activeCompany 
        ? mockRevenues.filter(revenue => {
            // Aqui estamos simulando que as primeiras 3 receitas pertencem à empresa 1
            // e as outras à empresa 2
            if (activeCompany.id === '1' && ['1', '2', '3'].includes(revenue.id)) {
              return true;
            } else if (activeCompany.id === '2' && ['4', '5', '6'].includes(revenue.id)) {
              return true;
            }
            return false;
          })
        : mockRevenues;
      
      setRevenues(filteredRevenues);
      setIsLoading(false);
    };

    fetchData();
  }, [activeCompany]);

  const addRevenue = (newRevenue: Omit<Revenue, 'id' | 'lastUpdated'>) => {
    const revenue: Revenue = {
      ...newRevenue,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setRevenues(prev => [revenue, ...prev]);
    return revenue;
  };

  const updateRevenue = (id: string, updates: Partial<Revenue>) => {
    setRevenues(prev => 
      prev.map(revenue => 
        revenue.id === id 
          ? { 
              ...revenue, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : revenue
      )
    );
  };

  const deleteRevenue = (id: string) => {
    setRevenues(prev => prev.filter(revenue => revenue.id !== id));
  };

  const confirmRevenue = (id: string, confirmedBy: string) => {
    updateRevenue(id, {
      status: 'confirmed',
      confirmedBy,
      confirmedAt: new Date().toISOString().split('T')[0]
    });
  };

  const cancelRevenue = (id: string, cancelledBy: string, notes?: string) => {
    updateRevenue(id, {
      status: 'cancelled',
      cancelledBy,
      cancelledAt: new Date().toISOString().split('T')[0],
      notes
    });
  };

  const getFilteredRevenues = (
    searchTerm: string, 
    statusFilter: string, 
    costCenterFilter: string = 'all',
    sourceFilter: string = 'all',
    dateRange: { start?: string; end?: string } = {}
  ) => {
    let filtered = revenues;

    if (searchTerm) {
      filtered = filtered.filter(revenue =>
        revenue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        revenue.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.status === statusFilter);
    }

    if (costCenterFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.costCenterId === costCenterFilter);
    }

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(revenue => revenue.source === sourceFilter);
    }

    if (dateRange.start) {
      filtered = filtered.filter(revenue => revenue.date >= dateRange.start!);
    }

    if (dateRange.end) {
      filtered = filtered.filter(revenue => revenue.date <= dateRange.end!);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getRevenuesByCostCenter = (costCenterId: string) => {
    return revenues.filter(revenue => revenue.costCenterId === costCenterId);
  };

  const getRevenuesByBudget = (budgetId: string) => {
    return revenues.filter(revenue => revenue.budgetId === budgetId);
  };

  const getRevenuesBySource = (source: string) => {
    return revenues.filter(revenue => revenue.source === source);
  };

  const getTotalRevenuesByStatus = (status: string) => {
    return revenues
      .filter(revenue => revenue.status === status)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  const getRevenueSources = () => {
    const sources = [...new Set(revenues.map(revenue => revenue.source))];
    return sources.sort();
  };

  const getMonthlyRevenues = (year: number, month: number) => {
    return revenues.filter(revenue => {
      const revenueDate = new Date(revenue.date);
      return revenueDate.getFullYear() === year && revenueDate.getMonth() === month - 1;
    });
  };

  const getRecurringRevenues = () => {
    return revenues.filter(revenue => 
      revenue.recurrenceType && revenue.recurrenceType !== 'none'
    );
  };

  return {
    revenues,
    isLoading,
    addRevenue,
    updateRevenue,
    deleteRevenue,
    confirmRevenue,
    cancelRevenue,
    getFilteredRevenues,
    getRevenuesByCostCenter,
    getRevenuesByBudget,
    getRevenuesBySource,
    getTotalRevenuesByStatus,
    getRevenueSources,
    getMonthlyRevenues,
    getRecurringRevenues
  };
}