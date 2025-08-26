import React, { useState } from 'react';
import { Plus, Search, Filter, Monitor, Calendar, DollarSign, Building2, CheckCircle, XCircle, Truck, Home, BookOpen, Map, Package } from 'lucide-react';
import { FixedAssetCard } from '../components/FixedAssets/FixedAssetCard';
import { FixedAssetForm } from '../components/FixedAssets/FixedAssetForm';
import { useFixedAssets } from '../hooks/useFixedAssets';
import { useCostCenters } from '../hooks/useCostCenters';
import { useFinancialYears } from '../hooks/useFinancialYears';
import { useAuth } from '../contexts/AuthContext';
import { FixedAsset, FixedAssetFormData, assetCategoryLabels, assetStatusLabels } from '../types/fixedAsset';

export function FixedAssetsPage() {
  const { activeCompany } = useAuth();
  const { 
    fixedAssets, 
    isLoading, 
    error,
    addFixedAsset, 
    updateFixedAsset, 
    deleteFixedAsset, 
    getFilteredFixedAssets,
    getFixedAssetsByCategory,
    getTotalAcquisitionValue,
    getTotalCurrentValue,
    getTotalDepreciation
  } = useFixedAssets();
  
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [fiscalYearFilter, setFiscalYearFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<FixedAsset | null>(null);

  const handleCreateAsset = async (formData: FixedAssetFormData) => {
    try {
      await addFixedAsset(formData);
      setShowCreateModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar ativo imobilizado');
    }
  };

  const handleEditAsset = (asset: FixedAsset) => {
    setAssetToEdit(asset);
    setShowCreateModal(true);
  };

  const handleUpdateAsset = async (formData: FixedAssetFormData) => {
    if (assetToEdit) {
      try {
        await updateFixedAsset(assetToEdit.id, formData);
        setAssetToEdit(null);
        setShowCreateModal(false);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao atualizar ativo imobilizado');
      }
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo imobilizado? Esta ação não pode ser desfeita.')) {
      try {
        await deleteFixedAsset(id);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao excluir ativo imobilizado');
      }
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setAssetToEdit(null);
  };

  const filteredAssets = getFilteredFixedAssets(
    searchTerm,
    categoryFilter,
    statusFilter,
    costCenterFilter,
    fiscalYearFilter
  );

  // Funções auxiliares para obter objetos relacionados
  const getCostCenter = (id: string) => costCenters.find(cc => cc.id === id);
  const getFiscalYear = (id: string) => financialYears.find(fy => fy.id === id);

  // Estatísticas
  const totalAssets = fixedAssets.length;
  const activeAssets = fixedAssets.filter(a => a.status === 'active').length;
  const plannedAssets = fixedAssets.filter(a => a.status === 'planned').length;
  const disposedAssets = fixedAssets.filter(a => a.status === 'disposed').length;
  const totalAcquisitionValue = getTotalAcquisitionValue();
  const totalCurrentValue = getTotalCurrentValue();
  const totalDepreciation = getTotalDepreciation();
  
  // Contagem por categoria
  const equipmentCount = getFixedAssetsByCategory('equipment').length;
  const vehicleCount = getFixedAssetsByCategory('vehicle').length;
  const furnitureCount = getFixedAssetsByCategory('furniture').length;
  const buildingCount = getFixedAssetsByCategory('building').length;
  const landCount = getFixedAssetsByCategory('land').length;
  const softwareCount = getFixedAssetsByCategory('software').length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <Monitor className="w-5 h-5 text-blue-600" />;
      case 'vehicle':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'furniture':
        return <Home className="w-5 h-5 text-green-600" />;
      case 'building':
        return <Building2 className="w-5 h-5 text-yellow-600" />;
      case 'land':
        return <Map className="w-5 h-5 text-orange-600" />;
      case 'software':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Ativos Imobilizados</h1>
          <p className="text-gray-600 mt-1">
            {activeCompany ? `Gerencie os ativos imobilizados da ${activeCompany.name}` : 
             'Gerencie equipamentos, veículos, imóveis e outros ativos imobilizados'}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Ativo</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Ativos</p>
              <p className="text-xl font-bold text-gray-800">{totalAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos em Uso</p>
              <p className="text-xl font-bold text-gray-800">{activeAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Planejados</p>
              <p className="text-xl font-bold text-gray-800">{plannedAssets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Baixados</p>
              <p className="text-xl font-bold text-gray-800">{disposedAssets}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor de Aquisição</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalAcquisitionValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Depreciação Acumulada</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalDepreciation.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor Atual</p>
              <p className="text-xl font-bold text-gray-800">R$ {totalCurrentValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Distribuição por Categoria</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-xs text-blue-600 mb-1">Equipamentos</p>
            <p className="text-lg font-bold text-blue-800">{equipmentCount}</p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Truck className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-xs text-purple-600 mb-1">Veículos</p>
            <p className="text-lg font-bold text-purple-800">{vehicleCount}</p>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-xs text-green-600 mb-1">Móveis</p>
            <p className="text-lg font-bold text-green-800">{furnitureCount}</p>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="w-6 h-6 text-yellow-600" />
            </div>
            <p className="text-xs text-yellow-600 mb-1">Edificações</p>
            <p className="text-lg font-bold text-yellow-800">{buildingCount}</p>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Map className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-xs text-orange-600 mb-1">Terrenos</p>
            <p className="text-lg font-bold text-orange-800">{landCount}</p>
          </div>
          
          <div className="text-center p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-xs text-indigo-600 mb-1">Software</p>
            <p className="text-lg font-bold text-indigo-800">{softwareCount}</p>
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
                placeholder="Buscar ativos..."
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
            {Object.entries(assetCategoryLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            {Object.entries(assetStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
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

      {/* Fixed Assets List */}
      <div className="space-y-4">
        {filteredAssets.map((asset) => (
          <FixedAssetCard
            key={asset.id}
            asset={asset}
            costCenter={getCostCenter(asset.costCenterId)}
            fiscalYear={getFiscalYear(asset.fiscalYearId)}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ativo imobilizado encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || 
             costCenterFilter !== 'all' || fiscalYearFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo ativo imobilizado'
              : 'Crie seu primeiro ativo imobilizado para começar'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Ativo Imobilizado</span>
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <FixedAssetForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={assetToEdit ? handleUpdateAsset : handleCreateAsset}
        initialData={assetToEdit}
      />
    </div>
  );
}