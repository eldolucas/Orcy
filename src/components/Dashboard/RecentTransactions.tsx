import React from 'react';
import { Calendar, User, Building } from 'lucide-react';
import { Expense } from '../../types';

interface RecentTransactionsProps {
  transactions: Expense[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
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

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Transações Recentes</h3>
      
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhuma transação recente</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        {transaction.createdBy}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-800">
                  R$ {transaction.amount.toLocaleString()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                  {getStatusLabel(transaction.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {transactions.length > 0 && (
        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ver todas as transações
          </button>
        </div>
      )}
    </div>
  );
}