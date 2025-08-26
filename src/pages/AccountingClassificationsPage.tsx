import React, { useState } from 'react';
import { Plus, Search, Filter, Tag, CheckCircle, XCircle } from 'lucide-react';
import { AccountingClassificationCard } from '../components/AccountingClassifications/AccountingClassificationCard';
import { AccountingClassificationForm } from '../components/AccountingClassifications/AccountingClassificationForm';
import { useAccountingClassifications } from '../hooks/useAccountingClassifications';
import { AccountingClassification, accountingTypeLabels } from '../types/accountingClassification';

export function AccountingClassificationsPage() {
  const { 
    accountingClassifications, 
    isLoading, 
    error,
    addAccountingClassification, 
    updateAccountingClassification, 
    deleteAccountingClassification, 
    getFilteredAccountingClassifications 
  } = useAccountingClassifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [classificationToEdit, setClassificationToEdit] = useState<AccountingClassification | null>(null);

  const handleCreateClassification = (classificationData: any) => {
    addAccountingClassification(classificationData)
      .then(() => {
        setShowCreateModal(false);
      })
      .catch(() => {
        // Error is handled in the hook and displayed in the UI
      });
  };

  const handleEditClassification = (classification: AccountingClassification) => {
    setClassificationToEdit(classification);
    setShowCreateModal(true);
  };

  const handleUpdateClassification = (classificationData: any) => {
    if (classificationToEdit) {
      updateAccountingClassification(classificationToEdit.id, classificationData)
        .then(() => {
          setClassificationToEdit(null);
          setShowCreateModal(false);
        })
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });
    }
  };

  const handleDeleteClassification = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta classificação contábil? Esta ação não pode ser desfeita.')) {
      deleteAccountingClassification(id)
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setClassificationToEdit(null);
  };

  const filteredClassifications = getFilteredAccountingClassifications(searchTerm, typeFilter, statusFilter);

  // Estatísticas
  const totalClassifications = accountingClassifications.length;
  const activeClassifications = accountingClassifications.filter(c => c.isActive).length;
  const inactiveClassifications = accountingClassifications.filter(c => !c.isActive).length;
  
  // Contagem por tipo
  const countByType: Record<string, number> = {
    revenue: 0,
    expense: 0,
    asset: 0,
    liability: 0,
    equity: 0
  };
  
  accountingClassifications.forEach(c => {
    if (countByType[c.type] !== undefined) {
      countByType[c.type]++;
    }
  });

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
          <h1 className="text-2xl font-bold text-gray-800">Classificação Contábil</h1>
          <p className="text-gray-600 mt-1">Gerencie as classificações contábeis do sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Classificação</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">{totalClassifications}</p>
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
              <p className="text-xl font-bold text-gray-800">{activeClassifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inativas</p>
              <p className="text-xl font-bold text-gray-800">{inactiveClassifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Receitas</p>
              <p className="text-xl font-bold text-gray-800">{countByType.revenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Despesas</p>
              <p className="text-xl font-bold text-gray-800">{countByType.expense}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-xl font-bold text-gray-800">{countByType.asset}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passivos/PL</p>
              <p className="text-xl font-bold text-gray-800">{countByType.liability + countByType.equity}</p>
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
            placeholder="Buscar classificações..."
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
          {Object.entries(accountingTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>
      </div>

      {/* Classifications List */}
      <div className="space-y-4">
        {filteredClassifications.map((classification) => (
          <AccountingClassificationCard
            key={classification.id}
            classification={classification}
            onEdit={handleEditClassification}
            onDelete={handleDeleteClassification}
          />
        ))}
      </div>

      {filteredClassifications.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma classificação encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova classificação'
              : 'Crie sua primeira classificação contábil para começar'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AccountingClassificationForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={classificationToEdit ? handleUpdateClassification : handleCreateClassification}
        initialData={classificationToEdit}
      />
    </div>
  );
}