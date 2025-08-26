import React, { useState, useEffect } from 'react';
import { X, Save, Settings, Globe, Building2 } from 'lucide-react';
import { FinancialParameter, FinancialParameterFormData, parameterCategoryLabels, parameterValueTypeLabels, economicSectors } from '../../types/financialParameter';
import { useAuth } from '../../contexts/AuthContext';

interface ParameterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (parameter: FinancialParameterFormData) => void;
  initialData?: FinancialParameter | null;
  canEditSystemParameters: boolean;
}

export function ParameterForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  canEditSystemParameters
}: ParameterFormProps) {
  const { activeCompany } = useAuth();
  
  const [formData, setFormData] = useState<FinancialParameterFormData>({
    code: '',
    name: '',
    description: '',
    value: '',
    valueType: 'string',
    category: 'tax',
    sector: '',
    isActive: true,
    isSystem: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scope, setScope] = useState<'global' | 'company'>('company');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        code: initialData.code,
        name: initialData.name,
        description: initialData.description || '',
        value: initialData.value,
        valueType: initialData.valueType,
        category: initialData.category,
        sector: initialData.sector || '',
        isActive: initialData.isActive,
        isSystem: initialData.isSystem,
        companyId: initialData.companyId
      });
      
      // Define o escopo com base no companyId
      setScope(initialData.companyId ? 'company' : 'global');
    } else {
      // Reset do formulário quando for um novo parâmetro
      setFormData({
        code: '',
        name: '',
        description: '',
        value: '',
        valueType: 'string',
        category: 'tax',
        sector: '',
        isActive: true,
        isSystem: false
      });
      
      // Por padrão, novos parâmetros são específicos da empresa
      setScope('company');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    
    // Validação do código (apenas letras maiúsculas, números e underscore)
    if (formData.code && !/^[A-Z0-9_]+$/.test(formData.code)) {
      newErrors.code = 'Código deve conter apenas letras maiúsculas, números e underscore';
    }
    
    // Validação do valor com base no tipo
    if (formData.valueType === 'number' || formData.valueType === 'percentage') {
      if (typeof formData.value !== 'number' && isNaN(Number(formData.value))) {
        newErrors.value = 'Valor deve ser um número válido';
      }
    } else if (formData.valueType === 'boolean') {
      if (typeof formData.value !== 'boolean' && formData.value !== 'true' && formData.value !== 'false') {
        newErrors.value = 'Valor deve ser verdadeiro ou falso';
      }
    } else if (formData.valueType === 'date') {
      if (!formData.value) {
        newErrors.value = 'Data é obrigatória';
      }
    } else if (formData.valueType === 'string') {
      if (typeof formData.value !== 'string' && !formData.value) {
        newErrors.value = 'Texto é obrigatório';
      }
    }
    
    // Verifica permissão para parâmetros do sistema
    if (formData.isSystem && !canEditSystemParameters) {
      newErrors.isSystem = 'Você não tem permissão para criar ou editar parâmetros do sistema';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Converte o valor para o tipo correto antes de salvar
      let processedValue: any = formData.value;
      
      if (formData.valueType === 'number' || formData.valueType === 'percentage') {
        processedValue = Number(formData.value);
      } else if (formData.valueType === 'boolean') {
        processedValue = formData.value === true || formData.value === 'true';
      }
      
      // Define o companyId com base no escopo
      const companyId = scope === 'company' ? activeCompany?.id : undefined;
      
      onSave({
        ...formData,
        value: processedValue,
        companyId
      });
      
      onClose();
    }
  };

  const handleValueTypeChange = (valueType: string) => {
    // Ajusta o valor quando o tipo muda
    let newValue: any = '';
    
    switch (valueType) {
      case 'number':
      case 'percentage':
        newValue = 0;
        break;
      case 'boolean':
        newValue = false;
        break;
      case 'date':
        newValue = new Date().toISOString().split('T')[0];
        break;
      default:
        newValue = '';
    }
    
    setFormData(prev => ({
      ...prev,
      valueType: valueType as any,
      value: newValue
    }));
  };

  const renderValueInput = () => {
    switch (formData.valueType) {
      case 'number':
      case 'percentage':
        return (
          <input
            type="number"
            value={formData.value as number}
            onChange={(e) => setFormData({ ...formData, value: e.target.value ? Number(e.target.value) : 0 })}
            step={formData.valueType === 'percentage' ? '0.01' : '1'}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={formData.valueType === 'percentage' ? '0.00' : '0'}
          />
        );
      case 'boolean':
        return (
          <select
            value={String(formData.value)}
            onChange={(e) => setFormData({ ...formData, value: e.target.value === 'true' })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="true">Sim</option>
            <option value="false">Não</option>
          </select>
        );
      case 'date':
        return (
          <input
            type="date"
            value={formData.value as string}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );
      default: // string
        return (
          <input
            type="text"
            value={formData.value as string}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.value ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Valor do parâmetro"
          />
        );
    }
  };

  const isEditing = !!initialData;
  const isEditingSystemParam = isEditing && initialData.isSystem;
  const modalTitle = isEditing ? 'Editar Parâmetro Financeiro' : 'Novo Parâmetro Financeiro';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Parâmetro';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: TAX_RATE, BUDGET_LIMIT"
                disabled={isEditingSystemParam} // Não permite alterar o código de parâmetros do sistema
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              {isEditingSystemParam && (
                <p className="text-yellow-600 text-xs mt-1">O código de parâmetros do sistema não pode ser alterado</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome descritivo do parâmetro"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição detalhada do parâmetro e seu uso"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isEditingSystemParam} // Não permite alterar a categoria de parâmetros do sistema
              >
                {Object.entries(parameterCategoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {isEditingSystemParam && (
                <p className="text-yellow-600 text-xs mt-1">A categoria de parâmetros do sistema não pode ser alterada</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Valor *
              </label>
              <select
                value={formData.valueType}
                onChange={(e) => handleValueTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isEditingSystemParam} // Não permite alterar o tipo de parâmetros do sistema
              >
                {Object.entries(parameterValueTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {isEditingSystemParam && (
                <p className="text-yellow-600 text-xs mt-1">O tipo de valor de parâmetros do sistema não pode ser alterado</p>
              )}
            </div>
          </div>
          
          {formData.category === 'sector' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Setor Econômico *
              </label>
              <select
                value={formData.sector || ''}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.sector ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione um setor</option>
                {economicSectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
              {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor *
            </label>
            {renderValueInput()}
            {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
            {formData.valueType === 'percentage' && (
              <p className="text-gray-500 text-xs mt-1">Informe o valor sem o símbolo % (ex: 18 para 18%)</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escopo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    scope === 'global' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="global"
                    checked={scope === 'global'}
                    onChange={() => setScope('global')}
                    className="sr-only"
                    disabled={isEditing} // Não permite alterar o escopo ao editar
                  />
                  <Globe className="w-5 h-5 mr-2" />
                  <span>Global</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    scope === 'company' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="scope"
                    value="company"
                    checked={scope === 'company'}
                    onChange={() => setScope('company')}
                    className="sr-only"
                    disabled={isEditing} // Não permite alterar o escopo ao editar
                  />
                  <Building2 className="w-5 h-5 mr-2" />
                  <span>Empresa</span>
                </label>
              </div>
              {isEditing && (
                <p className="text-yellow-600 text-xs mt-1">O escopo não pode ser alterado após a criação</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status e Tipo
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Parâmetro Ativo</span>
                </label>
                
                {canEditSystemParameters && !isEditing && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSystem}
                      onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Parâmetro do Sistema</span>
                  </label>
                )}
                {errors.isSystem && <p className="text-red-500 text-xs mt-1">{errors.isSystem}</p>}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
              disabled={isEditingSystemParam && !canEditSystemParameters}
            >
              <Save className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </button>
          </div>
          
          {isEditingSystemParam && !canEditSystemParameters && (
            <p className="text-red-600 text-sm text-center">
              Você não tem permissão para editar parâmetros do sistema
            </p>
          )}
        </form>
      </div>
    </div>
  );
}