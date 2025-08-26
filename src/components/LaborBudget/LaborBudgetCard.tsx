import React from 'react';
import { Briefcase, Edit, Trash2, Users, DollarSign, Building2, Calendar } from 'lucide-react';
import { LaborBudget } from '../../types/laborBudget';
import { CostCenter, FiscalYear } from '../../types';

interface LaborBudgetCardProps {
  laborBudget: LaborBudget;
  costCenter?: CostCenter;
  fiscalYear?: FiscalYear;
  onEdit: (laborBudget: LaborBudget) => void;
  onDelete: (id: string) => void;
}

export function LaborBudgetCard({ 
  laborBudget, 
  costCenter,
  fiscalYear,
  onEdit, 
  onDelete 
}: LaborBudgetCardProps) {
  // Calcula o custo médio mensal por funcionário
  const monthlyCostPerEmployee = laborBudget.totalCost / (laborBudget.quantity * 12);
  
  // Calcula o percentual de benefícios em relação ao salário base
  const totalMonthlyBenefits = laborBudget.benefits
    .filter(b => b.type === 'fixed' && b.isMonthly)
    .reduce((sum, b) => sum + b.value, 0);
  
  const benefitsPercentage = (totalMonthlyBenefits / laborBudget.baseSalary) * 100;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{laborBudget.position}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                laborBudget.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {laborBudget.isActive ? 'Ativo' : 'Inativo'}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                {laborBudget.department}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Quantidade:</span>
                <span className="font-medium text-gray-800">{laborBudget.quantity} funcionário(s)</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Salário Base:</span>
                <span className="font-medium text-gray-800">R$ {laborBudget.baseSalary.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Centro de Custo:</span>
                <span className="font-medium text-gray-800">
                  {costCenter ? `${costCenter.code} - ${costCenter.name}` : 'Não especificado'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Exercício:</span>
                <span className="font-medium text-gray-800">
                  {fiscalYear ? fiscalYear.name : 'Não especificado'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">
              R$ {laborBudget.totalCost.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Custo anual total
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => onEdit(laborBudget)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar mão de obra"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(laborBudget.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Excluir mão de obra"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detalhes de Custos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Custo Mensal por Funcionário</p>
          <p className="text-lg font-bold text-blue-800">
            R$ {monthlyCostPerEmployee.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-xs text-purple-600 font-medium mb-1">Benefícios</p>
          <p className="text-lg font-bold text-purple-800">
            {benefitsPercentage.toFixed(1)}% do salário
          </p>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600 font-medium mb-1">Encargos Totais</p>
          <p className="text-lg font-bold text-green-800">
            {laborBudget.charges.reduce((sum, charge) => sum + charge.percentage, 0)}%
          </p>
        </div>
      </div>

      {/* Benefícios e Encargos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-100">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Benefícios</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {laborBudget.benefits.map((benefit) => (
              <div key={benefit.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                <span className="text-gray-600">{benefit.name}</span>
                <div className="text-right">
                  <span className="font-medium">
                    {benefit.type === 'fixed' 
                      ? `R$ ${benefit.value.toLocaleString()}`
                      : `${benefit.value}%`}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {benefit.isMonthly ? 'Mensal' : 'Anual'} × {benefit.months}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Encargos</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {laborBudget.charges.map((charge) => (
              <div key={charge.id} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                <span className="text-gray-600">{charge.name}</span>
                <div className="text-right">
                  <span className="font-medium">{charge.percentage}%</span>
                  <span className="text-xs text-gray-500 block">
                    Base: {charge.baseIncludesBenefits ? 'Salário + Benefícios' : 'Apenas Salário'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {laborBudget.createdBy} em {new Date(laborBudget.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(laborBudget.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}