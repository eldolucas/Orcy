import React from 'react';
import { Bell, Search, Settings, Building2, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user, activeCompany, userCompanies, switchCompany } = useAuth();
  const [showCompanyDropdown, setShowCompanyDropdown] = React.useState(false);

  const handleCompanySwitch = (companyId: string) => {
    switchCompany(companyId);
    setShowCompanyDropdown(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Bem-vindo de volta, {user?.name}
          </p>
        </div>

        {/* Company Selector */}
        {userCompanies.length > 1 && (
          <div className="relative mr-4">
            <button 
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Building2 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {activeCompany?.name || 'Selecionar Empresa'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            
            {showCompanyDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  <p className="px-4 py-1 text-xs font-medium text-gray-500 uppercase">
                    Suas Empresas
                  </p>
                  {userCompanies.map((company) => (
                    <button
                      key={company.id}
                      onClick={() => handleCompanySwitch(company.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        activeCompany?.id === company.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}