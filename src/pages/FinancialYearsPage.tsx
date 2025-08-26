import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, Star, Edit, Trash2, Archive, CheckCircle, Download, Upload, AlertTriangle } from 'lucide-react';
import { FinancialYearCard } from '../components/FinancialYears/FinancialYearCard';
import { FinancialYearForm } from '../components/FinancialYears/FinancialYearForm';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { FinancialYear, FinancialYearFormData } from '../types/financialYear';

export function FinancialYearsPage() {
  const { activeCompany } = useAuth();
  const { 
    financialYears, 
    isLoading, 
    error,
    addFinancialYear, 
    updateFinancialYear, 
    deleteFinancialYear, 
    setDefaultFinancialYear,
    closeFinancialYear,
    archiveFinancialYear,
    getFilteredFinancialYears 
  } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [financialYearToEdit, setFinancialYearToEdit] = useState<FinancialYear | null>(null);

  const handleCreateFinancialYear = async (formData: FinancialYearFormData) => {
    try {
      await addFinancialYear(formData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditFinancialYear = (financialYear: FinancialYear) => {
    setFinancialYearToEdit(financialYear);
    setShowCreateModal(true);
  };

  const handleUpdateFinancialYear = async (formData: FinancialYearFormData) => {
    if (financialYearToEdit) {
      try {
        await updateFinancialYear(financialYearToEdit.id, formData);
        setFinancialYearToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    }
  };

  const handleDeleteFinancialYear = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício financeiro? Esta ação não pode ser desfeita.')) {
      try {
        await deleteFinancialYear(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir exercício financeiro');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultFinancialYear(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao definir exercício financeiro padrão');
    }
  };

  const handleCloseFinancialYear = async (id: string) => {
    if (window.confirm('Tem certeza que deseja encerrar este exercício financeiro? Esta ação não pode ser desfeita.')) {
      try {
        await closeFinancialYear(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao encerrar exercício financeiro');
      }
    }
  };

  const handleArchiveFinancialYear = async (id: string) => {
    if (window.confirm('Tem certeza que deseja arquivar este exercício financeiro? Esta ação não pode ser desfeita.')) {
      try {
        await archiveFinancialYear(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao arquivar exercício financeiro');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFinancialYearToEdit(null);
  };

  const filteredFinancialYears = getFilteredFinancialYears(searchTerm, statusFilter);

  // Estatísticas
  const totalYears = financialYears.length;
  const activeYears = financialYears.filter(fy => fy.status === 'active').length;
  const planningYears = financialYears.filter(fy => fy.status === 'planning').length;
  const closedYears = financialYears.filter(fy => fy.status === 'closed').length;
  const archivedYears = financialYears.filter(fy => fy.status === 'archived').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Exercícios Financeiros</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os períodos orçamentários da ${activeCompany.name}` : 
             'Gerencie os períodos orçamentários e suas versões'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Exercício</span>
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
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Exercícios</p>
              <p className="text-xl font-bold text-gray-800">{totalYears}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeYears}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Em Planejamento</p>
              <p className="text-xl font-bold text-gray-800">{planningYears}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Encerrados</p>
              <p className="text-xl font-bold text-gray-800">{closedYears}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Archive className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Arquivados</p>
              <p className="text-xl font-bold text-gray-800">{archivedYears}</p>
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
            placeholder="Buscar exercícios..."
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
          <option value="planning">Planejamento</option>
          <option value="active">Ativo</option>
          <option value="closed">Encerrado</option>
          <option value="archived">Arquivado</option>
        </select>

        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar exercícios"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Exportar</span>
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Importar exercícios"
          >
            <Upload className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Importar</span>
          </button>
        </div>
      </div>

      {/* Financial Years List */}
      <div className="space-y-4">
        {filteredFinancialYears.map((financialYear) => (
          <FinancialYearCard
            key={financialYear.id}
            financialYear={financialYear}
            onEdit={handleEditFinancialYear}
            onDelete={handleDeleteFinancialYear}
            onSetDefault={handleSetDefault}
            onClose={handleCloseFinancialYear}
            onArchive={handleArchiveFinancialYear}
          />
        ))}
      </div>

      {filteredFinancialYears.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício financeiro encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Ajuste os filtros ou crie um novo exercício financeiro'
              : 'Crie seu primeiro exercício financeiro para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Exercício Financeiro</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <FinancialYearForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={financialYearToEdit ? handleUpdateFinancialYear : handleCreateFinancialYear}
        initialData={financialYearToEdit}
      />
    </div>
  );
}