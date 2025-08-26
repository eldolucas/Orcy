import React, { useState, useEffect } from 'react';
import { X, Building2, Save, MapPin, Phone, Mail, Globe, User, FileText } from 'lucide-react';
import { Company, CompanyFormData } from '../../types/company';

interface CompanyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: CompanyFormData) => void;
  initialData?: Company | null;
}

export function CompanyForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: CompanyFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    razaoSocial: '',
    apelido: '',
    cnpj: '',
    codigoEmpresa: '',
    status: 'active',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    website: '',
    responsavel: '',
    observacoes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'additional'>('basic');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        razaoSocial: initialData.razaoSocial,
        apelido: initialData.apelido,
        cnpj: initialData.cnpj,
        codigoEmpresa: initialData.codigoEmpresa,
        status: initialData.status,
        endereco: initialData.endereco || '',
        cidade: initialData.cidade || '',
        estado: initialData.estado || '',
        cep: initialData.cep || '',
        telefone: initialData.telefone || '',
        email: initialData.email || '',
        website: initialData.website || '',
        responsavel: initialData.responsavel || '',
        observacoes: initialData.observacoes || ''
      });
    } else {
      // Reset do formulário quando for uma nova empresa
      setFormData({
        razaoSocial: '',
        apelido: '',
        cnpj: '',
        codigoEmpresa: '',
        status: 'active',
        endereco: '',
        cidade: '',
        estado: '',
        cep: '',
        telefone: '',
        email: '',
        website: '',
        responsavel: '',
        observacoes: ''
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.razaoSocial.trim()) newErrors.razaoSocial = 'Razão Social é obrigatória';
    if (!formData.apelido.trim()) newErrors.apelido = 'Apelido é obrigatório';
    if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
    if (!formData.codigoEmpresa.trim()) newErrors.codigoEmpresa = 'Código da Empresa é obrigatório';
    
    // Validação básica de CNPJ (formato XX.XXX.XXX/XXXX-XX)
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (formData.cnpj && !cnpjRegex.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido. Use o formato: XX.XXX.XXX/XXXX-XX';
    }
    
    // Validação básica de e-mail
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    // Validação básica de website
    if (formData.website && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(formData.website)) {
      newErrors.website = 'Website inválido';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    } else {
      // Se houver erros, muda para a aba que contém o primeiro erro
      const firstErrorField = Object.keys(newErrors)[0];
      
      if (['razaoSocial', 'apelido', 'cnpj', 'codigoEmpresa', 'status'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (['endereco', 'cidade', 'estado', 'cep', 'telefone', 'email', 'website'].includes(firstErrorField)) {
        setActiveTab('contact');
      } else {
        setActiveTab('additional');
      }
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CNPJ (XX.XXX.XXX/XXXX-XX)
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const formatCEP = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do CEP (XXXXX-XXX)
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara do telefone ((XX) XXXX-XXXX ou (XX) XXXXX-XXXX)
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCNPJ = formatCNPJ(e.target.value);
    setFormData({ ...formData, cnpj: formattedCNPJ });
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value);
    setFormData({ ...formData, cep: formattedCEP });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setFormData({ ...formData, telefone: formattedPhone });
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Empresa' : 'Nova Empresa';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Empresa';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
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
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'contact'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Contato e Endereço
            </button>
            <button
              onClick={() => setActiveTab('additional')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'additional'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações Adicionais
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
                    Razão Social *
                  </label>
                  <input
                    type="text"
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.razaoSocial ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Razão Social da empresa"
                  />
                  {errors.razaoSocial && <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apelido / Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    value={formData.apelido}
                    onChange={(e) => setFormData({ ...formData, apelido: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.apelido ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome fantasia ou apelido"
                  />
                  {errors.apelido && <p className="text-red-500 text-xs mt-1">{errors.apelido}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={handleCNPJChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cnpj ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="XX.XXX.XXX/XXXX-XX"
                    maxLength={18}
                  />
                  {errors.cnpj && <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.codigoEmpresa}
                    onChange={(e) => setFormData({ ...formData, codigoEmpresa: e.target.value.toUpperCase() })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.codigoEmpresa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: EMP001"
                    maxLength={10}
                  />
                  {errors.codigoEmpresa && <p className="text-red-500 text-xs mt-1">{errors.codigoEmpresa}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Ativa</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Inativa</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Contato e Endereço */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.endereco}
                    onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Endereço completo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cidade"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={formData.cep}
                    onChange={handleCEPChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="XXXXX-XXX"
                    maxLength={9}
                  />
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
                      type="text"
                      value={formData.telefone}
                      onChange={handlePhoneChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(XX) XXXXX-XXXX"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail
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
                      placeholder="contato@empresa.com.br"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <div className="flex items-center">
                  <Globe className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.website ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="www.empresa.com.br"
                  />
                </div>
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website}</p>}
              </div>
            </div>
          )}

          {/* Tab: Informações Adicionais */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável
                </label>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do responsável principal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <div className="flex items-start">
                  <FileText className="w-5 h-5 text-gray-400 mr-2 mt-2" />
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Informações adicionais sobre a empresa..."
                  />
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