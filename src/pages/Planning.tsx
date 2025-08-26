import React, { useState } from 'react';
import { TrendingUp, Target, BarChart3, Calendar, Plus, Search, Filter, Eye, Edit, CheckCircle, Clock, AlertTriangle, PieChart, Trash2 } from 'lucide-react';
import { BudgetPlanFormModal } from '../components/Planning/BudgetPlanFormModal';
import { BudgetPlanDetailsModal } from '../components/Planning/BudgetPlanDetailsModal';
import { ForecastFormModal } from '../components/Planning/ForecastFormModal';
import { KPIFormModal } from '../components/Planning/KPIFormModal';
import { usePlanning } from '../hooks/usePlanning';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { BudgetPlan, Forecast, KPI } from '../types';

export function Planning() {
  const { 
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
    createKPI,
    updateKPI,
    deleteKPI,
    getFilteredPlans,
    getPlanningStats 
  } = usePlanning();
  
  const { costCenters } = useCostCenters();
  const { fiscalYears } = useFiscalYears();
  
  const [activeTab, setActiveTab] = useState<'plans' | 'forecasts' | 'kpis' | 'scenarios'>('plans');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showKPIModal, setShowKPIModal] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<BudgetPlan | null>(null);
  const [planDetails, setPlanDetails] = useState<BudgetPlan | null>(null);
  const [forecastToEdit, setForecastToEdit] = useState<Forecast | null>(null);
  const [kpiToEdit, setKpiToEdit] = useState<KPI | null>(null);

  const handleSavePlan = (planData: Omit<BudgetPlan, 'id' | 'createdAt' | 'lastUpdated'> | BudgetPlan) => {
    if (planToEdit) {
      // Editing existing plan
      updateBudgetPlan(planToEdit.id, planData as Partial<BudgetPlan>);
    } else {
      // Creating new plan
      createBudgetPlan(planData as Omit<BudgetPlan, 'id' | 'createdAt' | 'lastUpdated'>);
    }
    setShowFormModal(false);
    setPlanToEdit(null);
  };

  const handleEditPlan = (plan: BudgetPlan) => {
    setPlanToEdit(plan);
    setShowFormModal(true);
  };

  const handleDeletePlan = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este plano orçamentário?')) {
      deleteBudgetPlan(id);
    }
  };

  const handleViewDetails = (plan: BudgetPlan) => {
    setPlanDetails(plan);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowFormModal(false);
    setShowDetailsModal(false);
    setShowForecastModal(false);
    setShowKPIModal(false);
    setPlanToEdit(null);
    setPlanDetails(null);
    setForecastToEdit(null);
    setKpiToEdit(null);
  };

  const handleSaveForecast = (forecastData: Omit<Forecast, 'id' | 'createdAt' | 'lastUpdated'> | Forecast) => {
    if (forecastToEdit) {
      // Editing existing forecast
      updateForecast(forecastToEdit.id, forecastData as Partial<Forecast>);
    } else {
      // Creating new forecast
      createForecast(forecastData as Omit<Forecast, 'id' | 'createdAt' | 'lastUpdated'>);
    }
    setShowForecastModal(false);
    setForecastToEdit(null);
  };

  const handleEditForecast = (forecast: Forecast) => {
    setForecastToEdit(forecast);
    setShowForecastModal(true);
  };

  const handleDeleteForecast = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta projeção?')) {
      deleteForecast(id);
    }
  };

  const handleSaveKPI = (kpiData: Omit<KPI, 'id' | 'lastUpdated'> | KPI) => {
    if (kpiToEdit) {
      // Editing existing KPI
      updateKPI(kpiToEdit.id, kpiData as Partial<KPI>);
    } else {
      // Creating new KPI
      createKPI(kpiData as Omit<KPI, 'id' | 'lastUpdated'>);
    }
    setShowKPIModal(false);
    setKpiToEdit(null);
  };

  const handleEditKPI = (kpi: KPI) => {
    setKpiToEdit(kpi);
    setShowKPIModal(true);
  };

  const handleDeleteKPI = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este KPI?')) {
      deleteKPI(id);
    }
  };

  const filteredPlans = getFilteredPlans(searchTerm, statusFilter, typeFilter);
  const stats = getPlanningStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Rascunho';
      case 'review':
        return 'Em Revisão';
      case 'approved':
        return 'Aprovado';
      case 'active':
        return 'Ativo';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'review':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'active':
        return <Target className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKPIStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Bom';
      case 'warning':
        return 'Atenção';
      case 'critical':
        return 'Crítico';
      default:
        return status;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 transform rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado';
  };

  const getFiscalYearName = (fiscalYearId: string) => {
    const fiscalYear = fiscalYears.find(fy => fy.id === fiscalYearId);
    return fiscalYear ? `${fiscalYear.name} (${fiscalYear.year})` : 'Exercício não encontrado';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Planejamento e Projeções</h1>
          <p className="text-gray-600 mt-1">Análise preditiva e planejamento estratégico</p>
        </div>
        <button 
          onClick={() => setShowFormModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Plano</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Planos</p>
              <p className="text-xl font-bold text-gray-800">{stats.totalPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rascunhos</p>
              <p className="text-xl font-bold text-gray-800">{stats.draftPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Revisão</p>
              <p className="text-xl font-bold text-gray-800">{stats.reviewPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-xl font-bold text-gray-800">{stats.approvedPlans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-xl font-bold text-gray-800">{stats.activePlans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'plans', label: 'Planos Orçamentários', icon: Target },
              { id: 'forecasts', label: 'Projeções', icon: TrendingUp },
              { id: 'kpis', label: 'Indicadores (KPIs)', icon: BarChart3 },
              { id: 'scenarios', label: 'Cenários', icon: PieChart }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Plans Tab */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar planos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os status</option>
                  <option value="draft">Rascunho</option>
                  <option value="review">Em Revisão</option>
                  <option value="approved">Aprovado</option>
                  <option value="active">Ativo</option>
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os tipos</option>
                  <option value="annual">Anual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>

              {/* Plans List */}
              <div className="space-y-4">
                {filteredPlans.map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Target className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                            <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                              {getStatusIcon(plan.status)}
                              <span>{getStatusLabel(plan.status)}</span>
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{plan.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="font-medium">Centro de Custo:</span>
                              <p>{getCostCenterName(plan.costCenterId)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Exercício:</span>
                              <p>{getFiscalYearName(plan.fiscalYearId)}</p>
                            </div>
                            <div>
                              <span className="font-medium">Tipo:</span>
                              <p className="capitalize">{plan.planType}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            R$ {plan.totalPlanned.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Planejado
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewDetails(plan)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPlan(plan)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar plano"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Excluir plano"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Categorias do Plano</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.categories.map((category) => (
                          <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-800">{category.name}</h5>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                category.priority === 'high' ? 'bg-red-100 text-red-800' :
                                category.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {category.priority === 'high' ? 'Alta' : 
                                 category.priority === 'medium' ? 'Média' : 'Baixa'}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Valor:</span>
                                <span className="font-medium">R$ {category.plannedAmount.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Crescimento:</span>
                                <span className="font-medium">{category.growthRate}%</span>
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 mt-2 italic">{category.justification}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scenarios */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Cenários de Planejamento</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plan.scenarios.map((scenario) => (
                          <div key={scenario.id} className={`p-3 rounded-lg border-2 ${
                            scenario.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-medium text-gray-800">{scenario.name}</h5>
                              {scenario.isDefault && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Padrão
                                </span>
                              )}
                            </div>
                            
                            <p className="text-xs text-gray-600 mb-2">{scenario.description}</p>
                            
                            <div className="text-sm">
                              <span className="text-gray-600">Projeção:</span>
                              <span className="font-bold text-gray-800 ml-1">
                                R$ {scenario.projectedTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecasts Tab */}
          {activeTab === 'forecasts' && (
            <div className="space-y-6">
              {/* Forecast Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Projeções e Previsões</h3>
                  <p className="text-sm text-gray-600">Análise preditiva baseada em dados históricos</p>
                </div>
                <button
                  onClick={() => setShowForecastModal(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Projeção</span>
                </button>
              </div>
              
              {/* Forecasts List */}
              {forecasts.length > 0 ? (
                <div className="space-y-4">
                  {forecasts.map((forecast) => (
                    <div key={forecast.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800">{forecast.name}</h3>
                            <p className="text-gray-600 mb-3">{forecast.description}</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Método:</span>
                                <p className="font-medium capitalize">{forecast.method}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Período:</span>
                                <p className="font-medium capitalize">{forecast.period}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Horizonte:</span>
                                <p className="font-medium">{forecast.horizon} períodos</p>
                              </div>
                              <div>
                                <span className="text-gray-600">Tipo:</span>
                                <p className="font-medium capitalize">
                                  {forecast.type === 'expense' ? 'Despesas' : 
                                   forecast.type === 'revenue' ? 'Receitas' : 'Orçamento'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm text-gray-600">Precisão:</span>
                              <span className="font-bold text-green-600">{forecast.accuracy.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Confiança:</span>
                              <span className="font-bold text-blue-600">{forecast.confidence.toFixed(1)}%</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditForecast(forecast)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Editar projeção"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteForecast(forecast.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Excluir projeção"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Base Data and Projections Preview */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Base Data */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Dados Base</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {forecast.baseData.slice(0, 5).map((data, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                                <span className="text-gray-600">{data.period}</span>
                                <span className="font-medium">R$ {(data.actual || data.projected).toLocaleString()}</span>
                              </div>
                            ))}
                            {forecast.baseData.length > 5 && (
                              <p className="text-xs text-gray-500 text-center">
                                ... e mais {forecast.baseData.length - 5} períodos
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Projections Preview */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Projeções</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {forecast.projections.slice(0, 5).map((projection, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-blue-50 rounded p-2">
                                <span className="text-gray-600">{projection.period}</span>
                                <div className="text-right">
                                  <span className="font-medium text-blue-600">R$ {projection.projected.toLocaleString()}</span>
                                  <span className="text-xs text-gray-500 block">
                                    {projection.confidence.toFixed(0)}% confiança
                                  </span>
                                </div>
                              </div>
                            ))}
                            {forecast.projections.length > 5 && (
                              <p className="text-xs text-gray-500 text-center">
                                ... e mais {forecast.projections.length - 5} períodos
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Information */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Criado por {forecast.createdBy} em {new Date(forecast.createdAt).toLocaleDateString('pt-BR')}</span>
                          <span>Última atualização: {new Date(forecast.lastUpdated).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma projeção encontrada</h3>
                  <p className="text-gray-500 mb-4">Crie sua primeira projeção para começar a análise preditiva</p>
                  <button
                    onClick={() => setShowForecastModal(true)}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Projeção</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* KPIs Tab */}
          {activeTab === 'kpis' && (
            <div className="space-y-6">
              {/* KPI Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Indicadores de Performance (KPIs)</h3>
                  <p className="text-sm text-gray-600">Monitore e gerencie os principais indicadores</p>
                </div>
                <button
                  onClick={() => setShowKPIModal(true)}
                  className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo KPI</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map((kpi) => (
                  <div key={kpi.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{kpi.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(kpi.trend)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKPIStatusColor(kpi.status)}`}>
                          {getKPIStatusLabel(kpi.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Atual:</span>
                        <span className="text-xl font-bold text-gray-800">
                          {kpi.current}{kpi.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Meta:</span>
                        <span className="text-lg font-medium text-blue-600">
                          {kpi.target}{kpi.unit}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            kpi.current >= kpi.target ? 'bg-green-500' : 
                            kpi.current >= kpi.target * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((kpi.current / kpi.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Responsável: {kpi.owner}</span>
                          <span>{new Date(kpi.lastUpdated).toLocaleDateString('pt-BR')}</span>
                        </div>
                        
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditKPI(kpi)}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="Editar KPI"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteKPI(kpi.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Excluir KPI"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {kpis.length === 0 && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum KPI encontrado</h3>
                  <p className="text-gray-500 mb-4">Crie seu primeiro KPI para começar o monitoramento</p>
                  <button
                    onClick={() => setShowKPIModal(true)}
                    className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo KPI</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Scenarios Tab */}
          {activeTab === 'scenarios' && (
            <div className="text-center py-12">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Análise de Cenários</h3>
              <p className="text-gray-500">Compare diferentes cenários de planejamento</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <BudgetPlanFormModal
        isOpen={showFormModal}
        onClose={handleCloseModals}
        onSave={handleSavePlan}
        costCenters={costCenters}
        fiscalYears={fiscalYears}
        initialData={planToEdit}
      />

      {/* Details Modal */}
      <BudgetPlanDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        plan={planDetails}
        costCenters={costCenters}
        fiscalYears={fiscalYears}
      />

      {/* Forecast Modal */}
      <ForecastFormModal
        isOpen={showForecastModal}
        onClose={handleCloseModals}
        onSave={handleSaveForecast}
        initialData={forecastToEdit}
      />

      {/* KPI Modal */}
      <KPIFormModal
        isOpen={showKPIModal}
        onClose={handleCloseModals}
        onSave={handleSaveKPI}
        initialData={kpiToEdit}
      />
    </div>
  );
}