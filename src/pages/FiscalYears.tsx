import React, { useState } from 'react';
import { Plus, Search, Calendar, Clock, Star, Edit, Trash2, Archive, CheckCircle } from 'lucide-react';
import { CreateFiscalYearModal } from '../components/FiscalYears/CreateFiscalYearModal';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { FiscalYear } from '../types';

export function FiscalYears() {
  const { 
    fiscalYears, 
    isLoading, 
    addFiscalYear, 
    updateFiscalYear, 
    deleteFiscalYear, 
    setDefaultFiscalYear,
    getFilteredFiscalYears 
  } = useFiscalYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateFiscalYear = (newFiscalYear: Omit<FiscalYear, 'id' | 'createdAt' | 'budgetVersion'>) => {
    addFiscalYear(newFiscalYear);
    setShowCreateModal(false);
  };

  const handleSetDefault = (id: string) => {
    setDefaultFiscalYear(id);
  };

  const handleEdit = (fiscalYear: FiscalYear) => {
    // TODO: Implement edit functionality
    console.log('Edit fiscal year:', fiscalYear);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício orçamentário?')) {
      deleteFiscalYear(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'planning':
        return 'Planejamento';
      case 'closed':
        return 'Encerrado';
      case 'archived':
        return 'Arquivado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'planning':
        return <Clock className="w-4 h-4" />;
      case 'closed':
        return <Archive className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const filteredFiscalYears = getFilteredFiscalYears(searchTerm, statusFilter);

  // Calculate summary statistics
  const totalYears = fiscalYears.length;
  const activeYears = fiscalYears.filter(fy => fy.status === 'active').length;
  const planningYears = fiscalYears.filter(fy => fy.status === 'planning').length;
  const closedYears = fiscalYears.filter(fy => fy.status === 'closed').length;

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
          <h1 className="text-2xl font-bold text-gray-800">Exercícios Orçamentários</h1>
          <p className="text-gray-600 mt-1">Gerencie os períodos orçamentários e suas versões</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Exercício</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
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
      </div>

      {/* Fiscal Years List */}
      <div className="space-y-4">
        {filteredFiscalYears.map((fiscalYear) => {
          const utilization = fiscalYear.totalBudget && fiscalYear.totalBudget > 0 
            ? (fiscalYear.totalSpent || 0) / fiscalYear.totalBudget * 100 
            : 0;

          return (
            <div key={fiscalYear.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-800">{fiscalYear.name}</h3>
                      {fiscalYear.isDefault && (
                        <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                          <Star className="w-3 h-3" />
                          <span>Padrão</span>
                        </div>
                      )}
                      <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fiscalYear.status)}`}>
                        {getStatusIcon(fiscalYear.status)}
                        <span>{getStatusLabel(fiscalYear.status)}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>Ano: {fiscalYear.year}</span>
                      <span>•</span>
                      <span>
                        {new Date(fiscalYear.startDate).toLocaleDateString('pt-BR')} - {new Date(fiscalYear.endDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span>•</span>
                      <span>Versão: {fiscalYear.budgetVersion}</span>
                    </div>
                    
                    {fiscalYear.description && (
                      <p className="text-sm text-gray-600 mt-2">{fiscalYear.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!fiscalYear.isDefault && fiscalYear.status !== 'archived' && (
                    <button
                      onClick={() => handleSetDefault(fiscalYear.id)}
                      className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Definir como padrão"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleEdit(fiscalYear)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  {fiscalYear.status !== 'active' && !fiscalYear.isDefault && (
                    <button
                      onClick={() => handleDelete(fiscalYear.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Budget Information */}
              {fiscalYear.totalBudget && fiscalYear.totalBudget > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 font-medium mb-1">Orçamento Total</p>
                    <p className="text-lg font-bold text-blue-800">
                      R$ {fiscalYear.totalBudget.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-600 font-medium mb-1">Total Gasto</p>
                    <p className="text-lg font-bold text-purple-800">
                      R$ {(fiscalYear.totalSpent || 0).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 font-medium mb-1">Utilização</p>
                    <p className={`text-lg font-bold ${
                      utilization > 90 ? 'text-red-600' :
                      utilization > 75 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {utilization.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Bar for active/closed years */}
              {fiscalYear.totalBudget && fiscalYear.totalBudget > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Execução Orçamentária</span>
                    <span className="text-gray-500">{utilization.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        utilization > 90 ? 'bg-red-500' :
                        utilization > 75 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Criado por {fiscalYear.createdBy} em {new Date(fiscalYear.createdAt).toLocaleDateString('pt-BR')}</span>
                  {fiscalYear.closedAt && (
                    <span>Encerrado em {new Date(fiscalYear.closedAt).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFiscalYears.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum exercício orçamentário encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Ajuste os filtros ou crie um novo exercício orçamentário'
              : 'Crie um novo exercício orçamentário para começar'
            }
          </p>
        </div>
      )}

      {/* Create Modal */}
      <CreateFiscalYearModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateFiscalYear}
      />
    </div>
  );
}