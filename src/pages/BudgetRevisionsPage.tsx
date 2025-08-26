import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Calculator, CheckCircle, Clock, Archive, AlertTriangle } from 'lucide-react';
import { BudgetRevisionCard } from '../components/BudgetRevisions/BudgetRevisionCard';
import { BudgetRevisionForm } from '../components/BudgetRevisions/BudgetRevisionForm';
import { useBudgetRevisions } from '../hooks/useBudgetRevisions';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { BudgetRevision, BudgetRevisionFormData } from '../types/budgetRevision';

export function BudgetRevisionsPage() {
  const { activeCompany } = useAuth();
  const { 
    budgetRevisions, 
    isLoading: revisionsLoading, 
    error: revisionsError,
    addBudgetRevision, 
    updateBudgetRevision, 
    deleteBudgetRevision, 
    approveBudgetRevision,
    archiveBudgetRevision,
    getFilteredBudgetRevisions 
  } = useBudgetRevisions();
  
  const {
    financialYears,
    isLoading: yearsLoading,
    error: yearsError
  } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [financialYearFilter, setFinancialYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [revisionToEdit, setRevisionToEdit] = useState<BudgetRevision | null>(null);

  const handleCreateRevision = async (formData: BudgetRevisionFormData) => {
    try {
      await addBudgetRevision(formData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditRevision = (revision: BudgetRevision) => {
    setRevisionToEdit(revision);
    setShowCreateModal(true);
  };

  const handleUpdateRevision = async (formData: BudgetRevisionFormData) => {
    if (revisionToEdit) {
      try {
        await updateBudgetRevision(revisionToEdit.id, formData);
        setRevisionToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteRevision = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta revisão orçamentária? Esta ação não pode ser desfeita.')) {
      try {
        await deleteBudgetRevision(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir revisão orçamentária');
      }
    }
  };

  const handleApproveRevision = async (id: string) => {
    if (window.confirm('Tem certeza que deseja aprovar esta revisão orçamentária? Isso atualizará o orçamento do exercício financeiro.')) {
      try {
        await approveBudgetRevision(id, 'Usuário Atual'); // In a real app, this would come from auth context
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao aprovar revisão orçamentária');
      }
    }
  };

  const handleArchiveRevision = async (id: string) => {
    if (window.confirm('Tem certeza que deseja arquivar esta revisão orçamentária?')) {
      try {
        await archiveBudgetRevision(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao arquivar revisão orçamentária');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setRevisionToEdit(null);
  };

  const filteredRevisions = getFilteredBudgetRevisions(searchTerm, financialYearFilter, statusFilter);

  // Find financial year for each revision
  const getFinancialYear = (financialYearId: string) => {
    return financialYears.find(year => year.id === financialYearId);
  };

  // Statistics
  const totalRevisions = budgetRevisions.length;
  const draftRevisions = budgetRevisions.filter(r => r.status === 'draft').length;
  const activeRevisions = budgetRevisions.filter(r => r.status === 'active').length;
  const archivedRevisions = budgetRevisions.filter(r => r.status === 'archived').length;
  
  // Calculate total budget change
  const totalBudgetIncrease = budgetRevisions
    .filter(r => r.status === 'active' && r.totalBudgetAfter && r.totalBudgetBefore && r.totalBudgetAfter > r.totalBudgetBefore)
    .reduce((sum, r) => sum + ((r.totalBudgetAfter || 0) - (r.totalBudgetBefore || 0)), 0);
  
  const totalBudgetDecrease = budgetRevisions
    .filter(r => r.status === 'active' && r.totalBudgetAfter && r.totalBudgetBefore && r.totalBudgetAfter < r.totalBudgetBefore)
    .reduce((sum, r) => sum + ((r.totalBudgetBefore || 0) - (r.totalBudgetAfter || 0)), 0);

  const isLoading = revisionsLoading || yearsLoading;
  const error = revisionsError || yearsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Revisões Orçamentárias</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie as revisões orçamentárias da ${activeCompany.name}` : 
             'Gerencie as revisões orçamentárias e ajustes nos orçamentos'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Revisão</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Ocorreu um erro</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Revisões</p>
              <p className="text-xl font-bold text-gray-800">{totalRevisions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rascunhos</p>
              <p className="text-xl font-bold text-gray-800">{draftRevisions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-xl font-bold text-gray-800">{activeRevisions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aumento Total</p>
              <p className="text-xl font-bold text-green-600">R$ {totalBudgetIncrease.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Redução Total</p>
              <p className="text-xl font-bold text-red-600">R$ {totalBudgetDecrease.toLocaleString()}</p>
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
            placeholder="Buscar revisões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={financialYearFilter}
          onChange={(e) => setFinancialYearFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Todos os exercícios</option>
          {financialYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} ({year.year})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="draft">Rascunho</option>
          <option value="active">Ativo</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {filteredRevisions.map((revision) => (
          <BudgetRevisionCard
            key={revision.id}
            revision={revision}
            financialYear={getFinancialYear(revision.financialYearId)}
            onEdit={handleEditRevision}
            onDelete={handleDeleteRevision}
            onApprove={handleApproveRevision}
            onArchive={handleArchiveRevision}
          />
        ))}
      </div>

      {filteredRevisions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma revisão orçamentária encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || financialYearFilter !== 'all' || statusFilter !== 'all' 
              ? 'Ajuste os filtros ou crie uma nova revisão orçamentária'
              : 'Crie sua primeira revisão orçamentária para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Revisão Orçamentária</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <BudgetRevisionForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={revisionToEdit ? handleUpdateRevision : handleCreateRevision}
        initialData={revisionToEdit}
        financialYears={financialYears}
      />
    </div>
  );
}