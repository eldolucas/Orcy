import React from 'react';
import { GitBranch, Edit, Trash2, Building, Users, DollarSign, Globe, MapPin } from 'lucide-react';
import { BusinessGroup, businessGroupStatusLabels } from '../../types/businessGroup';
import { Company } from '../../types/company';

interface BusinessGroupCardProps {
  businessGroup: BusinessGroup;
  companies: Company[];
  onEdit: (group: BusinessGroup) => void;
  onDelete: (id: string) => void;
  onManageCompanies: (group: BusinessGroup) => void;
}

export function BusinessGroupCard({ 
  businessGroup, 
  companies,
  onEdit, 
  onDelete,
  onManageCompanies
}: BusinessGroupCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'dissolved':
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
            <GitBranch className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{businessGroup.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(businessGroup.status)}`}>
                {businessGroupStatusLabels[businessGroup.status as keyof typeof businessGroupStatusLabels]}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{businessGroup.description}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">Código:</span>
                <span className="ml-1 font-mono bg-gray-100 px-2 py-1 rounded">{businessGroup.code}</span>
              </div>
              {businessGroup.mainCnpj && (
                <div className="flex items-center">
                  <span className="font-medium">CNPJ Principal:</span>
                  <span className="ml-1">{businessGroup.mainCnpj}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(businessGroup)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar grupo"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(businessGroup.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir grupo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detalhes do Grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          {businessGroup.headquartersAddress && (
            <div className="flex items-start text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-700">{businessGroup.headquartersAddress}</p>
                <p className="text-gray-700">
                  {businessGroup.headquartersCity && `${businessGroup.headquartersCity}${businessGroup.headquartersState ? `, ${businessGroup.headquartersState}` : ''}`}
                  {businessGroup.headquartersCountry && ` - ${businessGroup.headquartersCountry}`}
                </p>
              </div>
            </div>
          )}

          {businessGroup.phone && (
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{businessGroup.phone}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {businessGroup.email && (
            <div className="flex items-center text-sm">
              <Users className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{businessGroup.email}</span>
            </div>
          )}

          {businessGroup.website && (
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 text-gray-400 mr-2" />
              <a href={businessGroup.website.startsWith('http') ? businessGroup.website : `https://${businessGroup.website}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-600 hover:underline">
                {businessGroup.website}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Estatísticas do Grupo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <Building className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-xs text-green-600 font-medium">Empresas Associadas</span>
          </div>
          <p className="text-lg font-bold text-green-800">
            {businessGroup.totalCompanies}
          </p>
        </div>
        
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-center mb-1">
            <DollarSign className="w-4 h-4 text-purple-600 mr-1" />
            <span className="text-xs text-purple-600 font-medium">Receita Total (Estimada)</span>
          </div>
          <p className="text-lg font-bold text-purple-800">
            R$ {businessGroup.totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Empresas Associadas */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Empresas Associadas ({companies.length})</h4>
          <button
            onClick={() => onManageCompanies(businessGroup)}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
          >
            <Building className="w-4 h-4" />
            <span>Gerenciar Empresas</span>
          </button>
        </div>
        {companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {companies.slice(0, 4).map((company) => (
              <div key={company.id} className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                <Building className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-800">{company.apelido}</span>
              </div>
            ))}
            {companies.length > 4 && (
              <p className="text-xs text-gray-500 mt-2">
                ... e mais {companies.length - 4} empresa(s)
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nenhuma empresa associada a este grupo.</p>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado por {businessGroup.createdBy} em {new Date(businessGroup.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(businessGroup.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}