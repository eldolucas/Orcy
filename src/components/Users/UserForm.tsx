import React, { useState, useEffect } from 'react';
import { X, Save, Mail, User as UserIcon, Building2, Phone, Briefcase, Lock, Shield } from 'lucide-react';
import { User, UserFormData, userRoleLabels, userRoleDescriptions } from '../../types/user';
import { Company } from '../../types/company';
import { CostCenter } from '../../types';
import { Role } from '../../types/user';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserFormData) => void;
  initialData?: User | null;
  companies: Company[];
  costCenters: CostCenter[];
  roles: Role[];
}

export function UserForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  companies,
  costCenters,
  roles
}: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData & { confirmPassword?: string }>({
    email: '',
    name: '',
    role: 'user',
    department: '',
    companyId: '',
    companies: [],
    status: 'active',
    costCenters: [],
    phone: '',
    position: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'access' | 'companies'>('basic');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email,
        name: initialData.name,
        role: initialData.role,
        department: initialData.department,
        companyId: initialData.companyId,
        companies: initialData.companies || [],
        status: initialData.status,
        costCenters: initialData.costCenters || [],
        phone: initialData.phone || '',
        position: initialData.position || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      // Reset do formulário quando for um novo usuário
      setFormData({
        email: '',
        name: '',
        role: 'user',
        department: '',
        companyId: '',
        companies: [],
        status: 'active',
        costCenters: [],
        phone: '',
        position: '',
        password: '',
        confirmPassword: ''
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.department.trim()) newErrors.department = 'Departamento é obrigatório';
    
    if (formData.companies.length === 0) {
      newErrors.companies = 'Selecione pelo menos uma empresa';
    }
    
    // Validação de senha apenas para novos usuários
    if (!initialData) {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Remove o campo confirmPassword antes de enviar
      const { confirmPassword, ...userData } = formData;
      
      // Se não houver senha definida e for uma edição, remova o campo password
      if (!userData.password && initialData) {
        delete userData.password;
      }
      
      onSave(userData);
    } else {
      // Se houver erros, muda para a aba que contém o primeiro erro
      const firstErrorField = Object.keys(newErrors)[0];
      
      if (['email', 'name', 'department', 'phone', 'position'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (['role', 'password', 'confirmPassword'].includes(firstErrorField)) {
        setActiveTab('access');
      } else if (['companies', 'costCenters'].includes(firstErrorField)) {
        setActiveTab('companies');
      }
    }
  };

  const handleCompanyChange = (companyId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        companies: [...prev.companies, companyId],
        // Se for a primeira empresa selecionada, define como companyId principal
        companyId: prev.companyId || companyId
      }));
    } else {
      const updatedCompanies = formData.companies.filter(id => id !== companyId);
      setFormData(prev => ({
        ...prev,
        companies: updatedCompanies,
        // Se a empresa principal foi removida, atualiza para a primeira da lista ou vazio
        companyId: prev.companyId === companyId ? (updatedCompanies[0] || '') : prev.companyId
      }));
    }
  };

  const handleCostCenterChange = (costCenterId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        costCenters: [...(prev.costCenters || []), costCenterId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        costCenters: (prev.costCenters || []).filter(id => id !== costCenterId)
      }));
    }
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Usuário' : 'Novo Usuário';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Usuário';

  // Filtra os centros de custo pelas empresas selecionadas
  const filteredCostCenters = costCenters.filter(center => {
    // Se não houver empresas selecionadas, mostra todos os centros
    if (formData.companies.length === 0) return true;
    
    // Lógica para filtrar centros de custo por empresa
    // Nota: Esta é uma simplificação. Na implementação real, você precisaria
    // de uma relação entre centros de custo e empresas no seu modelo de dados
    const centerCompanyId = center.id.charAt(0); // Simulação: primeiro caractere do ID indica a empresa
    return formData.companies.some(companyId => companyId === centerCompanyId);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">{modalTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('basic')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'basic'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações Básicas
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'access'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Acesso e Permissões
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'companies'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Empresas e Centros de Custo
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab: Informações Básicas */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <div className="flex items-center">
                    <UserIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nome completo do usuário"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="email@exemplo.com"
                      disabled={isEditing} // Não permite alterar o email em edições
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado após a criação</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento *
                  </label>
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.department ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: TI, Financeiro, Marketing"
                    />
                  </div>
                  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo
                  </label>
                  <div className="flex items-center">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={formData.position || ''}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: Gerente, Analista, Diretor"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Acesso e Permissões */}
          {activeTab === 'access' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Função / Nível de Acesso *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(userRoleLabels).map(([value, label]) => (
                    <label 
                      key={value} 
                      className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === value 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="role"
                          value={value}
                          checked={formData.role === value}
                          onChange={() => setFormData({ ...formData, role: value as any })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="font-medium">{label}</span>
                      </div>
                      <p className="text-xs mt-2 text-gray-600">
                        {userRoleDescriptions[value as keyof typeof userRoleDescriptions]}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isEditing ? 'Nova Senha (opcional)' : 'Senha *'}
                    </label>
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        type="password"
                        value={formData.password || ''}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={isEditing ? "Deixe em branco para manter a senha atual" : "Senha"}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isEditing ? 'Confirmar Nova Senha' : 'Confirmar Senha *'}
                    </label>
                    <div className="flex items-center">
                      <Lock className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        type="password"
                        value={formData.confirmPassword || ''}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirme a senha"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Empresas e Centros de Custo */}
          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Empresas *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {companies.map((company) => (
                    <label 
                      key={company.id} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.companies.includes(company.id) 
                          ? 'bg-blue-50 border-blue-300' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.companies.includes(company.id)}
                        onChange={(e) => handleCompanyChange(company.id, e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-800">{company.apelido}</p>
                        <p className="text-xs text-gray-500">{company.razaoSocial}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.companies && <p className="text-red-500 text-xs mt-1">{errors.companies}</p>}
              </div>

              {formData.companies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa Principal
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione a empresa principal</option>
                    {companies
                      .filter(company => formData.companies.includes(company.id))
                      .map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.apelido} ({company.codigoEmpresa})
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    A empresa principal será a selecionada por padrão quando o usuário fizer login
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Centros de Custo
                </label>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {filteredCostCenters.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCostCenters.map((center) => (
                        <label 
                          key={center.id} 
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                            formData.costCenters?.includes(center.id) 
                              ? 'bg-blue-50' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.costCenters?.includes(center.id) || false}
                            onChange={(e) => handleCostCenterChange(center.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-800">{center.name}</p>
                            <p className="text-xs text-gray-500">{center.code} - {center.department}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      {formData.companies.length === 0 
                        ? 'Selecione pelo menos uma empresa para ver os centros de custo disponíveis'
                        : 'Nenhum centro de custo encontrado para as empresas selecionadas'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-red-500 text-sm">*</span>
              <span className="text-gray-500 text-sm">Campos obrigatórios</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>{submitButtonText}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}