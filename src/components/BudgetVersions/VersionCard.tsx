import React from 'react';
import { Calendar, Edit, Trash2, CheckCircle, Clock, Archive, Star, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { BudgetVersion, versionStatusLabels, scenarioTypeLabels } from '../../types/budgetVersion';
import { FiscalYear } from '../../types';

interface VersionCardProps {
  version: BudgetVersion;
  fiscalYear?: FiscalYear;
  onEdit: (version: BudgetVersion) => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onActivate: (id: string) => void;
  onViewDetails: (version: BudgetVersion) => void;
  onCompare: (version: BudgetVersion) => void;
}

export function VersionCard({ 
  version, 
  fiscalYear,
  onEdit, 
  onDelete, 
  onApprove,
  onActivate,
  onViewDetails,
  onCompare
}: VersionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'simulation':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-purple-100 text-purple-800';
      case 'archived':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'simulation':
        return <BarChart3 className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'active':
        return <Star className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getScenarioColor = (type?: string) => {
    if (!type) return '';
    
    switch (type) {
      case 'optimistic':
        return 'bg-green-100 text-green-800';
      case 'realistic':
        return 'bg-blue-100 text-blue-800';
      case 'pessimistic':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <h3 className="text-lg font-semibold text-gray-800">{version.name}</h3>
              <span className={`flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>
                {getStatusIcon(version.status)}
                <span>{versionStatusLabels[version.status as keyof typeof versionStatusLabels]}</span>
              </span>
              {version.isBaseline && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                  Versão Base
                </span>
              )}
              {version.metadata?.scenarioType && (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScenarioColor(version.metadata.scenarioType)}`}>
                  {scenarioTypeLabels[version.metadata.scenarioType as keyof typeof scenarioTypeLabels]}
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{version.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Versão:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">#{version.versionNumber}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Exercício:</span>
                <span className="ml-1">{fiscalYear ? fiscalYear.name : 'Não especificado'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800">
              R$ {version.totalBudget.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Orçamento Total
            </p>
            {version.parentVersionId && version.metadata?.adjustmentFactor && (
              <p className={`text-xs ${
                version.metadata.adjustmentFactor > 1 ? 'text-green-600' : 'text-red-600'
              }`}>
                {version.metadata.adjustmentFactor > 1 ? '+' : ''}
                {((version.metadata.adjustmentFactor - 1) * 100).toFixed(1)}% vs. original
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => onViewDetails(version)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="Ver detalhes"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => onCompare(version)}
                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                title="Comparar versões"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {(version.status === 'draft' || version.status === 'simulation') && (
                <>
                  <button 
                    onClick={() => onEdit(version)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Editar versão"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  
                  <button 
                    onClick={() => onApprove(version.id)}
                    className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    title="Aprovar versão"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {version.status === 'approved' && (
                <button 
                  onClick={() => onActivate(version.id)}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Ativar versão"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              
              {(version.status === 'draft' || version.status === 'simulation') && !version.isBaseline && (
                <button 
                  onClick={() => onDelete(version.id)}
                  className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir versão"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metadata and Assumptions */}
      {version.metadata?.assumptions && version.metadata.assumptions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Premissas</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {version.metadata.assumptions.map((assumption, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {version.metadata?.tags && version.metadata.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {version.metadata.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {version.createdBy} em {new Date(version.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(version.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}