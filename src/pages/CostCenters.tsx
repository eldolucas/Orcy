import React, { useState } from 'react';
import { Plus, Search, Filter, Building2, BarChart3, Users, AlertTriangle, Download, Upload } from 'lucide-react';
import { CostCenterCard } from '../components/CostCenters/CostCenterCard';
import { CreateCostCenterModal } from '../components/CostCenters/CreateCostCenterModal';
import { EditCostCenterModal } from '../components/CostCenters/EditCostCenterModal';
import { useCostCenters } from '../hooks/useCostCenters';
import { useAuth } from '../contexts/AuthContext';
import { CostCenter } from '../types';

export function CostCenters() {
  const { activeCompany, isLoading: authLoading } = useAuth();
  const { 
    costCenters, 
    hierarchicalCenters, 
    isLoading, 
    error,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    toggleExpansion, 
    getFilteredCenters
  } = useCostCenters();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [costCenterToEdit, setCostCenterToEdit] = useState<CostCenter | null>(null);
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy');

  const handleCreateCostCenter = async (newCostCenter: Partial<CostCenter>) => {
    try {
      await addCostCenter(newCostCenter);
      setShowCreateModal(false);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleEditCostCenter = async (costCenter: CostCenter) => {
    setCostCenterToEdit(costCenter);
    setShowEditModal(true);
  };

  const handleUpdateCostCenter = async (id: string, updates: Partial<CostCenter>) => {
    try {
      await updateCostCenter(id, updates);
      setShowEditModal(false);
      setCostCenterToEdit(null);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleDeleteCostCenter = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este centro de custo? Esta ação não pode ser desfeita.')) {
      try {
        await deleteCostCenter(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir centro de custo');
      }
    }
  };

  const filteredCenters = getFilteredCenters(searchTerm, statusFilter);
  const displayCenters = viewMode === 'hierarchy' ? hierarchicalCenters : filteredCenters;

  // Calculate summary statistics
  const totalBudget = costCenters.reduce((sum, center) => sum + center.budget, 0);
  const totalSpent = costCenters.reduce((sum, center) => sum + center.spent, 0);
  const totalCenters = costCenters.length;
  const activeCenters = costCenters.filter(c => c.status === 'active').length;
  const overBudgetCenters = costCenters.filter(c => (c.spent / c.budget) > 0.9).length;

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
          <h1 className="text-2xl font-bold text-gray-800">Centros de Custo</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie a estrutura hierárquica de centros de custo da ${activeCompany.name}` : 
             'Gerencie a estrutura hierárquica de centros de custo'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!activeCompany || authLoading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeCompany && !authLoading
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Novo Centro</span>
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
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Centros</p>
              <p className="text-xl font-bold text-gray-800">{totalCenters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Centros Ativos</p>
              <p className="text-xl font-bold text-gray-800">{activeCenters}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Orçamento Total</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Gasto</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Acima de 90%</p>
              <p className="text-xl font-bold text-gray-800">{overBudgetCenters}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar centros de custo..."
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
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Exportar centros de custo"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Exportar</span>
              </button>
              <button
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Importar centros de custo"
              >
                <Upload className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Importar</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('hierarchy')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'hierarchy'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Hierárquico
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'flat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Centers Display */}
      <div className="space-y-4">
        {viewMode === 'hierarchy' ? (
          // Hierarchical view
          hierarchicalCenters.length > 0 ? (
            hierarchicalCenters.map((costCenter) => (
              <CostCenterCard
                key={costCenter.id}
                costCenter={costCenter}
                onToggleExpansion={toggleExpansion}
                onEdit={handleEditCostCenter}
                onDelete={handleDeleteCostCenter}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum centro de custo encontrado</h3>
              <p className="text-gray-500">Crie um novo centro de custo para começar</p>
              <p className="text-gray-500 mb-4">Crie um novo centro de custo para começar</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Centro de Custo</span>
              </button>
            </div>
          )
        ) : (
          // Flat view
          filteredCenters.length > 0 ? (
            filteredCenters.map((costCenter) => (
              <CostCenterCard
                key={costCenter.id}
                costCenter={costCenter}
                onToggleExpansion={toggleExpansion}
                onEdit={handleEditCostCenter}
                onDelete={handleDeleteCostCenter}
                level={0}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum centro de custo encontrado</h3>
              <p className="text-gray-500">Ajuste os filtros ou crie um novo centro de custo</p>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Ajuste os filtros ou crie um novo centro de custo'
                  : 'Crie um novo centro de custo para começar'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Centro de Custo</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Create Modal */}
      <CreateCostCenterModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCostCenter}
        parentCostCenters={costCenters}
      />

      {/* Edit Modal */}
      <EditCostCenterModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setCostCenterToEdit(null);
        }}
        onSave={handleUpdateCostCenter}
        costCenter={costCenterToEdit}
        parentCostCenters={costCenters}
      />
    </div>
  );
}