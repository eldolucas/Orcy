import { useState, useEffect } from 'react';
import { BudgetPlan, Forecast, VarianceAnalysis, KPI, BudgetTemplate } from '../types';

// Mock data for planning
const mockBudgetPlans: BudgetPlan[] = [
  {
    id: '1',
    name: 'Plano Orçamentário TI 2025',
    description: 'Planejamento estratégico para o departamento de TI',
    fiscalYearId: '2',
    costCenterId: '1',
    planType: 'annual',
    status: 'review',
    totalPlanned: 950000,
    categories: [
      {
        id: '1',
        name: 'Infraestrutura',
        plannedAmount: 400000,
        growthRate: 15,
        seasonality: [1.0, 1.0, 1.2, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.3],
        priority: 'high',
        justification: 'Expansão da infraestrutura cloud e modernização de servidores'
      },
      {
        id: '2',
        name: 'Desenvolvimento',
        plannedAmount: 350000,
        growthRate: 20,
        seasonality: [1.0, 1.0, 1.0, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 1.0, 1.0],
        priority: 'high',
        justification: 'Contratação de novos desenvolvedores e ferramentas'
      },
      {
        id: '3',
        name: 'Licenças',
        plannedAmount: 200000,
        growthRate: 10,
        seasonality: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
        priority: 'medium',
        justification: 'Renovação e novas licenças de software'
      }
    ],
    assumptions: [
      {
        id: '1',
        category: 'Crescimento',
        description: 'Taxa de crescimento da empresa',
        value: 15,
        unit: '%',
        impact: 'high',
        confidence: 85,
        source: 'Projeção comercial'
      },
      {
        id: '2',
        category: 'Inflação',
        description: 'Inflação anual estimada',
        value: 4.5,
        unit: '%',
        impact: 'medium',
        confidence: 70,
        source: 'Banco Central'
      }
    ],
    scenarios: [
      {
        id: '1',
        name: 'Cenário Otimista',
        description: 'Crescimento acelerado e economia favorável',
        type: 'optimistic',
        adjustmentFactor: 1.2,
        assumptions: ['Crescimento 25%', 'Inflação 3%'],
        projectedTotal: 1140000,
        isDefault: false
      },
      {
        id: '2',
        name: 'Cenário Realista',
        description: 'Crescimento moderado conforme planejado',
        type: 'realistic',
        adjustmentFactor: 1.0,
        assumptions: ['Crescimento 15%', 'Inflação 4.5%'],
        projectedTotal: 950000,
        isDefault: true
      },
      {
        id: '3',
        name: 'Cenário Pessimista',
        description: 'Crescimento limitado e pressões econômicas',
        type: 'pessimistic',
        adjustmentFactor: 0.8,
        assumptions: ['Crescimento 5%', 'Inflação 6%'],
        projectedTotal: 760000,
        isDefault: false
      }
    ],
    createdBy: 'João Silva',
    createdAt: '2024-10-15',
    lastUpdated: '2024-11-20'
  }
];

const mockForecasts: Forecast[] = [
  {
    id: '1',
    name: 'Projeção Despesas TI 2025',
    description: 'Projeção mensal de despesas do departamento de TI',
    type: 'expense',
    method: 'seasonal',
    period: 'monthly',
    horizon: 12,
    baseData: [
      { period: '2024-01', actual: 65000, projected: 65000, lowerBound: 62000, upperBound: 68000, confidence: 95 },
      { period: '2024-02', actual: 67000, projected: 66000, lowerBound: 63000, upperBound: 69000, confidence: 93 },
      { period: '2024-03', actual: 72000, projected: 70000, lowerBound: 67000, upperBound: 73000, confidence: 91 }
    ],
    projections: [
      { period: '2025-01', projected: 75000, lowerBound: 70000, upperBound: 80000, confidence: 85 },
      { period: '2025-02', projected: 77000, lowerBound: 72000, upperBound: 82000, confidence: 83 },
      { period: '2025-03', projected: 83000, lowerBound: 78000, upperBound: 88000, confidence: 81 }
    ],
    accuracy: 87.5,
    confidence: 83,
    createdBy: 'Ana Rodrigues',
    createdAt: '2024-11-01',
    lastUpdated: '2024-11-20'
  }
];

const mockKPIs: KPI[] = [
  {
    id: '1',
    name: 'Execução Orçamentária',
    description: 'Percentual de execução do orçamento anual',
    category: 'Financeiro',
    formula: '(Gasto Atual / Orçamento Total) * 100',
    target: 85,
    current: 79,
    trend: 'up',
    status: 'good',
    unit: '%',
    frequency: 'monthly',
    owner: 'Maria Santos',
    lastUpdated: '2024-11-20'
  },
  {
    id: '2',
    name: 'ROI de Projetos',
    description: 'Retorno sobre investimento dos projetos',
    category: 'Performance',
    formula: '(Receita - Investimento) / Investimento * 100',
    target: 150,
    current: 135,
    trend: 'stable',
    status: 'warning',
    unit: '%',
    frequency: 'quarterly',
    owner: 'João Silva',
    lastUpdated: '2024-11-15'
  },
  {
    id: '3',
    name: 'Variação Orçamentária',
    description: 'Desvio médio entre planejado e realizado',
    category: 'Controle',
    formula: 'ABS((Realizado - Planejado) / Planejado) * 100',
    target: 5,
    current: 8.2,
    trend: 'down',
    status: 'warning',
    unit: '%',
    frequency: 'monthly',
    owner: 'Pedro Costa',
    lastUpdated: '2024-11-20'
  }
];

export function usePlanning() {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setBudgetPlans(mockBudgetPlans);
      setForecasts(mockForecasts);
      setKPIs(mockKPIs);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const createBudgetPlan = (plan: Omit<BudgetPlan, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newPlan: BudgetPlan = {
      ...plan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setBudgetPlans(prev => [newPlan, ...prev]);
    return newPlan;
  };

  const updateBudgetPlan = (id: string, updates: Partial<BudgetPlan>) => {
    setBudgetPlans(prev => 
      prev.map(plan => 
        plan.id === id 
          ? { 
              ...plan, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : plan
      )
    );
  };

  const deleteBudgetPlan = (id: string) => {
    setBudgetPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const createForecast = (forecast: Omit<Forecast, 'id' | 'createdAt' | 'lastUpdated'>) => {
    const newForecast: Forecast = {
      ...forecast,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setForecasts(prev => [newForecast, ...prev]);
    return newForecast;
  };

  const updateForecast = (id: string, updates: Partial<Forecast>) => {
    setForecasts(prev => 
      prev.map(forecast => 
        forecast.id === id 
          ? { 
              ...forecast, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : forecast
      )
    );
  };

  const deleteForecast = (id: string) => {
    setForecasts(prev => prev.filter(forecast => forecast.id !== id));
  };

  const generateProjections = (
    baseData: ForecastDataPoint[], 
    method: 'linear' | 'exponential' | 'seasonal' | 'regression',
    horizon: number
  ): ForecastDataPoint[] => {
    const projections: ForecastDataPoint[] = [];
    const actualValues = baseData.map(data => data.actual || data.projected);
    
    switch (method) {
      case 'linear':
        const trend = actualValues.length > 1 
          ? (actualValues[actualValues.length - 1] - actualValues[0]) / (actualValues.length - 1)
          : 0;
        
        for (let i = 0; i < horizon; i++) {
          const projected = actualValues[actualValues.length - 1] + (trend * (i + 1));
          const adjustedProjected = Math.max(0, projected);
          projections.push({
            period: `Período ${i + 1}`,
            projected: adjustedProjected,
            lowerBound: adjustedProjected * 0.9,
            upperBound: adjustedProjected * 1.1,
            confidence: Math.max(60, 90 - (i * 2))
          });
        }
        break;
        
      case 'exponential':
        const growthRate = actualValues.length > 1
          ? Math.pow(actualValues[actualValues.length - 1] / actualValues[0], 1 / (actualValues.length - 1)) - 1
          : 0.05;
        
        for (let i = 0; i < horizon; i++) {
          const projected = actualValues[actualValues.length - 1] * Math.pow(1 + growthRate, i + 1);
          projections.push({
            period: `Período ${i + 1}`,
            projected: projected,
            lowerBound: projected * 0.85,
            upperBound: projected * 1.15,
            confidence: Math.max(50, 85 - (i * 3))
          });
        }
        break;
        
      case 'seasonal':
        const seasonalPattern = [1.0, 0.95, 1.1, 1.05, 1.0, 0.9, 0.85, 0.9, 1.05, 1.15, 1.1, 1.2];
        const baseValue = actualValues.reduce((sum, val) => sum + val, 0) / actualValues.length;
        
        for (let i = 0; i < horizon; i++) {
          const seasonalFactor = seasonalPattern[i % 12];
          const projected = baseValue * seasonalFactor * (1 + 0.05); // 5% growth
          projections.push({
            period: `Período ${i + 1}`,
            projected: projected,
            lowerBound: projected * 0.8,
            upperBound: projected * 1.2,
            confidence: Math.max(60, 80 - (i * 2))
          });
        }
        break;

      case 'regression':
        // Simplified linear regression
        const n = actualValues.length;
        const sumX = actualValues.reduce((sum, _, index) => sum + index, 0);
        const sumY = actualValues.reduce((sum, val) => sum + val, 0);
        const sumXY = actualValues.reduce((sum, val, index) => sum + (index * val), 0);
        const sumXX = actualValues.reduce((sum, _, index) => sum + (index * index), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        for (let i = 0; i < horizon; i++) {
          const x = actualValues.length + i;
          const projected = Math.max(0, slope * x + intercept);
          projections.push({
            period: `Período ${i + 1}`,
            projected: projected,
            lowerBound: projected * 0.88,
            upperBound: projected * 1.12,
            confidence: Math.max(65, 88 - (i * 2))
          });
        }
        break;
    }
    
    return projections;
  };

  const calculateVarianceAnalysis = (planned: number, actual: number) => {
    const variance = actual - planned;
    const variancePercentage = planned !== 0 ? (variance / planned) * 100 : 0;
    
    let status: 'favorable' | 'unfavorable' | 'neutral' = 'neutral';
    if (Math.abs(variancePercentage) > 5) {
      status = variancePercentage > 0 ? 'unfavorable' : 'favorable';
    }
    
    return {
      variance,
      variancePercentage,
      status
    };
  };

  const getFilteredPlans = (searchTerm: string, statusFilter: string, typeFilter: string) => {
    let filtered = budgetPlans;

    if (searchTerm) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(plan => plan.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(plan => plan.planType === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  };

  const getPlanningStats = () => {
    const totalPlans = budgetPlans.length;
    const draftPlans = budgetPlans.filter(p => p.status === 'draft').length;
    const reviewPlans = budgetPlans.filter(p => p.status === 'review').length;
    const approvedPlans = budgetPlans.filter(p => p.status === 'approved').length;
    const activePlans = budgetPlans.filter(p => p.status === 'active').length;

    return { totalPlans, draftPlans, reviewPlans, approvedPlans, activePlans };
  };

  return {
    budgetPlans,
    forecasts,
    kpis,
    isLoading,
    createBudgetPlan,
    updateBudgetPlan,
    deleteBudgetPlan,
    createForecast,
    updateForecast,
    deleteForecast,
    createKPI: (kpi: Omit<KPI, 'id' | 'lastUpdated'>) => {
      const newKPI: KPI = {
        ...kpi,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      
      setKPIs(prev => [newKPI, ...prev]);
      return newKPI;
    },
    updateKPI: (id: string, updates: Partial<KPI>) => {
      setKPIs(prev => 
        prev.map(kpi => 
          kpi.id === id 
            ? { 
                ...kpi, 
                ...updates, 
                lastUpdated: new Date().toISOString().split('T')[0]
              }
            : kpi
        )
      );
    },
    deleteKPI: (id: string) => {
      setKPIs(prev => prev.filter(kpi => kpi.id !== id));
    },
    generateProjections,
    calculateVarianceAnalysis,
    getFilteredPlans,
    getPlanningStats
  };
}