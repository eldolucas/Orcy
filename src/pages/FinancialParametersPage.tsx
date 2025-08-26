import React, { useState } from 'react';
import { Plus, Search, Filter, Settings, Globe, Building2, CheckCircle, XCircle, Info } from 'lucide-react';
import { ParameterCard } from '../components/FinancialParameters/ParameterCard';
import { ParameterForm } from '../components/FinancialParameters/ParameterForm';
import { useFinancialParameters } from '../hooks/useFinancialParameters';
import { useAuth } from '../contexts/AuthContext';
import { FinancialParameter, FinancialParameterFormData, parameterCategoryLabels, parameterValueTypeLabels, economicSectors } from '../types/financialParameter';

export function FinancialParametersPage() {
  const { activeCompany, user } = useAuth();
  const { 
    parameters, 
    isLoading, 
    error,
    canEditSystemParameters,
    addParameter, 
    updateParameter, 
    deleteParameter, 
    getFilteredParameters 
  } = useFinancialParameters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showSystemParams, setShowSystemParams] = useState(true);
  const [showCompanyParams, setShowCompanyParams] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [parameterToEdit, setParameterToEdit] = useState<FinancialParameter | null>(null);

  const handleCreateParameter = async (paramData: FinancialParameterFormData) => {
    try {
      await addParameter(paramData);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
      alert(err instanceof Error ? err.message : 'Erro ao criar parâmetro');
    }
  };

  const handleEditParameter = (parameter: FinancialParameter) => {
    setParameterToEdit(parameter);
    setShowCreateModal(true);
  };

  const handleUpdateParameter = async (paramData: FinancialParameterFormData) => {
    if (parameterToEdit) {
      try {
        await updateParameter(parameterToEdit.id, paramData);
        setParameterToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
        alert(err instanceof Error ? err.message : 'Erro ao atualizar parâmetro');
      }
    }
  };

  const handleDeleteParameter = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este parâmetro? Esta ação não pode ser desfeita.')) {
      try {
        await deleteParameter(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir parâmetro');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setParameterToEdit(null);
  };

  const filteredParameters = getFilteredParameters(
    searchTerm,
    categoryFilter,
    typeFilter,
    sectorFilter,
    showSystemParams,
    showCompanyParams
  );

  // Estatísticas
  const totalParameters = parameters.length;
  const systemParameters = parameters.filter(p => p.isSystem).length;
  const companyParameters = parameters.filter(p => p.companyId).length;
  const globalParameters = parameters.filter(p => !p.companyId && !p.isSystem).length;
  const activeParameters = parameters.filter(p => p.isActive).length;

  // Contagem por categoria
  const taxParams = parameters.filter(p => p.category === 'tax').length;
  const budgetParams = parameters.filter(p => p.category === 'budget').length;
  const accountingParams = parameters.filter(p => p.category === 'accounting').length;
  const approvalParams = parameters.filter(p => p.category === 'approval').length;
  const systemParams = parameters.filter(p => p.category === 'system').length;
  const sectorParams = parameters.filter(p => p.category === 'sector').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Parâmetros Financeiros</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany 
              ? `Gerencie os parâmetros financeiros da ${activeCompany.name} e parâmetros globais` 
              : 'Gerencie os parâmetros financeiros do sistema'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Parâmetro</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Info Box for Staff */}
      {(user?.role === 'admin' || user?.role === 'staff') && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start">
          <Info className="w-5 h-5 mr-2 mt-0.5" />
          <div>
            <p className="font-medium">Modo Staff</p>
            <p className="text-sm">Como membro da equipe de staff, você tem permissão para criar e editar parâmetros do sistema. Tenha cuidado ao modificar esses parâmetros, pois eles afetam o comportamento global da plataforma.</p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Parâmetros</p>
              <p className="text-xl font-bold text-gray-800">{totalParameters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parâmetros do Sistema</p>
              <p className="text-xl font-bold text-gray-800">{systemParameters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parâmetros Globais</p>
              <p className="text-xl font-bold text-gray-800">{globalParameters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parâmetros da Empresa</p>
              <p className="text-xl font-bold text-gray-800">{companyParameters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Parâmetros Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeParameters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Distribuição por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">{parameterCategoryLabels.tax}</p>
            <p className="text-lg font-bold text-blue-800">{taxParams}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 mb-1">{parameterCategoryLabels.budget}</p>
            <p className="text-lg font-bold text-green-800">{budgetParams}</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">{parameterCategoryLabels.accounting}</p>
            <p className="text-lg font-bold text-purple-800">{accountingParams}</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-600 mb-1">{parameterCategoryLabels.approval}</p>
            <p className="text-lg font-bold text-yellow-800">{approvalParams}</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">{parameterCategoryLabels.system}</p>
            <p className="text-lg font-bold text-gray-800">{systemParams}</p>
          </div>
          
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <p className="text-xs text-indigo-600 mb-1">{parameterCategoryLabels.sector}</p>
            <p className="text-lg font-bold text-indigo-800">{sectorParams}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar parâmetros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(parameterCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(parameterValueTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          
          {categoryFilter === 'sector' && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os setores</option>
              {economicSectors.map((sector) => (
                <option key={sector.id} value={sector.id}>{sector.name}</option>
              ))}
            </select>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSystemParams}
                onChange={(e) => setShowSystemParams(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Sistema</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showCompanyParams}
                onChange={(e) => setShowCompanyParams(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Empresa</span>
            </label>
          </div>
        </div>
      </div>

      {/* Parameters List */}
      <div className="space-y-4">
        {filteredParameters.map((parameter) => (
          <ParameterCard
            key={parameter.id}
            parameter={parameter}
            onEdit={handleEditParameter}
            onDelete={handleDeleteParameter}
            canEdit={!parameter.isSystem || canEditSystemParameters}
          />
        ))}
      </div>

      {filteredParameters.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parâmetro encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || !showSystemParams || !showCompanyParams
              ? 'Ajuste os filtros ou crie um novo parâmetro'
              : 'Crie seu primeiro parâmetro financeiro para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Parâmetro Financeiro</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <ParameterForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={parameterToEdit ? handleUpdateParameter : handleCreateParameter}
        initialData={parameterToEdit}
        canEditSystemParameters={canEditSystemParameters}
      />
    </div>
  );
}