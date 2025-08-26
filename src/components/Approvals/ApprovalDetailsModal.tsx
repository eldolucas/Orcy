import React, { useState } from 'react';
import { X, Clock, CheckCircle, XCircle, MessageSquare, User, Calendar, DollarSign, Building2, AlertTriangle, FileText } from 'lucide-react';
import { ApprovalWorkflow, User as UserType } from '../../types';

interface ApprovalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflow: ApprovalWorkflow | null;
  onApprove: (workflowId: string, stepId: string, comments?: string) => void;
  onReject: (workflowId: string, stepId: string, comments?: string) => void;
  onRequestChanges: (workflowId: string, stepId: string, comments: string) => void;
  currentUser: UserType | null;
}

export function ApprovalDetailsModal({ 
  isOpen, 
  onClose, 
  workflow, 
  onApprove, 
  onReject, 
  onRequestChanges,
  currentUser 
}: ApprovalDetailsModalProps) {
  const [actionComments, setActionComments] = useState('');
  const [showActionForm, setShowActionForm] = useState<'approve' | 'reject' | 'request_changes' | null>(null);

  if (!isOpen || !workflow) return null;

  const currentStep = workflow.steps.find(s => s.stepNumber === workflow.currentStep);
  const userCanApprove = currentUser && workflow.status === 'pending' && 
    currentStep?.approverIds.includes(currentUser.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'approve':
        return 'Aprovou';
      case 'reject':
        return 'Rejeitou';
      case 'request_changes':
        return 'Solicitou Alterações';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'approve':
        return 'text-green-600';
      case 'reject':
        return 'text-red-600';
      case 'request_changes':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleAction = (action: 'approve' | 'reject' | 'request_changes') => {
    if (!currentStep) return;

    switch (action) {
      case 'approve':
        onApprove(workflow.id, currentStep.id, actionComments || undefined);
        break;
      case 'reject':
        onReject(workflow.id, currentStep.id, actionComments || undefined);
        break;
      case 'request_changes':
        if (actionComments.trim()) {
          onRequestChanges(workflow.id, currentStep.id, actionComments);
        }
        break;
    }

    setActionComments('');
    setShowActionForm(null);
    onClose();
  };

  const isOverdue = workflow.dueDate && workflow.status === 'pending' && 
    new Date(workflow.dueDate) < new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Detalhes do Workflow</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{workflow.title}</h3>
                <p className="text-gray-600 mb-4">{workflow.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Valor:</span>
                    <span className="font-medium text-gray-800">R$ {workflow.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Solicitado por:</span>
                    <span className="font-medium text-gray-800">{workflow.requestedBy}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(workflow.requestedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium text-gray-800">{getTypeLabel(workflow.type)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right space-y-2">
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 ${getStatusColor(workflow.status)}`}>
                  {getStatusIcon(workflow.status)}
                  <span className="font-medium">{getStatusLabel(workflow.status)}</span>
                </div>
                
                <div className={`inline-flex px-3 py-1 rounded-lg border ${getPriorityColor(workflow.priority)} block`}>
                  <span className="font-medium">{getPriorityLabel(workflow.priority)}</span>
                </div>

                {isOverdue && (
                  <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-red-100 text-red-800 border border-red-200 block">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Atrasado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Progresso: Etapa {workflow.currentStep} de {workflow.totalSteps}
                </span>
                {workflow.dueDate && (
                  <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                    Vencimento: {new Date(workflow.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    workflow.status === 'approved' ? 'bg-green-500' :
                    workflow.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${(workflow.currentStep / workflow.totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Etapas do Workflow</h4>
            <div className="space-y-4">
              {workflow.steps.map((step, index) => {
                const isCurrentStep = step.stepNumber === workflow.currentStep;
                const isCompleted = step.stepNumber < workflow.currentStep || step.status === 'approved';
                const isFutureStep = step.stepNumber > workflow.currentStep;
                
                return (
                  <div key={step.id} className={`border rounded-lg p-4 ${
                    isCurrentStep ? 'border-blue-300 bg-blue-50' :
                    isCompleted ? 'border-green-300 bg-green-50' :
                    step.status === 'rejected' ? 'border-red-300 bg-red-50' :
                    'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' :
                          isCurrentStep ? 'bg-blue-100' :
                          step.status === 'rejected' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : isCurrentStep ? (
                            <Clock className="w-4 h-4 text-blue-600" />
                          ) : step.status === 'rejected' ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">{step.stepNumber}</span>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800">{step.name}</h5>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          step.status === 'approved' ? 'bg-green-100 text-green-800' :
                          step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          isCurrentStep ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {step.status === 'approved' ? 'Aprovado' :
                           step.status === 'rejected' ? 'Rejeitado' :
                           isCurrentStep ? 'Em Andamento' : 'Pendente'}
                        </span>
                        {step.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Prazo: {new Date(step.dueDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Step Approvals */}
                    {step.approvals.length > 0 && (
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-gray-700">Ações:</h6>
                        {step.approvals.map((approval) => (
                          <div key={approval.id} className="flex items-start space-x-3 bg-white rounded-lg p-3">
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
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-800">{approval.approverName}</span>
                                <span className={`text-sm ${getActionColor(approval.action)}`}>
                                  {getActionLabel(approval.action)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(approval.timestamp).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              {approval.comments && (
                                <p className="text-sm text-gray-600 italic">"{approval.comments}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Current Step Actions */}
                    {isCurrentStep && userCanApprove && !showActionForm && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowActionForm('approve')}
                            className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Aprovar</span>
                          </button>
                          
                          <button
                            onClick={() => setShowActionForm('reject')}
                            className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Rejeitar</span>
                          </button>
                          
                          <button
                            onClick={() => setShowActionForm('request_changes')}
                            className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                          >
                            <MessageSquare className="w-4 h-4" />
                            <span>Solicitar Alterações</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action Form */}
                    {isCurrentStep && showActionForm && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {showActionForm === 'approve' ? 'Comentários (opcional)' :
                               showActionForm === 'reject' ? 'Motivo da rejeição' :
                               'Solicitação de alterações'}
                            </label>
                            <textarea
                              value={actionComments}
                              onChange={(e) => setActionComments(e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={
                                showActionForm === 'approve' ? 'Comentários sobre a aprovação...' :
                                showActionForm === 'reject' ? 'Explique o motivo da rejeição...' :
                                'Descreva as alterações necessárias...'
                              }
                              required={showActionForm !== 'approve'}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleAction(showActionForm)}
                              disabled={showActionForm !== 'approve' && !actionComments.trim()}
                              className={`px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                showActionForm === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                showActionForm === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                'bg-yellow-600 hover:bg-yellow-700'
                              }`}
                            >
                              Confirmar
                            </button>
                            
                            <button
                              onClick={() => {
                                setShowActionForm(null);
                                setActionComments('');
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metadata */}
          {workflow.metadata && Object.keys(workflow.metadata).length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(workflow.metadata).map(([key, value]) => (
                    <div key={key}>
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <p className="font-medium text-gray-800">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Linha do Tempo</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Workflow criado</p>
                  <p className="text-sm text-gray-600">
                    {new Date(workflow.requestedAt).toLocaleDateString('pt-BR')} por {workflow.requestedBy}
                  </p>
                </div>
              </div>

              {workflow.steps.flatMap(step => 
                step.approvals.map(approval => (
                  <div key={approval.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      approval.action === 'approve' ? 'bg-green-100' :
                      approval.action === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {approval.action === 'approve' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : approval.action === 'reject' ? (
                        <XCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <MessageSquare className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {approval.approverName} {getActionLabel(approval.action).toLowerCase()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(approval.timestamp).toLocaleDateString('pt-BR')}
                      </p>
                      {approval.comments && (
                        <p className="text-sm text-gray-600 italic mt-1">"{approval.comments}"</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end pt-6 border-t border-gray-200 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}