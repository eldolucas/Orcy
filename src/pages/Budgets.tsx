import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, PieChart, TrendingUp, Edit, Trash2, Building2 } from 'lucide-react';
import { CreateBudgetModal } from '../components/Budgets/CreateBudgetModal';
import { useBudgets } from '../hooks/useBudgets';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { Budget } from '../types';

export function Budgets() {
  const { 
    budgets, 
    isLoading, 
    addBudget, 
    updateBudget, 
    deleteBudget, 
    getFilteredBudgets,
    getTotalBudgetByStatus 
  } = useBudgets();
  
  const { costCenters } = useCostCenters();
  const { fiscalYears } = useFiscalYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCostCenter, setSelectedCostCenter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateBudget = (newBudget: Omit<Budget, 'id' | 'createdAt' | 'lastUpdated' | 'spent' | 'remaining'>) => {
    addBudget(newBudget);
    setShowCreateModal(false);
  };

  const handleEditBudget = (budget: Budget) => {
    // TODO: Implement edit functionality
    console.log('Edit budget:', budget);
  };

  const handleDeleteBudget = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteBudget(id);
    }
  };

  const filteredBudgets = getFilteredBudgets(searchTerm, selectedStatus, selectedCostCenter);

  // Calculate summary statistics
  const totalBudgets = budgets.length;
  const activeBudgets = budgets.filter(b => b.status === 'active').length;
  const planningBudgets = budgets.filter(b => b.status === 'planning').length;
  const totalBudgetValue = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
  const totalSpentValue = budgets.reduce((sum, b) => sum + b.spent, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'planning':
        return 'Planejamento';
      case 'approved':
        return 'Aprovado';
      case 'completed':
        return 'Concluído';
      default:
        return status;
    }
  };

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado';
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
          <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie os orçamentos por departamento</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Orçamentos</p>
              <p className="text-xl font-bold text-gray-800">{totalBudgets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orçamentos Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeBudgets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Planejamento</p>
              <p className="text-xl font-bold text-gray-800">{planningBudgets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalBudgetValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gasto</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalSpentValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar orçamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedCostCenter}
            onChange={(e) => setSelectedCostCenter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os centros</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="planning">Planejamento</option>
            <option value="approved">Aprovado</option>
            <option value="active">Ativo</option>
            <option value="completed">Concluído</option>
          </select>
        </div>
      </div>

      {/* Budgets List */}
      <div className="space-y-6">
        {filteredBudgets.map((budget) => {
          const utilization = (budget.spent / budget.totalBudget) * 100;
          
          return (
            <div key={budget.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              {/* Budget Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{budget.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        {getCostCenterName(budget.costCenterId)}
                      </span>
                      <span className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {budget.period}
                      </span>
                      <span className="text-sm text-gray-500">
                        Criado por {budget.createdBy}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(budget.status)}`}>
                    {getStatusLabel(budget.status)}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditBudget(budget)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar orçamento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {budget.status === 'planning' && (
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir orçamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Budget Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Orçamento Total</p>
                  <p className="text-2xl font-bold text-blue-800">
                    R$ {budget.totalBudget.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Gasto</p>
                  <p className="text-2xl font-bold text-purple-800">
                    R$ {budget.spent.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Disponível</p>
                  <p className="text-2xl font-bold text-green-800">
                    R$ {budget.remaining.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Utilização</p>
                  <p className={`text-2xl font-bold ${
                    utilization > 90 ? 'text-red-600' :
                    utilization > 75 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {utilization.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
                  <span className="text-sm text-gray-500">{utilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      utilization > 90 ? 'bg-red-500' :
                      utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Criado por {budget.createdBy} em {new Date(budget.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>Última atualização: {new Date(budget.lastUpdated).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Categorias</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {budget.categories.map((category) => (
                    <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium text-gray-800">{category.name}</h5>
                        <span className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Orçado:</span>
                          <span>R$ {category.budgeted.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gasto:</span>
                          <span>R$ {category.spent.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            category.percentage > 90 ? 'bg-red-500' :
                            category.percentage > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(category.percentage, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      <CreateBudgetModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateBudget}
        costCenters={costCenters}
        fiscalYears={fiscalYears}
      />

      {filteredBudgets.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || selectedStatus !== 'all' || selectedCostCenter !== 'all'
              ? 'Ajuste os filtros ou crie um novo orçamento'
              : 'Crie um novo orçamento para começar'
            }
          </p>
        </div>
      )}
    </div>
  );
}