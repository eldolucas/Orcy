import { useState, useEffect } from 'react';
import { DashboardMetrics, Expense, Alert } from '../types';

// Mock data for demonstration
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Licenças de Software',
    amount: 15000,
    category: 'Tecnologia',
    costCenterId: '1',
    budgetId: '1',
    date: '2024-01-15',
    createdBy: 'João Silva',
    status: 'approved'
  },
  {
    id: '2',
    description: 'Campanha Google Ads',
    amount: 8500,
    category: 'Marketing',
    costCenterId: '2',
    budgetId: '2',
    date: '2024-01-14',
    createdBy: 'Maria Santos',
    status: 'approved'
  },
  {
    id: '3',
    description: 'Equipamentos de TI',
    amount: 25000,
    category: 'Infraestrutura',
    costCenterId: '1',
    budgetId: '1',
    date: '2024-01-13',
    createdBy: 'Pedro Costa',
    status: 'pending'
  },
  {
    id: '4',
    description: 'Treinamento Online',
    amount: 3200,
    category: 'Capacitação',
    costCenterId: '3',
    budgetId: '3',
    date: '2024-01-12',
    createdBy: 'Ana Silva',
    status: 'approved'
  }
];

const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Orçamento TI próximo do limite',
    message: 'O centro de custo TI atingiu 85% do orçamento mensal',
    costCenterId: '1',
    budgetId: '1',
    threshold: 85,
    isRead: false,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    type: 'danger',
    title: 'Orçamento Marketing ultrapassado',
    message: 'O orçamento de marketing digital ultrapassou 95% do valor planejado',
    costCenterId: '2',
    budgetId: '2',
    threshold: 95,
    isRead: false,
    createdAt: '2024-01-14'
  }
];

const mockMetrics: DashboardMetrics = {
  totalBudget: 1250000,
  totalSpent: 987500,
  totalRemaining: 262500,
  budgetUtilization: 79.0,
  monthlyTrend: 12.5,
  departmentBreakdown: [
    {
      department: 'Tecnologia',
      budgeted: 500000,
      spent: 387500,
      utilization: 77.5
    },
    {
      department: 'Marketing',
      budgeted: 250000,
      spent: 198750,
      utilization: 79.5
    },
    {
      department: 'Recursos Humanos',
      budgeted: 180000,
      spent: 156000,
      utilization: 86.7
    },
    {
      department: 'Financeiro',
      budgeted: 150000,
      spent: 112500,
      utilization: 75.0
    },
    {
      department: 'Operações',
      budgeted: 170000,
      spent: 132750,
      utilization: 78.1
    }
  ],
  recentTransactions: mockExpenses.slice(0, 4),
  activeAlerts: mockAlerts
};

export function useBudgetData() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMetrics(mockMetrics);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  return {
    metrics,
    isLoading,
    refetch: () => {
      setIsLoading(true);
      setTimeout(() => {
        setMetrics(mockMetrics);
        setIsLoading(false);
      }, 500);
    }
  };
}