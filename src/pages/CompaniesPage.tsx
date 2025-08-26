import React, { useState } from 'react';
import { Plus, Search, Filter, Building2, Download, Upload } from 'lucide-react';
import { CompanyCard } from '../components/Companies/CompanyCard';
import { CompanyForm } from '../components/Companies/CompanyForm';
import { useCompanies } from '../hooks/useCompanies';
import { Company, CompanyFormData } from '../types/company';

export function CompaniesPage() {
  const { 
    companies, 
    isLoading, 
    error,
    addCompany, 
    updateCompany, 
    deleteCompany, 
    getFilteredCompanies 
  } = useCompanies();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<Company | null>(null);

  const handleCreateCompany = (companyData: CompanyFormData) => {
    addCompany(companyData);
    setShowCreateModal(false);
  };

  const handleEditCompany = (company: Company) => {
    setCompanyToEdit(company);
    setShowCreateModal(true);
  };

  const handleUpdateCompany = (companyData: CompanyFormData) => {
    if (companyToEdit) {
      updateCompany(companyToEdit.id, companyData);
      setCompanyToEdit(null);
      setShowCreateModal(false);
    }
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      deleteCompany(id);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setCompanyToEdit(null);
  };

  const filteredCompanies = getFilteredCompanies(searchTerm, statusFilter);

  // Estatísticas
  const totalCompanies = companies.length;
  const activeCompanies = companies.filter(c => c.status === 'active').length;
  const inactiveCompanies = companies.filter(c => c.status === 'inactive').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p>{error}</p>
        <button 
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie as empresas cadastradas no sistema</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Empresa</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Empresas</p>
              <p className="text-xl font-bold text-gray-800">{totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresas Ativas</p>
              <p className="text-xl font-bold text-gray-800">{activeCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresas Inativas</p>
              <p className="text-xl font-bold text-gray-800">{inactiveCompanies}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar empresas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativas</option>
          <option value="inactive">Inativas</option>
        </select>

        <div className="flex items-center space-x-2">
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Exportar empresas"
          >
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Exportar</span>
          </button>
          <button
            className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Importar empresas"
          >
            <Upload className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Importar</span>
          </button>
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onEdit={handleEditCompany}
            onDelete={handleDeleteCompany}
          />
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Ajuste os filtros ou crie uma nova empresa'
              : 'Crie sua primeira empresa para começar'
            }
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <CompanyForm
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={companyToEdit ? handleUpdateCompany : handleCreateCompany}
        initialData={companyToEdit}
      />
    </div>
  );
}