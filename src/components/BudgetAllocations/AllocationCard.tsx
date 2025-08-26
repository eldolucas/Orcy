import React from 'react';
import { Calendar, Edit, Trash2, DollarSign, BarChart3, PieChart, CheckCircle, AlertTriangle } from 'lucide-react';
import { BudgetAllocation, monthNames } from '../../types/budgetAllocation';
import { BudgetItem } from '../../types/budgetItem';
import { CostCenter, FiscalYear } from '../../types';

interface AllocationCardProps {
  allocation: BudgetAllocation;
  budgetItem?: BudgetItem;
  costCenter?: CostCenter;
  fiscalYear?: FiscalYear;
  onEdit: (allocation: BudgetAllocation) => void;
  onDelete: (id: string) => void;
}

export function AllocationCard({ 
  allocation, 
  budgetItem,
  costCenter,
  fiscalYear,
  onEdit, 
  onDelete 
}: AllocationCardProps) {
  // Calcula o total realizado
  const totalActual = allocation.allocations.reduce((sum, alloc) => sum + (alloc.actualAmount || 0), 0);
  
  // Calcula a variação entre planejado e realizado
  const variance = allocation.totalAmount - totalActual;
  const variancePercentage = allocation.totalAmount > 0 ? (variance / allocation.totalAmount) * 100 : 0;
  
  // Determina o mês atual para destacar
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentYear = currentDate.getFullYear();
  
  // Obtém a alocação do mês atual
  const currentMonthAllocation = allocation.allocations.find(
    alloc => alloc.month === currentMonth && alloc.year === currentYear
  );

  // Determina o tipo de distribuição para exibição
  const getDistributionTypeLabel = (type: string) => {
    switch (type) {
      case 'equal':
        return 'Uniforme';
      case 'seasonal':
        return 'Sazonal';
      case 'weighted':
        return 'Ponderada';
      case 'custom':
        return 'Personalizada';
      default:
        return type;
    }
  };

  // Determina o ícone do tipo de distribuição
  const getDistributionTypeIcon = (type: string) => {
    switch (type) {
      case 'equal':
        return <BarChart3 className="w-4 h-4" />;
      case 'seasonal':
      case 'weighted':
      case 'custom':
        return <PieChart className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">
                {budgetItem ? budgetItem.name : 'Item Orçamentário'}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                budgetItem?.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {budgetItem?.type === 'revenue' ? 'Receita' : 'Despesa'}
              </span>
              <span className="flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {getDistributionTypeIcon(allocation.distributionType)}
                <span>{getDistributionTypeLabel(allocation.distributionType)}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Exercício:</span>
                <span className="font-medium text-gray-800">
                  {fiscalYear ? fiscalYear.name : 'Não especificado'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Centro de Custo:</span>
                <span className="font-medium text-gray-800">
                  {costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Não especificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              R$ {allocation.totalAmount.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Valor total anual
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(allocation)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar alocação"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(allocation.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir alocação"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Resumo de Execução */}
      {totalActual > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium mb-1">Planejado</p>
            <p className="text-lg font-bold text-blue-800">
              R$ {allocation.totalAmount.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium mb-1">Realizado</p>
            <p className="text-lg font-bold text-purple-800">
              R$ {totalActual.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 font-medium mb-1">Variação</p>
            <div className="flex items-center justify-center space-x-1">
              {variance > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <p className={`text-lg font-bold ${variance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {variance > 0 ? '+' : ''}{variancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfico de Alocação Mensal */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Distribuição Mensal</h4>
        <div className="space-y-3">
          {allocation.allocations.map((monthAlloc) => {
            const isCurrentMonth = monthAlloc.month === currentMonth && monthAlloc.year === currentYear;
            const percentage = (monthAlloc.plannedAmount / allocation.totalAmount) * 100;
            const actualPercentage = monthAlloc.actualAmount 
              ? (monthAlloc.actualAmount / allocation.totalAmount) * 100 
              : 0;
            
            return (
              <div key={monthAlloc.month} className={`space-y-1 ${isCurrentMonth ? 'bg-blue-50 p-2 rounded-lg' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${isCurrentMonth ? 'font-medium text-blue-800' : 'text-gray-600'}`}>
                    {monthNames[monthAlloc.month - 1]}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-800">
                      R$ {monthAlloc.plannedAmount.toLocaleString()}
                    </span>
                    {monthAlloc.actualAmount !== undefined && (
                      <span className={`text-xs ${
                        monthAlloc.actualAmount > monthAlloc.plannedAmount ? 'text-red-600' : 'text-green-600'
                      }`}>
                        ({monthAlloc.actualAmount > monthAlloc.plannedAmount ? '+' : ''}
                        {((monthAlloc.actualAmount - monthAlloc.plannedAmount) / monthAlloc.plannedAmount * 100).toFixed(1)}%)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                  {/* Barra de valor planejado */}
                  <div
                    className="absolute top-0 left-0 h-full bg-blue-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                  
                  {/* Barra de valor realizado (se existir) */}
                  {monthAlloc.actualAmount !== undefined && (
                    <div
                      className={`absolute top-0 left-0 h-full ${
                        monthAlloc.actualAmount > monthAlloc.plannedAmount ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${actualPercentage}%`,
                        opacity: 0.7
                      }}
                    ></div>
                  )}
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}%</span>
                  {monthAlloc.actualAmount !== undefined && (
                    <span>Realizado: R$ {monthAlloc.actualAmount.toLocaleString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Observações */}
      {allocation.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">"{allocation.notes}"</p>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {allocation.createdBy} em {new Date(allocation.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(allocation.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}