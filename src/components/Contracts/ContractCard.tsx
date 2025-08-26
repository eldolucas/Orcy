import React from 'react';
import { FileText, Edit, Trash2, Calendar, DollarSign, Building2, Clock, RefreshCw } from 'lucide-react';
import { Contract, contractTypeLabels, contractStatusLabels, contractRecurrenceLabels } from '../../types/contract';
import { CostCenter, FiscalYear } from '../../types';

interface ContractCardProps {
  contract: Contract;
  costCenter?: CostCenter;
  fiscalYear?: FiscalYear;
  onEdit: (contract: Contract) => void;
  onDelete: (id: string) => void;
}

export function ContractCard({ 
  contract, 
  costCenter,
  fiscalYear,
  onEdit, 
  onDelete 
}: ContractCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-blue-100 text-blue-800';
      case 'lease':
        return 'bg-purple-100 text-purple-800';
      case 'rental':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'BRL':
        return 'R$';
      case 'USD':
        return 'US$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      default:
        return currency;
    }
  };

  // Calcula dias restantes até o fim do contrato
  const getDaysRemaining = () => {
    if (!contract.endDate) return null;
    
    const today = new Date();
    const endDate = new Date(contract.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{contract.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(contract.contractType)}`}>
                {contractTypeLabels[contract.contractType as keyof typeof contractTypeLabels]}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(contract.status)}`}>
                {contractStatusLabels[contract.status as keyof typeof contractStatusLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Contrato:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{contract.contractNumber}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Parceiro:</span>
                <span className="ml-1">{contract.partnerName}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              {getCurrencySymbol(contract.currency)} {contract.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {contract.recurrenceType !== 'none' ? 
                `${contractRecurrenceLabels[contract.recurrenceType as keyof typeof contractRecurrenceLabels]}` : 
                'Valor único'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(contract)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar contrato"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(contract.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir contrato"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detalhes do Contrato */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Início:</span>
          <span className="font-medium text-gray-800">{new Date(contract.startDate).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {contract.endDate && (
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Término:</span>
            <span className={`font-medium ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-800'}`}>
              {new Date(contract.endDate).toLocaleDateString('pt-BR')}
              {isExpiringSoon && ` (${daysRemaining} dias)`}
              {isExpired && ' (Expirado)'}
            </span>
          </div>
        )}
        
        {contract.recurrenceType !== 'none' && contract.nextPaymentDate && (
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Próximo Pagamento:</span>
            <span className="font-medium text-gray-800">{new Date(contract.nextPaymentDate).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600">Centro de Custo:</span>
          <span className="font-medium text-gray-800">
            {costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Não especificado'}
          </span>
        </div>
      </div>

      {/* Informações adicionais */}
      {contract.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">"{contract.notes}"</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(contract.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}