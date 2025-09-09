import React, { useState } from 'react';
import { Plus, Search, DollarSign, Calendar, Building2, TrendingUp, CheckCircle, X, Clock, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { RevenueFormModal } from '../components/Revenues/RevenueFormModal';
import { RevenueDetailsModal } from '../components/Revenues/RevenueDetailsModal';
import { useRevenues } from '../hooks/useRevenues';
import { useCostCenters } from '../hooks/useCostCenters';
import { useBudgets } from '../hooks/useBudgets';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { useAuth } from '../contexts/AuthContext';
import { Revenue } from '../types';

export function Revenues() {
  const { user } = useAuth();
  const { 
    revenues, 
    isLoading, 
    addRevenue, 
    updateRevenue, 
    deleteRevenue, 
    confirmRevenue, 
    cancelRevenue,
    getFilteredRevenues,
    getTotalRevenuesByStatus,
    getRevenueSources 
  } = useRevenues();
  
  const { costCenters } = useCostCenters();
  const { budgets } = useBudgets();
  const { fiscalYears } = useFiscalYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [revenueToEdit, setRevenueToEdit] = useState<Revenue | null>(null);
  const [revenueDetails, setRevenueDetails] = useState<Revenue | null>(null);

  const handleSaveRevenue = (revenueData: Omit<Revenue, 'id' | 'lastUpdated'> | Revenue) => {
    const saveRevenue = async () => {
      try {
        if (revenueToEdit) {
          // Editing existing revenue
          await updateRevenue(revenueToEdit.id, revenueData as Partial<Revenue>);
        } else {
          // Creating new revenue
          await addRevenue(revenueData as Omit<Revenue, 'id' | 'lastUpdated'>);
        }
        setShowCreateModal(false);
        setRevenueToEdit(null);
      } catch (err) {
        // Error is handled in the hook and displayed in the UI
      }
    };
    
    saveRevenue();
  };

  const handleConfirmRevenue = async (id: string) => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      try {
        await confirmRevenue(id, user.name);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao confirmar receita');
      }
    }
  };

  const handleCancelRevenue = async (id: string) => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      const reason = prompt('Motivo do cancelamento (opcional):');
      try {
        await cancelRevenue(id, user.name, reason || undefined);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao cancelar receita');
      }
    }
  };

  const handleEditRevenue = (revenue: Revenue) => {
    setRevenueToEdit(revenue);
    setShowCreateModal(true);
  };

  const handleDeleteRevenue = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      deleteRevenue(id).catch(err => {
        alert(err instanceof Error ? err.message : 'Erro ao excluir receita');
      });
    }
  };

  const handleViewDetails = (revenue: Revenue) => {
    setRevenueDetails(revenue);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setRevenueToEdit(null);
    setRevenueDetails(null);
  };

  const filteredRevenues = getFilteredRevenues(searchTerm, statusFilter, costCenterFilter, sourceFilter);
  const revenueSources = getRevenueSources();

  // Calculate summary statistics
  const totalRevenues = revenues.length;
  const pendingRevenues = revenues.filter(r => r.status === 'pending').length;
  const confirmedRevenues = revenues.filter(r => r.status === 'confirmed').length;
  const cancelledRevenues = revenues.filter(r => r.status === 'cancelled').length;
  
  const totalPendingAmount = getTotalRevenuesByStatus('pending');
  const totalConfirmedAmount = getTotalRevenuesByStatus('confirmed');
  const totalCancelledAmount = getTotalRevenuesByStatus('cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado';
  };

  const getBudgetName = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    return budget ? budget.name : 'Orçamento não encontrado';
  };

  const canConfirmCancel = user && (user.role === 'admin' || user.role === 'manager');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Receitas</h1>
          <p className="text-gray-600 mt-1">Registre e gerencie todas as receitas da empresa</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!activeCompany}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeCompany 
              ? 'bg-green-600 text-white hover:bg-green-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Receitas</p>
              <p className="text-xl font-bold text-gray-800">{totalRevenues}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-gray-800">{pendingRevenues}</p>
              <p className="text-xs text-gray-500">R$ {totalPendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Confirmadas</p>
              <p className="text-xl font-bold text-gray-800">{confirmedRevenues}</p>
              <p className="text-xs text-gray-500">R$ {totalConfirmedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Canceladas</p>
              <p className="text-xl font-bold text-gray-800">{cancelledRevenues}</p>
              <p className="text-xs text-gray-500">R$ {totalCancelledAmount.toLocaleString()}</p>
            </div>
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
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmada</option>
            <option value="cancelled">Cancelada</option>
          </select>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas as fontes</option>
            {revenueSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>

          <select
            value={costCenterFilter}
            onChange={(e) => setCostCenterFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos os centros</option>
            {costCenters.map((center) => (
              <option key={center.id} value={center.id}>
                {center.code} - {center.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenues List */}
      <div className="space-y-4">
        {filteredRevenues.map((revenue) => (
          <div key={revenue.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{revenue.description}</h3>
                    <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revenue.status)}`}>
                      {getStatusIcon(revenue.status)}
                      <span>{getStatusLabel(revenue.status)}</span>
                    </span>
                    {revenue.recurrenceType && revenue.recurrenceType !== 'none' && (
                      <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        <RefreshCw className="w-3 h-3" />
                        <span>Recorrente</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(revenue.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      {getCostCenterName(revenue.costCenterId)}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {revenue.source}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      {getBudgetName(revenue.budgetId)}
                    </div>
                  </div>
                  
                  {revenue.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{revenue.notes}"</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    R$ {revenue.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Por {revenue.createdBy}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(revenue)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {revenue.status === 'pending' && (
                    <button
                      onClick={() => handleEditRevenue(revenue)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar receita"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {revenue.status === 'pending' && canConfirmCancel && (
                    <>
                      <button
                        onClick={() => handleConfirmRevenue(revenue.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Confirmar receita"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleCancelRevenue(revenue.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Cancelar receita"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {revenue.status === 'pending' && (
                    <button
                      onClick={() => handleDeleteRevenue(revenue.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir receita"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation/Cancellation Information */}
            {revenue.status !== 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {revenue.status === 'confirmed' && revenue.confirmedBy && revenue.confirmedAt && (
                      <>Confirmada por {revenue.confirmedBy} em {new Date(revenue.confirmedAt).toLocaleDateString('pt-BR')}</>
                    )}
                    {revenue.status === 'cancelled' && revenue.cancelledBy && revenue.cancelledAt && (
                      <>Cancelada por {revenue.cancelledBy} em {new Date(revenue.cancelledAt).toLocaleDateString('pt-BR')}</>
                    )}
                  </span>
                  <span>Última atualização: {new Date(revenue.lastUpdated).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRevenues.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma receita encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || costCenterFilter !== 'all' || sourceFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova receita'
              : 'Crie uma nova receita para começar'
            }
          </p>
        </div>
      )}

      {/* Create Modal */}
      <RevenueFormModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={handleSaveRevenue}
        costCenters={costCenters}
        budgets={budgets}
        fiscalYears={fiscalYears}
        initialData={revenueToEdit}
      />

      {/* Details Modal */}
      <RevenueDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        revenue={revenueDetails}
        costCenters={costCenters}
        budgets={budgets}
        fiscalYears={fiscalYears}
      />
    </div>
  );
}