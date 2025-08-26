import React, { useState } from 'react';
import { Plus, Search, Filter, Package, CheckCircle, XCircle, Clock, Tag } from 'lucide-react';
import { InsumoCard } from '../components/Insumos/InsumoCard';
import { InsumoForm } from '../components/Insumos/InsumoForm';
import { useInsumos } from '../hooks/useInsumos';
import { Insumo, insumoTypeLabels } from '../types/insumo';

export function InsumosPage() {
  const { 
    insumos, 
    isLoading, 
    error,
    addInsumo, 
    updateInsumo, 
    deleteInsumo, 
    getFilteredInsumos 
  } = useInsumos();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [insumoToEdit, setInsumoToEdit] = useState<Insumo | null>(null);

  const handleCreateInsumo = (insumoData: any) => {
    addInsumo(insumoData)
      .then(() => {
        setShowCreateModal(false);
      })
      .catch(() => {
        // Error is handled in the hook and displayed in the UI
      });
  };

  const handleEditInsumo = (insumo: Insumo) => {
    setInsumoToEdit(insumo);
    setShowCreateModal(true);
  };

  const handleUpdateInsumo = (insumoData: any) => {
    if (insumoToEdit) {
      updateInsumo(insumoToEdit.id, insumoData)
        .then(() => {
          setInsumoToEdit(null);
          setShowCreateModal(false);
        })
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });
    }
  };

  const handleDeleteInsumo = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este insumo? Esta ação não pode ser desfeita.')) {
      deleteInsumo(id)
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setInsumoToEdit(null);
  };

  const filteredInsumos = getFilteredInsumos(searchTerm, typeFilter, statusFilter);

  // Estatísticas
  const totalInsumos = insumos.length;
  const activeInsumos = insumos.filter(i => i.isActive).length;
  const inactiveInsumos = insumos.filter(i => !i.isActive).length;
  
  // Contagem por tipo
  const productCount = insumos.filter(i => i.type === 'product').length;
  const serviceCount = insumos.filter(i => i.type === 'service').length;
  const fundCount = insumos.filter(i => i.type === 'fund').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Insumos</h1>
          <p className="text-gray-600 mt-1">Gerencie os insumos utilizados nos orçamentos</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Insumo</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{totalInsumos}</p>
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
              <p className="text-xl font-bold text-gray-800">{activeInsumos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-xl font-bold text-gray-800">{inactiveInsumos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Produtos</p>
              <p className="text-xl font-bold text-gray-800">{productCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Serviços</p>
              <p className="text-xl font-bold text-gray-800">{serviceCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Verbas</p>
              <p className="text-xl font-bold text-gray-800">{fundCount}</p>
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
            placeholder="Buscar insumos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os tipos</option>
          {Object.entries(insumoTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Insumos List */}
      <div className="space-y-4">
        {filteredInsumos.map((insumo) => (
          <InsumoCard
            key={insumo.id}
            insumo={insumo}
            onEdit={handleEditInsumo}
            onDelete={handleDeleteInsumo}
          />
        ))}
      </div>

      {filteredInsumos.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum insumo encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie um novo insumo'
              : 'Crie seu primeiro insumo para começar'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <InsumoForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={insumoToEdit ? handleUpdateInsumo : handleCreateInsumo}
        initialData={insumoToEdit}
      />
    </div>
  );
}