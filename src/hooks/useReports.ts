import { useState } from 'react';
import { useBudgets } from './useBudgets';
import { useExpenses } from './useExpenses';
import { useRevenues } from './useRevenues';
import { useCostCenters } from './useCostCenters';

interface ReportFilters {
  fiscalYearId: string;
  costCenterId: string;
  startDate: string;
  endDate: string;
  period: string;
}

export interface BudgetExecutionData {
  costCenterName: string;
  budgeted: number;
  spent: number;
  revenue: number;
  utilization: number;
  variance: number;
  variancePercentage: number;
}

export interface VarianceAnalysisData {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  status: 'favorable' | 'unfavorable' | 'neutral';
}

export interface CashFlowData {
  period: string;
  revenues: number;
  expenses: number;
  netFlow: number;
  cumulativeFlow: number;
}

export interface DepartmentPerformanceData {
  department: string;
  budgetUtilization: number;
  revenueGenerated: number;
  efficiency: number;
  score: number;
}

export interface TrendAnalysisData {
  period: string;
  actual: number;
  trend: number;
  projection: number;
  confidence: number;
}

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);
  const { budgets } = useBudgets();
  const { expenses } = useExpenses();
  const { revenues } = useRevenues();
  const { costCenters } = useCostCenters();

  const generateBudgetExecutionReport = (filters: ReportFilters): BudgetExecutionData[] => {
    const filteredBudgets = budgets.filter(budget => {
      if (filters.fiscalYearId && budget.fiscalYearId !== filters.fiscalYearId) return false;
      if (filters.costCenterId !== 'all' && budget.costCenterId !== filters.costCenterId) return false;
      return true;
    });

    return filteredBudgets.map(budget => {
      const costCenter = costCenters.find(cc => cc.id === budget.costCenterId);
      const budgetExpenses = expenses.filter(exp => exp.budgetId === budget.id && exp.status === 'approved');
      const budgetRevenues = revenues.filter(rev => rev.budgetId === budget.id && rev.status === 'confirmed');
      
      const totalExpenses = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalRevenues = budgetRevenues.reduce((sum, rev) => sum + rev.amount, 0);
      const utilization = (totalExpenses / budget.totalBudget) * 100;
      const variance = budget.totalBudget - totalExpenses;
      const variancePercentage = (variance / budget.totalBudget) * 100;

      return {
        costCenterName: costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado',
        budgeted: budget.totalBudget,
        spent: totalExpenses,
        revenue: totalRevenues,
        utilization,
        variance,
        variancePercentage
      };
    });
  };

  const generateVarianceAnalysisReport = (filters: ReportFilters): VarianceAnalysisData[] => {
    const categories = ['Infraestrutura', 'Desenvolvimento', 'Marketing', 'Recursos Humanos', 'Operações'];
    
    return categories.map(category => {
      const categoryExpenses = expenses.filter(exp => 
        exp.category.toLowerCase().includes(category.toLowerCase()) && 
        exp.status === 'approved'
      );
      
      const categoryBudgets = budgets.filter(budget => {
        const hasCategory = budget.categories.some(cat => 
          cat.name.toLowerCase().includes(category.toLowerCase())
        );
        return hasCategory;
      });

      const budgeted = categoryBudgets.reduce((sum, budget) => {
        const categoryBudget = budget.categories.find(cat => 
          cat.name.toLowerCase().includes(category.toLowerCase())
        );
        return sum + (categoryBudget?.budgeted || 0);
      }, 0);

      const actual = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const variance = budgeted - actual;
      const variancePercentage = budgeted > 0 ? (variance / budgeted) * 100 : 0;
      
      let status: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
      if (variancePercentage > 5) status = 'favorable';
      else if (variancePercentage < -5) status = 'unfavorable';

      return {
        category,
        budgeted,
        actual,
        variance,
        variancePercentage,
        status
      };
    });
  };

  const generateCashFlowReport = (filters: ReportFilters): CashFlowData[] => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let cumulativeFlow = 0;

    return months.map((month, index) => {
      const monthRevenues = revenues.filter(rev => {
        const revDate = new Date(rev.date);
        return revDate.getMonth() === index && rev.status === 'confirmed';
      }).reduce((sum, rev) => sum + rev.amount, 0);

      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === index && exp.status === 'approved';
      }).reduce((sum, exp) => sum + exp.amount, 0);

      const netFlow = monthRevenues - monthExpenses;
      cumulativeFlow += netFlow;

      return {
        period: month,
        revenues: monthRevenues,
        expenses: monthExpenses,
        netFlow,
        cumulativeFlow
      };
    });
  };

  const generateDepartmentPerformanceReport = (filters: ReportFilters): DepartmentPerformanceData[] => {
    const departments = [...new Set(costCenters.map(cc => cc.department))];

    return departments.map(department => {
      const deptCostCenters = costCenters.filter(cc => cc.department === department);
      const deptBudgets = budgets.filter(budget => 
        deptCostCenters.some(cc => cc.id === budget.costCenterId)
      );

      const totalBudget = deptBudgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
      const totalSpent = deptBudgets.reduce((sum, budget) => sum + budget.spent, 0);
      const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

      const deptRevenues = revenues.filter(rev => 
        deptCostCenters.some(cc => cc.id === rev.costCenterId) && rev.status === 'confirmed'
      );
      const revenueGenerated = deptRevenues.reduce((sum, rev) => sum + rev.amount, 0);

      const efficiency = revenueGenerated > 0 ? (revenueGenerated / totalSpent) * 100 : 0;
      
      // Score baseado em utilização do orçamento e eficiência
      let score = 0;
      if (budgetUtilization <= 90) score += 40;
      else if (budgetUtilization <= 100) score += 30;
      else score += 10;

      if (efficiency >= 150) score += 60;
      else if (efficiency >= 100) score += 40;
      else if (efficiency >= 50) score += 20;

      return {
        department,
        budgetUtilization,
        revenueGenerated,
        efficiency,
        score
      };
    });
  };

  const generateTrendAnalysisReport = (filters: ReportFilters): TrendAnalysisData[] => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return months.map((month, index) => {
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === index && exp.status === 'approved';
      }).reduce((sum, exp) => sum + exp.amount, 0);

      // Simulação de tendência e projeção
      const trend = monthExpenses * (1 + (Math.random() - 0.5) * 0.1);
      const projection = trend * (1 + (index / 12) * 0.05);
      const confidence = Math.max(60, 100 - (index * 3));

      return {
        period: month,
        actual: monthExpenses,
        trend,
        projection,
        confidence
      };
    });
  };

  const generateReport = async (reportType: string, filters: ReportFilters) => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (reportType) {
        case 'budget-execution':
          return generateBudgetExecutionReport(filters);
        case 'variance-analysis':
          return generateVarianceAnalysisReport(filters);
        case 'cash-flow':
          return generateCashFlowReport(filters);
        case 'department-performance':
          return generateDepartmentPerformanceReport(filters);
        case 'trend-analysis':
          return generateTrendAnalysisReport(filters);
        default:
          return [];
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = async (reportType: string, filters: ReportFilters, format: 'pdf' | 'excel') => {
    setIsLoading(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would generate and download the file
      const fileName = `relatorio-${reportType}-${new Date().toISOString().split('T')[0]}.${format}`;
      console.log(`Exportando relatório: ${fileName}`);
      
      // Simulate file download
      alert(`Relatório ${fileName} foi gerado com sucesso!`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateReport,
    exportReport,
    generateBudgetExecutionReport,
    generateVarianceAnalysisReport,
    generateCashFlowReport,
    generateDepartmentPerformanceReport,
    generateTrendAnalysisReport,
    isLoading
  };
}