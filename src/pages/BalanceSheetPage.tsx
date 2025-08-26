import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, FileText, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { BalanceSheetCard } from '../components/BalanceSheet/BalanceSheetCard';
import { BalanceSheetForm } from '../components/BalanceSheet/BalanceSheetForm';
import { BalanceSheetDetails } from '../components/BalanceSheet/BalanceSheetDetails';
import { useBalanceSheet } from '../hooks/useBalanceSheet';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { BalanceSheet, BalanceSheetFormData, BalanceSheetItemFormData, periodTypeLabels, balanceSheetStatusLabels } from '../types/balanceSheet';

export function BalanceSheetPage() {
  const { activeCompany, user } = useAuth();
  const { 
    balanceSheets, 
    balanceSheetItems,
    accounts,
    isLoading, 
    error,
    createBalanceSheet, 
    updateBalanceSheet, 
    deleteBalanceSheet,
    publishBalanceSheet,
    auditBalanceSheet,
    addBalanceSheetItem,
    updateBalanceSheetItem,
    deleteBalanceSheetItem,
    getBalanceSheetItems,
    getBalanceSheetSummary,
    getFilteredBalanceSheets
  } = useBalanceSheet();
  
  const { financialYears } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [periodTypeFilter, setPeriodTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [balanceSheetToEdit, setBalanceSheetToEdit] = useState<BalanceSheet | null>(null);
  const [balanceSheetToView, setBalanceSheetToView] = useState<BalanceSheet | null>(null);

  const handleCreateBalanceSheet = async (formData: BalanceSheetFormData) => {
    try {
      await createBalanceSheet(formData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar balanço');
    }
  };

  const handleEditBalanceSheet = (balanceSheet: BalanceSheet) => {
    setBalanceSheetToEdit(balanceSheet);
    setShowCreateModal(true);
  };

  const handleUpdateBalanceSheet = async (formData: BalanceSheetFormData) => {
    if (balanceSheetToEdit) {
      try {
        await updateBalanceSheet(balanceSheetToEdit.id, formData);
        setBalanceSheetToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar balanço');
      }
    }
  };

  const handleDeleteBalanceSheet = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este balanço? Esta ação não pode ser desfeita.')) {
      try {
        await deleteBalanceSheet(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir balanço');
      }
    }
  };

  const handlePublishBalanceSheet = async (id: string) => {
    if (window.confirm('Tem certeza que deseja publicar este balanço? Após a publicação, não será possível editar os dados.')) {
      try {
        await publishBalanceSheet(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao publicar balanço');
      }
    }
  };

  const handleAuditBalanceSheet = async (id: string) => {
    if (window.confirm('Tem certeza que deseja auditar este balanço? Isso confirmará que os dados foram verificados e estão corretos.')) {
      try {
        await auditBalanceSheet(id, user?.name || 'Usuário Atual');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao auditar balanço');
      }
    }
  };

  const handleViewDetails = (balanceSheet: BalanceSheet) => {
    setBalanceSheetToView(balanceSheet);
    setShowDetailsModal(true);
  };

  const handleAddBalanceSheetItem = async (balanceSheetId: string, itemData: BalanceSheetItemFormData) => {
    try {
      await addBalanceSheetItem(balanceSheetId, itemData);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar item ao balanço');
    }
  };

  const handleUpdateBalanceSheetItem = async (balanceSheetId: string, itemId: string, updates: Partial<BalanceSheetItemFormData>) => {
    try {
      await updateBalanceSheetItem(balanceSheetId, itemId, updates);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar item do balanço');
    }
  };

  const handleDeleteBalanceSheetItem = async (balanceSheetId: string, itemId: string) => {
    try {
      await deleteBalanceSheetItem(balanceSheetId, itemId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir item do balanço');
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setBalanceSheetToEdit(null);
    setBalanceSheetToView(null);
  };

  const filteredBalanceSheets = getFilteredBalanceSheets(
    fiscalYearFilter, 
    periodTypeFilter, 
    statusFilter, 
    searchTerm
  );

  // Funções auxiliares para obter objetos relacionados
  const getFiscalYear = (id: string) => financialYears.find(year => year.id === id);

  // Estatísticas
  const totalBalanceSheets = balanceSheets.length;
  const draftBalanceSheets = balanceSheets.filter(bs => bs.status === 'draft').length;
  const publishedBalanceSheets = balanceSheets.filter(bs => bs.status === 'published').length;
  const auditedBalanceSheets = balanceSheets.filter(bs => bs.status === 'audited').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Balanço Patrimonial</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os balanços patrimoniais da ${activeCompany.name}` : 
             'Gerencie os balanços patrimoniais e demonstrações de resultado'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Balanço</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Balanços</p>
              <p className="text-xl font-bold text-gray-800">{totalBalanceSheets}</p>
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
              <p className="text-xl font-bold text-gray-800">{draftBalanceSheets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Publicados</p>
              <p className="text-xl font-bold text-gray-800">{publishedBalanceSheets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Auditados</p>
              <p className="text-xl font-bold text-gray-800">{auditedBalanceSheets}</p>
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
            placeholder="Buscar balanços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={fiscalYearFilter}
          onChange={(e) => setFiscalYearFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os exercícios</option>
          {financialYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name} ({year.year})
            </option>
          ))}
        </select>

        <select
          value={periodTypeFilter}
          onChange={(e) => setPeriodTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os períodos</option>
          {Object.entries(periodTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          {Object.entries(balanceSheetStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Balance Sheets List */}
      <div className="space-y-4">
        {filteredBalanceSheets.map((balanceSheet) => (
          <BalanceSheetCard
            key={balanceSheet.id}
            balanceSheet={balanceSheet}
            summary={getBalanceSheetSummary(balanceSheet.id)}
            fiscalYear={getFiscalYear(balanceSheet.fiscalYearId)}
            onEdit={handleEditBalanceSheet}
            onDelete={handleDeleteBalanceSheet}
            onPublish={handlePublishBalanceSheet}
            onAudit={handleAuditBalanceSheet}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredBalanceSheets.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum balanço encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || fiscalYearFilter !== 'all' || periodTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo balanço'
              : 'Crie seu primeiro balanço para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Balanço</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <BalanceSheetForm
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={balanceSheetToEdit ? handleUpdateBalanceSheet : handleCreateBalanceSheet}
        initialData={balanceSheetToEdit}
      />

      {/* Details Modal */}
      <BalanceSheetDetails
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        balanceSheet={balanceSheetToView}
        items={balanceSheetToView ? getBalanceSheetItems(balanceSheetToView.id) : []}
        accounts={accounts}
        summary={balanceSheetToView ? getBalanceSheetSummary(balanceSheetToView.id) : {
          totalAssets: 0,
          totalLiabilities: 0,
          totalEquity: 0,
          totalRevenue: 0,
          totalExpense: 0,
          netIncome: 0
        }}
        fiscalYear={balanceSheetToView ? getFiscalYear(balanceSheetToView.fiscalYearId) : undefined}
        onAddItem={handleAddBalanceSheetItem}
        onUpdateItem={handleUpdateBalanceSheetItem}
        onDeleteItem={handleDeleteBalanceSheetItem}
        onPublish={handlePublishBalanceSheet}
        onAudit={handleAuditBalanceSheet}
      />
    </div>
  );
}