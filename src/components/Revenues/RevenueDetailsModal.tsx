import React from 'react';
import { X, DollarSign, Calendar, Building2, User, FileText, CheckCircle, Clock, XCircle, Download, RefreshCw } from 'lucide-react';
import { Revenue, CostCenter, Budget, FiscalYear } from '../../types';

interface RevenueDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  revenue: Revenue | null;
  costCenters: CostCenter[];
  budgets: Budget[];
  fiscalYears: FiscalYear[];
}

export function RevenueDetailsModal({ 
  isOpen, 
  onClose, 
  revenue, 
  costCenters, 
  budgets, 
  fiscalYears 
}: RevenueDetailsModalProps) {
  if (!isOpen || !revenue) return null;

  const getCostCenterName = (costCenterId: string) => {
    const costCenter = costCenters.find(cc => cc.id === costCenterId);
    return costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Centro não encontrado';
  };

  const getBudgetName = (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId);
    return budget ? budget.name : 'Orçamento não encontrado';
  };

  const getFiscalYearName = (fiscalYearId: string) => {
    const fiscalYear = fiscalYears.find(fy => fy.id === fiscalYearId);
    return fiscalYear ? `${fiscalYear.name} (${fiscalYear.year})` : 'Exercício não encontrado';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <DollarSign className="w-5 h-5" />;
    }
  };

  const getRecurrenceLabel = (recurrenceType?: string) => {
    switch (recurrenceType) {
      case 'monthly':
        return 'Mensal';
      case 'quarterly':
        return 'Trimestral';
      case 'yearly':
        return 'Anual';
      case 'none':
      default:
        return 'Sem recorrência';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Detalhes da Receita</h2>
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
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{revenue.description}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(revenue.date).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {revenue.createdBy}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600 mb-2">
                  R$ {revenue.amount.toLocaleString()}
                </p>
                <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border-2 ${getStatusColor(revenue.status)}`}>
                  {getStatusIcon(revenue.status)}
                  <span className="font-medium">{getStatusLabel(revenue.status)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonte da Receita</label>
                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{revenue.source}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo</label>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <Building2 className="w-4 h-4 text-gray-600" />
                  <p className="text-gray-800">{getCostCenterName(revenue.costCenterId)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{getBudgetName(revenue.budgetId)}</p>
              </div>

              {revenue.recurrenceType && revenue.recurrenceType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recorrência</label>
                  <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <p className="text-blue-800">{getRecurrenceLabel(revenue.recurrenceType)}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercício Orçamentário</label>
                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{getFiscalYearName(revenue.fiscalYearId)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação</label>
                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                  {new Date(revenue.date).toLocaleDateString('pt-BR')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Última Atualização</label>
                <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                  {new Date(revenue.lastUpdated).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {revenue.nextRecurrenceDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Recorrência</label>
                  <p className="text-gray-800 bg-blue-50 px-3 py-2 rounded-lg">
                    {new Date(revenue.nextRecurrenceDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {revenue.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <FileText className="w-4 h-4 text-gray-600 mt-0.5" />
                  <p className="text-gray-800">{revenue.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation/Cancellation Information */}
          {revenue.status !== 'pending' && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Histórico de Status</h4>
              
              {revenue.status === 'confirmed' && revenue.confirmedBy && revenue.confirmedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Receita Confirmada</span>
                  </div>
                  <div className="text-sm text-green-700">
                    <p>Confirmado por: <strong>{revenue.confirmedBy}</strong></p>
                    <p>Data da confirmação: <strong>{new Date(revenue.confirmedAt).toLocaleDateString('pt-BR')}</strong></p>
                  </div>
                </div>
              )}

              {revenue.status === 'cancelled' && revenue.cancelledBy && revenue.cancelledAt && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-800">Receita Cancelada</span>
                  </div>
                  <div className="text-sm text-red-700">
                    <p>Cancelado por: <strong>{revenue.cancelledBy}</strong></p>
                    <p>Data do cancelamento: <strong>{new Date(revenue.cancelledAt).toLocaleDateString('pt-BR')}</strong></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attachments Section */}
          {revenue.attachments && revenue.attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Anexos</label>
              <div className="space-y-2">
                {revenue.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-800">{attachment}</span>
                    </div>
                    <button className="flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Baixar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Linha do Tempo</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Receita criada</p>
                  <p className="text-sm text-gray-600">
                    {new Date(revenue.date).toLocaleDateString('pt-BR')} por {revenue.createdBy}
                  </p>
                </div>
              </div>

              {revenue.status === 'confirmed' && revenue.confirmedBy && revenue.confirmedAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Receita confirmada</p>
                    <p className="text-sm text-gray-600">
                      {new Date(revenue.confirmedAt).toLocaleDateString('pt-BR')} por {revenue.confirmedBy}
                    </p>
                  </div>
                </div>
              )}

              {revenue.status === 'cancelled' && revenue.cancelledBy && revenue.cancelledAt && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Receita cancelada</p>
                    <p className="text-sm text-gray-600">
                      {new Date(revenue.cancelledAt).toLocaleDateString('pt-BR')} por {revenue.cancelledBy}
                    </p>
                  </div>
                </div>
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