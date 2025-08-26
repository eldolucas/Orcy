import React, { useState } from 'react';
import { Plus, Search, Filter, DollarSign, Calendar, Tag, Building2, TrendingUp, Download, ListChecks } from 'lucide-react';
import { BudgetItemCard } from '../components/BudgetItems/BudgetItemCard';
import { BudgetItemForm } from '../components/BudgetItems/BudgetItemForm';
import { useBudgetItems } from '../hooks/useBudgetItems';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useBudgetRevisions } from '../hooks/useBudgetRevisions';
import { useAccountingClassifications } from '../hooks/useAccountingClassifications';
import { useCostCenters } from '../hooks/useCostCenters';
import { useAuth } from '../contexts/AuthContext';
import { BudgetItem, BudgetItemFormData } from '../types/budgetItem';

export function BudgetItemsPage() {
  const { activeCompany } = useAuth();
  const { 
    budgetItems, 
    isLoading: itemsLoading, 
    error: itemsError,
    addBudgetItem, 
    updateBudgetItem, 
    deleteBudgetItem, 
    getFilteredBudgetItems,
    getTotalBudgetedByType
  } = useBudgetItems();
  
  const {
    financialYears,
    isLoading: yearsLoading
  } = useFinancialYears();
  
  const {
    budgetRevisions,
    isLoading: revisionsLoading
  } = useBudgetRevisions();
  
  const {
    accountingClassifications,
    isLoading: classificationsLoading
  } = useAccountingClassifications();
  
  const {
    costCenters,
    isLoading: costCentersLoading
  } = useCostCenters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [financialYearFilter, setFinancialYearFilter] = useState('all');
  const [revisionFilter, setRevisionFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<BudgetItem | null>(null);

  const handleCreateItem = async (formData: BudgetItemFormData) => {
    try {
      await addBudgetItem(formData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditItem = (item: BudgetItem) => {
    setItemToEdit(item);
    setShowCreateModal(true);
  };

  const handleUpdateItem = async (formData: BudgetItemFormData) => {
    if (itemToEdit) {
      try {
        await updateBudgetItem(itemToEdit.id, formData);
        setItemToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item orçamentário? Esta ação não pode ser desfeita.')) {
      try {
        await deleteBudgetItem(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir item orçamentário');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setItemToEdit(null);
  };

  const filteredItems = getFilteredBudgetItems(
    financialYearFilter,
    revisionFilter,
    classificationFilter,
    costCenterFilter,
    typeFilter,
    searchTerm
  );

  // Helper functions to get related objects
  const getFinancialYear = (id: string) => financialYears.find(year => year.id === id);
  const getBudgetRevision = (id?: string) => id ? budgetRevisions.find(revision => revision.id === id) : undefined;
  const getAccountingClassification = (id: string) => accountingClassifications.find(classification => classification.id === id);
  const getCostCenter = (id: string) => costCenters.find(center => center.id === id);

  // Statistics
  const totalItems = budgetItems.length;
  const revenueItems = budgetItems.filter(item => item.type === 'revenue').length;
  const expenseItems = budgetItems.filter(item => item.type === 'expense').length;
  const totalRevenue = getTotalBudgetedByType('revenue');
  const totalExpense = getTotalBudgetedByType('expense');
  const netBudget = totalRevenue - totalExpense;

  // Get available revisions for the selected financial year
  const availableRevisions = financialYearFilter !== 'all'
    ? budgetRevisions.filter(revision => revision.financialYearId === financialYearFilter)
    : [];

  const isLoading = itemsLoading || yearsLoading || revisionsLoading || classificationsLoading || costCentersLoading;

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
          <h1 className="text-2xl font-bold text-gray-800">Itens Orçamentários</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os itens orçamentários da ${activeCompany.name}` : 
             'Gerencie os itens detalhados do orçamento'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Item</span>
        </button>
      </div>

      {/* Error Message */}
      {itemsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{itemsError}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Itens</p>
              <p className="text-xl font-bold text-gray-800">{totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-xl font-bold text-gray-800">{revenueItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600 transform rotate-180" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-xl font-bold text-gray-800">{expenseItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Receitas</p>
              <p className="text-xl font-bold text-green-600">R$ {totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Despesas</p>
              <p className="text-xl font-bold text-red-600">R$ {totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Net Budget */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              netBudget >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-5 h-5 ${
                netBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Orçamentário (Receitas - Despesas)</p>
              <p className={`text-2xl font-bold ${
                netBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                R$ {Math.abs(netBudget).toLocaleString()} {netBudget >= 0 ? '(Superávit)' : '(Déficit)'}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {netBudget >= 0 
              ? 'O orçamento está equilibrado, com receitas superando despesas.'
              : 'Atenção: O orçamento está em déficit, com despesas superando receitas.'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={financialYearFilter}
            onChange={(e) => {
              setFinancialYearFilter(e.target.value);
              setRevisionFilter('all'); // Reset revision filter when financial year changes
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os exercícios</option>
            {financialYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name} ({year.year})
              </option>
            ))}
          </select>

          <select
            value={revisionFilter}
            onChange={(e) => setRevisionFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={financialYearFilter === 'all' || availableRevisions.length === 0}
          >
            <option value="all">Todas as revisões</option>
            <option value="">Orçamento Original</option>
            {availableRevisions.map((revision) => (
              <option key={revision.id} value={revision.id}>
                Revisão #{revision.revisionNumber}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="revenue">Receitas</option>
            <option value="expense">Despesas</option>
          </select>

          <div className="flex items-center space-x-2">
            <button
              className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Exportar itens"
            >
              <Download className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-600">Exportar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="flex items-center justify-between space-x-4">
        <select
          value={classificationFilter}
          onChange={(e) => setClassificationFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todas as classificações contábeis</option>
          {accountingClassifications.map((classification) => (
            <option key={classification.id} value={classification.id}>
              {classification.code} - {classification.name}
            </option>
          ))}
        </select>
        
        <select
          value={costCenterFilter}
          onChange={(e) => setCostCenterFilter(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os centros de custo</option>
          {costCenters.map((center) => (
            <option key={center.id} value={center.id}>
              {center.code} - {center.name}
            </option>
          ))}
        </select>
      </div>

      {/* Budget Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <BudgetItemCard
            key={item.id}
            item={item}
            financialYear={getFinancialYear(item.financialYearId)}
            budgetRevision={getBudgetRevision(item.budgetRevisionId)}
            accountingClassification={getAccountingClassification(item.accountingClassificationId)}
            costCenter={getCostCenter(item.costCenterId)}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <ListChecks className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum item orçamentário encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || financialYearFilter !== 'all' || revisionFilter !== 'all' || 
             classificationFilter !== 'all' || costCenterFilter !== 'all' || typeFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo item orçamentário'
              : 'Crie seu primeiro item orçamentário para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Item Orçamentário</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <BudgetItemForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={itemToEdit ? handleUpdateItem : handleCreateItem}
        initialData={itemToEdit}
        financialYears={financialYears}
        budgetRevisions={budgetRevisions}
        accountingClassifications={accountingClassifications}
        costCenters={costCenters}
      />
    </div>
  );
}