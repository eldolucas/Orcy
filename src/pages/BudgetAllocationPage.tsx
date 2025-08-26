import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, BarChart3, PieChart, DollarSign, Building2 } from 'lucide-react';
import { AllocationCard } from '../components/BudgetAllocations/AllocationCard';
import { AllocationForm } from '../components/BudgetAllocations/AllocationForm';
import { useBudgetAllocations } from '../hooks/useBudgetAllocations';
import { useBudgetItems } from '../hooks/useBudgetItems';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { BudgetAllocation, BudgetAllocationFormData, monthNames } from '../types/budgetAllocation';

export function BudgetAllocationPage() {
  const { activeCompany } = useAuth();
  const { 
    allocations, 
    isLoading, 
    error,
    addBudgetAllocation, 
    updateBudgetAllocation, 
    deleteBudgetAllocation,
    getAllocationsByBudgetItem,
    getAllocationsByCostCenter,
    getAllocationsByFiscalYear,
    getMonthlyTotals,
    getYearlyTotals
  } = useBudgetAllocations();
  
  const { budgetItems } = useBudgetItems();
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetItemFilter, setBudgetItemFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [distributionTypeFilter, setDistributionTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allocationToEdit, setAllocationToEdit] = useState<BudgetAllocation | null>(null);

  const handleCreateAllocation = async (formData: BudgetAllocationFormData) => {
    try {
      await addBudgetAllocation(formData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditAllocation = (allocation: BudgetAllocation) => {
    setAllocationToEdit(allocation);
    setShowCreateModal(true);
  };

  const handleUpdateAllocation = async (formData: BudgetAllocationFormData) => {
    if (allocationToEdit) {
      try {
        await updateBudgetAllocation(allocationToEdit.id, formData);
        setAllocationToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteAllocation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta alocação orçamentária? Esta ação não pode ser desfeita.')) {
      try {
        await deleteBudgetAllocation(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir alocação orçamentária');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setAllocationToEdit(null);
  };

  // Filtra as alocações com base nos filtros selecionados
  const filteredAllocations = allocations.filter(allocation => {
    // Filtro por termo de busca
    if (searchTerm) {
      const budgetItem = budgetItems.find(item => item.id === allocation.budgetItemId);
      const costCenter = costCenters.find(center => center.id === allocation.costCenterId);
      
      const searchString = `${budgetItem?.name || ''} ${costCenter?.name || ''} ${costCenter?.code || ''}`;
      
      if (!searchString.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
    }
    
    // Filtro por item orçamentário
    if (budgetItemFilter !== 'all' && allocation.budgetItemId !== budgetItemFilter) {
      return false;
    }
    
    // Filtro por centro de custo
    if (costCenterFilter !== 'all' && allocation.costCenterId !== costCenterFilter) {
      return false;
    }
    
    // Filtro por exercício financeiro
    if (fiscalYearFilter !== 'all' && allocation.fiscalYearId !== fiscalYearFilter) {
      return false;
    }
    
    // Filtro por tipo de distribuição
    if (distributionTypeFilter !== 'all' && allocation.distributionType !== distributionTypeFilter) {
      return false;
    }
    
    return true;
  });

  // Funções auxiliares para obter objetos relacionados
  const getBudgetItem = (id: string) => budgetItems.find(item => item.id === id);
  const getCostCenter = (id: string) => costCenters.find(center => center.id === id);
  const getFiscalYear = (id: string) => financialYears.find(year => year.id === id);

  // Estatísticas
  const totalAllocations = allocations.length;
  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.totalAmount, 0);
  
  // Obtém o exercício fiscal ativo (ou o primeiro da lista)
  const activeFiscalYear = financialYears.find(year => year.isDefault) || financialYears[0];
  
  // Obtém os totais mensais para o exercício fiscal ativo
  const monthlyTotals = activeFiscalYear 
    ? getMonthlyTotals(activeFiscalYear.id) 
    : Array.from({ length: 12 }, (_, i) => ({ month: i + 1, planned: 0, actual: 0 }));
  
  // Obtém os totais anuais para o exercício fiscal ativo
  const yearlyTotals = activeFiscalYear 
    ? getYearlyTotals(activeFiscalYear.id)
    : { planned: 0, actual: 0, variance: 0, variancePercentage: 0 };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alocação Mensal de Orçamento</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie a distribuição mensal do orçamento da ${activeCompany.name}` : 
             'Gerencie a distribuição mensal do orçamento ao longo do exercício financeiro'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Alocação</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Alocações</p>
              <p className="text-xl font-bold text-gray-800">{totalAllocations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Total Alocado</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalAllocated.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Planejado {activeFiscalYear?.year}</p>
              <p className="text-xl font-bold text-purple-800">R$ {yearlyTotals.planned.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Realizado {activeFiscalYear?.year}</p>
              <p className="text-xl font-bold text-yellow-800">R$ {yearlyTotals.actual.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {yearlyTotals.variancePercentage > 0 ? '+' : ''}
                {yearlyTotals.variancePercentage.toFixed(1)}% vs planejado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Distribution Chart */}
      {activeFiscalYear && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição Mensal - {activeFiscalYear.year}</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-1 h-40">
              {monthlyTotals.map((month) => {
                const maxValue = Math.max(...monthlyTotals.map(m => Math.max(m.planned, m.actual)));
                const plannedHeight = maxValue > 0 ? (month.planned / maxValue) * 100 : 0;
                const actualHeight = maxValue > 0 ? (month.actual / maxValue) * 100 : 0;
                
                return (
                  <div key={month.month} className="flex flex-col items-center justify-end space-y-1">
                    <div className="relative w-full">
                      {/* Barra de valor planejado */}
                      <div 
                        className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-t"
                        style={{ height: `${plannedHeight}%` }}
                      ></div>
                      
                      {/* Barra de valor realizado */}
                      {month.actual > 0 && (
                        <div 
                          className={`absolute bottom-0 left-0 w-full ${
                            month.actual > month.planned ? 'bg-red-500' : 'bg-green-500'
                          } rounded-t opacity-70`}
                          style={{ height: `${actualHeight}%` }}
                        ></div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                      {monthNames[month.month - 1].substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Planejado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Realizado (dentro do orçamento)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Realizado (acima do orçamento)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar alocações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={budgetItemFilter}
            onChange={(e) => setBudgetItemFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os itens orçamentários</option>
            {budgetItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.type === 'revenue' ? 'Receita' : 'Despesa'})
              </option>
            ))}
          </select>

          <select
            value={costCenterFilter}
            onChange={(e) => setCostCenterFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os centros de custo</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>

          <select
            value={distributionTypeFilter}
            onChange={(e) => setDistributionTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos de distribuição</option>
            <option value="equal">Uniforme</option>
            <option value="seasonal">Sazonal</option>
            <option value="weighted">Ponderada</option>
            <option value="custom">Personalizada</option>
          </select>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex items-center justify-between space-x-4">
        <select
          value={fiscalYearFilter}
          onChange={(e) => setFiscalYearFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os exercícios financeiros</option>
          {financialYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} ({year.year})
            </option>
          ))}
        </select>
      </div>

      {/* Allocations List */}
      <div className="space-y-4">
        {filteredAllocations.map((allocation) => (
          <AllocationCard
            key={allocation.id}
            allocation={allocation}
            budgetItem={getBudgetItem(allocation.budgetItemId)}
            costCenter={getCostCenter(allocation.costCenterId)}
            fiscalYear={getFiscalYear(allocation.fiscalYearId)}
            onEdit={handleEditAllocation}
            onDelete={handleDeleteAllocation}
          />
        ))}
      </div>

      {filteredAllocations.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma alocação orçamentária encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || budgetItemFilter !== 'all' || costCenterFilter !== 'all' || 
             fiscalYearFilter !== 'all' || distributionTypeFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova alocação orçamentária'
              : 'Crie sua primeira alocação orçamentária para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Alocação Orçamentária</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AllocationForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={allocationToEdit ? handleUpdateAllocation : handleCreateAllocation}
        initialData={allocationToEdit}
      />
    </div>
  );
}