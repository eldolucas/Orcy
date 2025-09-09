import React, { useState } from 'react';
import { Plus, Search, Filter, Receipt, Calendar, Building2, TrendingUp, CheckCircle, X, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { ExpenseFormModal } from '../components/Expenses/ExpenseFormModal';
import { ExpenseDetailsModal } from '../components/Expenses/ExpenseDetailsModal';
import { useExpenses } from '../hooks/useExpenses';
import { useCostCenters } from '../hooks/useCostCenters';
import { useBudgets } from '../hooks/useBudgets';
import { useFiscalYears } from '../hooks/useFiscalYears';
import { useAuth } from '../contexts/AuthContext';
import { Expense } from '../types';

export function Expenses() {
  const { user } = useAuth();
  const { 
    expenses, 
    isLoading, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    approveExpense, 
    rejectExpense,
    getFilteredExpenses,
    getTotalExpensesByStatus,
    getExpenseCategories 
  } = useExpenses();
  
  const { costCenters } = useCostCenters();
  const { budgets } = useBudgets();
  const { fiscalYears } = useFiscalYears();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseDetails, setExpenseDetails] = useState<Expense | null>(null);

  const handleSaveExpense = async (expenseData: any) => {
    try {
    if (expenseToEdit) {
      // Editing existing expense
        await updateExpense(expenseToEdit.id, expenseData);
    } else {
      // Creating new expense
        await addExpense(expenseData);
    }
      setShowCreateModal(false);
      setExpenseToEdit(null);
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  const handleApproveExpense = async (id: string) => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      try {
        await approveExpense(id, user.name);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao aprovar despesa');
      }
    }
  };

  const handleRejectExpense = async (id: string) => {
    if (user && (user.role === 'admin' || user.role === 'manager')) {
      const reason = prompt('Motivo da rejeição (opcional):');
      try {
        await rejectExpense(id, user.name, reason || undefined);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao rejeitar despesa');
      }
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setExpenseToEdit(expense);
    setShowCreateModal(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      deleteExpense(id).catch(err => {
        alert(err instanceof Error ? err.message : 'Erro ao excluir despesa');
      });
    }
  };

  const handleViewDetails = (expense: Expense) => {
    setExpenseDetails(expense);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowDetailsModal(false);
    setExpenseToEdit(null);
    setExpenseDetails(null);
  };

  const filteredExpenses = getFilteredExpenses(searchTerm, statusFilter, costCenterFilter, categoryFilter);
  const expenseCategories = getExpenseCategories();

  // Calculate summary statistics
  const totalExpenses = expenses.length;
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
  const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected').length;
  
  const totalPendingAmount = getTotalExpensesByStatus('pending');
  const totalApprovedAmount = getTotalExpensesByStatus('approved');
  const totalRejectedAmount = getTotalExpensesByStatus('rejected');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <X className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
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

  const canApproveReject = user && (user.role === 'admin' || user.role === 'manager');

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
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Despesas</h1>
          <p className="text-gray-600 mt-1">Registre e gerencie todas as despesas da empresa</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={!activeCompany}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            activeCompany 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Nova Despesa</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Despesas</p>
              <p className="text-xl font-bold text-gray-800">{totalExpenses}</p>
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
              <p className="text-xl font-bold text-gray-800">{pendingExpenses}</p>
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
              <p className="text-sm text-gray-600">Aprovadas</p>
              <p className="text-xl font-bold text-gray-800">{approvedExpenses}</p>
              <p className="text-xs text-gray-500">R$ {totalApprovedAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejeitadas</p>
              <p className="text-xl font-bold text-gray-800">{rejectedExpenses}</p>
              <p className="text-xs text-gray-500">R$ {totalRejectedAmount.toLocaleString()}</p>
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
                placeholder="Buscar despesas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="approved">Aprovado</option>
            <option value="rejected">Rejeitado</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as categorias</option>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={costCenterFilter}
            onChange={(e) => setCostCenterFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

      {/* Expenses List */}
      <div className="space-y-4">
        {filteredExpenses.map((expense) => (
          <div key={expense.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{expense.description}</h3>
                    <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                      {getStatusIcon(expense.status)}
                      <span>{getStatusLabel(expense.status)}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(expense.date).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 mr-2" />
                      {getCostCenterName(expense.costCenterId)}
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      {expense.category}
                    </div>
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 mr-2" />
                      {getBudgetName(expense.budgetId)}
                    </div>
                  </div>
                  
                  {expense.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{expense.notes}"</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    R$ {expense.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Por {expense.createdBy}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(expense)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  
                  {expense.status === 'pending' && (
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar despesa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  
                  {expense.status === 'pending' && canApproveReject && (
                    <>
                      <button
                        onClick={() => handleApproveExpense(expense.id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                        title="Aprovar despesa"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleRejectExpense(expense.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Rejeitar despesa"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {expense.status === 'pending' && (
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Excluir despesa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Approval/Rejection Information */}
            {expense.status !== 'pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {expense.status === 'approved' && expense.approvedBy && expense.approvedAt && (
                      <>Aprovado por {expense.approvedBy} em {new Date(expense.approvedAt).toLocaleDateString('pt-BR')}</>
                    )}
                    {expense.status === 'rejected' && expense.rejectedBy && expense.rejectedAt && (
                      <>Rejeitado por {expense.rejectedBy} em {new Date(expense.rejectedAt).toLocaleDateString('pt-BR')}</>
                    )}
                  </span>
                  <span>Última atualização: {new Date(expense.lastUpdated).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredExpenses.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma despesa encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || costCenterFilter !== 'all' || categoryFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova despesa'
              : 'Crie uma nova despesa para começar'
            }
          </p>
        </div>
      )}

      {/* Create Modal */}
      <ExpenseFormModal
        isOpen={showCreateModal}
        onClose={handleCloseModals}
        onSave={handleSaveExpense}
        costCenters={costCenters}
        budgets={budgets}
        fiscalYears={fiscalYears}
        initialData={expenseToEdit}
      />

      {/* Details Modal */}
      <ExpenseDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        expense={expenseDetails}
        costCenters={costCenters}
        budgets={budgets}
        fiscalYears={fiscalYears}
      />
    </div>
  );
}