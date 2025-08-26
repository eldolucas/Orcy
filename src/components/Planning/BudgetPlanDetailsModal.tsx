import React from 'react';
import { X, Target, Calendar, Building2, TrendingUp, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import { BudgetPlan, CostCenter, FiscalYear } from '../../types';

interface BudgetPlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: BudgetPlan | null;
  costCenters: CostCenter[];
  fiscalYears: FiscalYear[];
}

export function BudgetPlanDetailsModal({ 
  isOpen, 
  onClose, 
  plan, 
  costCenters, 
  fiscalYears 
}: BudgetPlanDetailsModalProps) {
  if (!isOpen || !plan) return null;

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado';
  };

  const getFiscalYearName = (fiscalYearId: string) => {
    const fiscalYear = fiscalYears.find(fy => fy.id === fiscalYearId);
    return fiscalYear ? `${fiscalYear.name} (${fiscalYear.year})` : 'Exercício não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getScenarioTypeColor = (type: string) => {
    switch (type) {
      case 'optimistic':
        return 'bg-green-100 text-green-800';
      case 'realistic':
        return 'bg-blue-100 text-blue-800';
      case 'pessimistic':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScenarioTypeLabel = (type: string) => {
    switch (type) {
      case 'optimistic':
        return 'Otimista';
      case 'realistic':
        return 'Realista';
      case 'pessimistic':
        return 'Pessimista';
      default:
        return type;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Detalhes do Plano Orçamentário</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Centro:</span>
                    <span className="font-medium text-gray-800">{getCostCenterName(plan.costCenterId)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Exercício:</span>
                    <span className="font-medium text-gray-800">{getFiscalYearName(plan.fiscalYearId)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-800 capitalize">{plan.planType}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Criado por:</span>
                    <span className="font-medium text-gray-800">{plan.createdBy}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 ${getStatusColor(plan.status)}`}>
                  <span className="font-medium">{getStatusLabel(plan.status)}</span>
                </div>
                
                <div className="block">
                  <p className="text-3xl font-bold text-blue-600">
                    R$ {plan.totalPlanned.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Total Planejado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Categorias do Plano</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.categories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">{category.name}</h5>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(category.priority)}`}>
                      {getPriorityLabel(category.priority)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Planejado:</span>
                      <span className="font-medium text-gray-800">R$ {category.plannedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de Crescimento:</span>
                      <span className="font-medium text-gray-800">{category.growthRate}%</span>
                    </div>
                  </div>
                  
                  {category.justification && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 italic">"{category.justification}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Cenários de Planejamento</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plan.scenarios.map((scenario) => (
                <div key={scenario.id} className={`border-2 rounded-lg p-4 ${
                  scenario.isDefault ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-800">{scenario.name}</h5>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScenarioTypeColor(scenario.type)}`}>
                        {getScenarioTypeLabel(scenario.type)}
                      </span>
                      {scenario.isDefault && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fator de Ajuste:</span>
                      <span className="font-medium text-gray-800">{scenario.adjustmentFactor}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projeção Total:</span>
                      <span className="font-bold text-blue-600">R$ {scenario.projectedTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  {scenario.assumptions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-600 mb-1">Premissas:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {scenario.assumptions.map((assumption, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                            {assumption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Assumptions */}
          {plan.assumptions.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Premissas de Planejamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.assumptions.map((assumption) => (
                  <div key={assumption.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-800">{assumption.category}</h5>
                        <p className="text-sm text-gray-600">{assumption.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-800">
                          {assumption.value}{assumption.unit}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-gray-600">Impacto:</span>
                        <span className={`font-medium ml-1 ${getImpactColor(assumption.impact)}`}>
                          {assumption.impact === 'high' ? 'Alto' : 
                           assumption.impact === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Confiança:</span>
                        <span className="font-medium text-gray-800 ml-1">{assumption.confidence}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Fonte:</span>
                        <span className="font-medium text-gray-800 ml-1">{assumption.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Linha do Tempo</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Plano criado</p>
                  <p className="text-sm text-gray-600">
                    {new Date(plan.createdAt).toLocaleDateString('pt-BR')} por {plan.createdBy}
                  </p>
                </div>
              </div>

              {plan.approvedBy && plan.approvedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Plano aprovado</p>
                    <p className="text-sm text-gray-600">
                      {new Date(plan.approvedAt).toLocaleDateString('pt-BR')} por {plan.approvedBy}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Última atualização</p>
                  <p className="text-sm text-gray-600">
                    {new Date(plan.lastUpdated).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}