import React from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Edit, Trash2, User } from 'lucide-react';
import { Company } from '../../types/company';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{company.razaoSocial}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {company.status === 'active' ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mt-1">{company.apelido}</p>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="font-medium">CNPJ:</span>
                <span className="ml-1">{company.cnpj}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium">Código:</span>
                <span className="ml-1">{company.codigoEmpresa}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(company)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar empresa"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(company.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Excluir empresa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-2">
          {company.endereco && (
            <div className="flex items-start text-sm">
              <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
              <div>
                <p className="text-gray-700">{company.endereco}</p>
                <p className="text-gray-700">
                  {company.cidade && `${company.cidade}${company.estado ? `, ${company.estado}` : ''}`}
                  {company.cep && ` - ${company.cep}`}
                </p>
              </div>
            </div>
          )}

          {company.telefone && (
            <div className="flex items-center text-sm">
              <Phone className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{company.telefone}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {company.email && (
            <div className="flex items-center text-sm">
              <Mail className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{company.email}</span>
            </div>
          )}

          {company.website && (
            <div className="flex items-center text-sm">
              <Globe className="w-4 h-4 text-gray-400 mr-2" />
              <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-blue-600 hover:underline">
                {company.website}
              </a>
            </div>
          )}

          {company.responsavel && (
            <div className="flex items-center text-sm">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-700">{company.responsavel}</span>
            </div>
          )}
        </div>
      </div>

      {company.observacoes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 italic">"{company.observacoes}"</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado em {new Date(company.createdAt).toLocaleDateString('pt-BR')}</span>
          <span>Última atualização: {new Date(company.updatedAt).toLocaleDateString('pt-BR')}</span>
        </div>
      </div>
    </div>
  );
}