import React, { useState } from 'react';
import { Search, Filter, CheckCircle, Clock, XCircle, AlertTriangle, Eye, MessageSquare, Calendar, User, Building2, DollarSign } from 'lucide-react';
import { ApprovalWorkflowModal } from '../components/Approvals/ApprovalWorkflowModal';
import { ApprovalDetailsModal } from '../components/Approvals/ApprovalDetailsModal';
import { useApprovals } from '../hooks/useApprovals';
import { useAuth } from '../contexts/AuthContext';
import { ApprovalWorkflow } from '../types';

export function Approvals() {
  const { user } = useAuth();
  const { 
    workflows, 
    isLoading, 
    approveStep, 
    rejectStep, 
    requestChanges,
    getFilteredWorkflows,
    getPendingApprovalsForUser,
    getWorkflowStats,
    getOverdueWorkflows
  } = useApprovals();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assignedToMe, setAssignedToMe] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null);

  const handleApprove = (workflowId: string, stepId: string, comments?: string) => {
    if (user) {
      approveStep(workflowId, stepId, user.id, user.name, comments);
    }
  };

  const handleReject = (workflowId: string, stepId: string, comments?: string) => {
    if (user) {
      rejectStep(workflowId, stepId, user.id, user.name, comments);
    }
  };

  const handleRequestChanges = (workflowId: string, stepId: string, comments: string) => {
    if (user) {
      requestChanges(workflowId, stepId, user.id, user.name, comments);
    }
  };

  const handleViewDetails = (workflow: ApprovalWorkflow) => {
    setSelectedWorkflow(workflow);
    setShowDetailsModal(true);
  };

  const filteredWorkflows = getFilteredWorkflows(
    searchTerm, 
    statusFilter, 
    typeFilter, 
    priorityFilter, 
    assignedToMe, 
    user?.id
  );

  const pendingApprovals = user ? getPendingApprovalsForUser(user.id) : [];
  const stats = getWorkflowStats();
  const overdueWorkflows = getOverdueWorkflows();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
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
      case 'cancelled':
        return 'Cancelado';
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
        return <XCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'expense':
        return 'Despesa';
      case 'revenue':
        return 'Receita';
      case 'budget':
        return 'Orçamento';
      default:
        return type;
    }
  };

  const isOverdue = (workflow: ApprovalWorkflow) => {
    if (!workflow.dueDate || workflow.status !== 'pending') return false;
    return new Date(workflow.dueDate) < new Date();
  };

  const canUserApprove = (workflow: ApprovalWorkflow) => {
    if (!user || workflow.status !== 'pending') return false;
    const currentStep = workflow.steps.find(s => s.stepNumber === workflow.currentStep);
    return currentStep?.approverIds.includes(user.id) || false;
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Aprovações</h1>
          <p className="text-gray-600 mt-1">Gerencie fluxos de aprovação e workflows</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Workflows</p>
              <p className="text-xl font-bold text-gray-800">{stats.total}</p>
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
              <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aprovados</p>
              <p className="text-xl font-bold text-gray-800">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejeitados</p>
              <p className="text-xl font-bold text-gray-800">{stats.rejected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Aguardando Você</p>
              <p className="text-xl font-bold text-gray-800">{pendingApprovals.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Alerts */}
      {overdueWorkflows.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">Workflows em Atraso</h3>
          </div>
          <p className="text-red-700 text-sm mb-3">
            {overdueWorkflows.length} workflow(s) estão em atraso e precisam de atenção imediata.
          </p>
          <div className="space-y-2">
            {overdueWorkflows.slice(0, 3).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between bg-white rounded-lg p-3">
                <div>
                  <p className="font-medium text-gray-800">{workflow.title}</p>
                  <p className="text-sm text-gray-600">Vencimento: {new Date(workflow.dueDate!).toLocaleDateString('pt-BR')}</p>
                </div>
                <button
                  onClick={() => handleViewDetails(workflow)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar workflows..."
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
            <option value="cancelled">Cancelado</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os tipos</option>
            <option value="expense">Despesas</option>
            <option value="revenue">Receitas</option>
            <option value="budget">Orçamentos</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="assignedToMe"
              checked={assignedToMe}
              onChange={(e) => setAssignedToMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="assignedToMe" className="ml-2 text-sm text-gray-700">
              Atribuídos a mim
            </label>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => {
          const currentStep = workflow.steps.find(s => s.stepNumber === workflow.currentStep);
          const userCanApprove = canUserApprove(workflow);
          const workflowIsOverdue = isOverdue(workflow);
          
          return (
            <div key={workflow.id} className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-200 ${
              workflowIsOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:shadow-md'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    {workflow.type === 'expense' ? (
                      <Building2 className="w-6 h-6 text-blue-600" />
                    ) : workflow.type === 'revenue' ? (
                      <DollarSign className="w-6 h-6 text-green-600" />
                    ) : (
                      <Building2 className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{workflow.title}</h3>
                      <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                        {getStatusIcon(workflow.status)}
                        <span>{getStatusLabel(workflow.status)}</span>
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(workflow.priority)}`}>
                        {getPriorityLabel(workflow.priority)}
                      </span>
                      {workflowIsOverdue && (
                        <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Atrasado</span>
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        R$ {workflow.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {workflow.requestedBy}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(workflow.requestedAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 mr-2" />
                        {getTypeLabel(workflow.type)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(workflow)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progresso: Etapa {workflow.currentStep} de {workflow.totalSteps}
                  </span>
                  <span className="text-sm text-gray-500">
                    {currentStep?.name}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      workflow.status === 'approved' ? 'bg-green-500' :
                      workflow.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Step Info */}
              {workflow.status === 'pending' && currentStep && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{currentStep.name}</h4>
                    {workflow.dueDate && (
                      <span className={`text-xs ${workflowIsOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                        Vencimento: {new Date(workflow.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{currentStep.description}</p>
                  
                  {userCanApprove && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const comments = prompt('Comentários (opcional):');
                          handleApprove(workflow.id, currentStep.id, comments || undefined);
                        }}
                        className="flex items-center space-x-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aprovar</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const comments = prompt('Motivo da rejeição:');
                          if (comments) {
                            handleReject(workflow.id, currentStep.id, comments);
                          }
                        }}
                        className="flex items-center space-x-1 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rejeitar</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          const comments = prompt('Solicitação de alterações:');
                          if (comments) {
                            handleRequestChanges(workflow.id, currentStep.id, comments);
                          }
                        }}
                        className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-1 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Solicitar Alterações</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Actions */}
              {currentStep?.approvals.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Ações Recentes</h5>
                  <div className="space-y-2">
                    {currentStep.approvals.slice(-2).map((approval) => (
                      <div key={approval.id} className="flex items-center space-x-3 text-sm">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          approval.action === 'approve' ? 'bg-green-100' :
                          approval.action === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {approval.action === 'approve' ? (
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          ) : approval.action === 'reject' ? (
                            <XCircle className="w-3 h-3 text-red-600" />
                          ) : (
                            <MessageSquare className="w-3 h-3 text-yellow-600" />
                          )}
                        </div>
                        <span className="text-gray-800">{approval.approverName}</span>
                        <span className="text-gray-500">
                          {approval.action === 'approve' ? 'aprovou' :
                           approval.action === 'reject' ? 'rejeitou' : 'solicitou alterações'}
                        </span>
                        <span className="text-gray-400">
                          {new Date(approval.timestamp).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredWorkflows.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum workflow encontrado</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all' || assignedToMe
              ? 'Ajuste os filtros para ver mais workflows'
              : 'Não há workflows de aprovação no momento'
            }
          </p>
        </div>
      )}

      {/* Details Modal */}
      <ApprovalDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        workflow={selectedWorkflow}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestChanges={handleRequestChanges}
        currentUser={user}
      />
    </div>
  );
}