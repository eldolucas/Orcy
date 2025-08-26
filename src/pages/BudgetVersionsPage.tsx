import React, { useState } from 'react';
import { Plus, Search, Filter, Calendar, Star, BarChart3, TrendingUp, CheckCircle, Clock, Archive } from 'lucide-react';
import { VersionCard } from '../components/BudgetVersions/VersionCard';
import { VersionForm } from '../components/BudgetVersions/VersionForm';
import { VersionDetails } from '../components/BudgetVersions/VersionDetails';
import { VersionCompare } from '../components/BudgetVersions/VersionCompare';
import { useBudgetVersions } from '../hooks/useBudgetVersions';
import { useBudgetItems } from '../hooks/useBudgetItems';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useCostCenters } from '../hooks/useCostCenters';
import { useAuth } from '../contexts/AuthContext';
import { BudgetVersion, BudgetVersionFormData, BudgetVersionItemFormData, versionStatusLabels } from '../types/budgetVersion';

export function BudgetVersionsPage() {
  const { activeCompany } = useAuth();
  const { 
    versions, 
    versionItems,
    isLoading, 
    error,
    createVersion, 
    updateVersion, 
    deleteVersion,
    addVersionItem,
    updateVersionItem,
    deleteVersionItem,
    getVersionItems,
    approveVersion,
    activateVersion,
    getFilteredVersions
  } = useBudgetVersions();
  
  const { budgetItems } = useBudgetItems();
  const { financialYears } = useFinancialYears();
  const { costCenters } = useCostCenters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [versionToEdit, setVersionToEdit] = useState<BudgetVersion | null>(null);
  const [versionToView, setVersionToView] = useState<BudgetVersion | null>(null);
  const [versionToCompare, setVersionToCompare] = useState<BudgetVersion | null>(null);

  const handleCreateVersion = async (formData: BudgetVersionFormData) => {
    try {
      await createVersion(formData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar versão de orçamento');
    }
  };

  const handleEditVersion = (version: BudgetVersion) => {
    setVersionToEdit(version);
    setShowCreateModal(true);
  };

  const handleUpdateVersion = async (formData: BudgetVersionFormData) => {
    if (versionToEdit) {
      try {
        await updateVersion(versionToEdit.id, formData);
        setVersionToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar versão de orçamento');
      }
    }
  };

  const handleDeleteVersion = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta versão de orçamento? Esta ação não pode ser desfeita.')) {
      try {
        await deleteVersion(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir versão de orçamento');
      }
    }
  };

  const handleApproveVersion = async (id: string) => {
    if (window.confirm('Tem certeza que deseja aprovar esta versão de orçamento?')) {
      try {
        await approveVersion(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao aprovar versão de orçamento');
      }
    }
  };

  const handleActivateVersion = async (id: string) => {
    if (window.confirm('Tem certeza que deseja ativar esta versão de orçamento? Isso tornará esta versão a versão ativa do orçamento.')) {
      try {
        await activateVersion(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao ativar versão de orçamento');
      }
    }
  };

  const handleViewDetails = (version: BudgetVersion) => {
    setVersionToView(version);
    setShowDetailsModal(true);
  };

  const handleCompareVersion = (version: BudgetVersion) => {
    setVersionToCompare(version);
    setShowCompareModal(true);
  };

  const handleAddVersionItem = async (versionId: string, itemData: BudgetVersionItemFormData) => {
    try {
      await addVersionItem(versionId, itemData);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao adicionar item à versão');
    }
  };

  const handleUpdateVersionItem = async (versionId: string, itemId: string, updates: Partial<BudgetVersionItemFormData>) => {
    try {
      await updateVersionItem(versionId, itemId, updates);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar item da versão');
    }
  };

  const handleDeleteVersionItem = async (versionId: string, itemId: string) => {
    try {
      await deleteVersionItem(versionId, itemId);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir item da versão');
    }
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setShowCompareModal(false);
    setVersionToEdit(null);
    setVersionToView(null);
    setVersionToCompare(null);
  };

  const filteredVersions = getFilteredVersions(fiscalYearFilter, statusFilter, searchTerm);

  // Funções auxiliares para obter objetos relacionados
  const getFiscalYear = (id: string) => financialYears.find(year => year.id === id);
  const getCostCenter = (id?: string) => id ? costCenters.find(center => center.id === id) : undefined;

  // Estatísticas
  const totalVersions = versions.length;
  const draftVersions = versions.filter(v => v.status === 'draft').length;
  const simulationVersions = versions.filter(v => v.status === 'simulation').length;
  const approvedVersions = versions.filter(v => v.status === 'approved').length;
  const activeVersions = versions.filter(v => v.status === 'active').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Versões de Orçamento</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie as versões de orçamento da ${activeCompany.name}` : 
             'Gerencie versões de orçamento para simulações e cenários alternativos'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Versão</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
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
              <p className="text-sm text-gray-600">Total de Versões</p>
              <p className="text-xl font-bold text-gray-800">{totalVersions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rascunhos</p>
              <p className="text-xl font-bold text-gray-800">{draftVersions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Simulações</p>
              <p className="text-xl font-bold text-gray-800">{simulationVersions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-xl font-bold text-gray-800">{approvedVersions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativas</p>
              <p className="text-xl font-bold text-gray-800">{activeVersions}</p>
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
            placeholder="Buscar versões..."
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          {Object.entries(versionStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Versions List */}
      <div className="space-y-4">
        {filteredVersions.map((version) => (
          <VersionCard
            key={version.id}
            version={version}
            fiscalYear={getFiscalYear(version.fiscalYearId)}
            onEdit={handleEditVersion}
            onDelete={handleDeleteVersion}
            onApprove={handleApproveVersion}
            onActivate={handleActivateVersion}
            onViewDetails={handleViewDetails}
            onCompare={handleCompareVersion}
          />
        ))}
      </div>

      {filteredVersions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma versão de orçamento encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || fiscalYearFilter !== 'all' || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova versão de orçamento'
              : 'Crie sua primeira versão de orçamento para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Versão de Orçamento</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <VersionForm
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={versionToEdit ? handleUpdateVersion : handleCreateVersion}
        initialData={versionToEdit}
      />

      {/* Details Modal */}
      <VersionDetails
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        version={versionToView}
        versionItems={versionToView ? getVersionItems(versionToView.id) : []}
        budgetItems={budgetItems}
        fiscalYear={versionToView ? getFiscalYear(versionToView.fiscalYearId) : undefined}
        costCenter={versionToView?.costCenterId ? getCostCenter(versionToView.costCenterId) : undefined}
        onAddItem={handleAddVersionItem}
        onUpdateItem={handleUpdateVersionItem}
        onDeleteItem={handleDeleteVersionItem}
        onApprove={handleApproveVersion}
        onActivate={handleActivateVersion}
      />

      {/* Compare Modal */}
      <VersionCompare
        isOpen={showCompareModal}
        onClose={handleCloseModals}
        version={versionToCompare}
        versions={versions}
        budgetItems={budgetItems}
        fiscalYears={financialYears}
      />
    </div>
  );
}