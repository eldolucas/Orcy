import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Calendar, DollarSign, Building2, RefreshCw, User } from 'lucide-react';
import { Contract, ContractFormData, contractTypeLabels, contractRecurrenceLabels, contractStatusLabels, currencyOptions } from '../../types/contract';
import { useCostCenters } from '../../hooks/useCostCenters';
import { useFinancialYears } from '../../hooks/useFinancialYears';

interface ContractFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: ContractFormData) => void;
  initialData?: Contract | null;
}

export function ContractForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: ContractFormProps) {
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [formData, setFormData] = useState<ContractFormData>({
    name: '',
    description: '',
    contractNumber: '',
    contractType: 'service',
    startDate: '',
    endDate: '',
    value: 0,
    currency: 'BRL',
    recurrenceType: 'monthly',
    nextPaymentDate: '',
    partnerName: '',
    costCenterId: '',
    fiscalYearId: '',
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'financial' | 'additional'>('basic');

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        contractNumber: initialData.contractNumber,
        contractType: initialData.contractType,
        startDate: initialData.startDate,
        endDate: initialData.endDate || '',
        value: initialData.value,
        currency: initialData.currency,
        recurrenceType: initialData.recurrenceType,
        nextPaymentDate: initialData.nextPaymentDate || '',
        partnerName: initialData.partnerName,
        costCenterId: initialData.costCenterId,
        fiscalYearId: initialData.fiscalYearId,
        status: initialData.status,
        notes: initialData.notes || ''
      });
    } else {
      // Reset do formulário quando for um novo contrato
      setFormData({
        name: '',
        description: '',
        contractNumber: '',
        contractType: 'service',
        startDate: '',
        endDate: '',
        value: 0,
        currency: 'BRL',
        recurrenceType: 'monthly',
        nextPaymentDate: '',
        partnerName: '',
        costCenterId: '',
        fiscalYearId: '',
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
    setActiveTab('basic');
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.contractNumber.trim()) newErrors.contractNumber = 'Número do contrato é obrigatório';
    if (!formData.contractType) newErrors.contractType = 'Tipo de contrato é obrigatório';
    if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';
    if (!formData.value || formData.value <= 0) newErrors.value = 'Valor deve ser maior que zero';
    if (!formData.partnerName.trim()) newErrors.partnerName = 'Nome do parceiro é obrigatório';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    
    // Validações adicionais
    if (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'Data de término deve ser posterior à data de início';
    }
    
    if (formData.recurrenceType !== 'none' && !formData.nextPaymentDate) {
      newErrors.nextPaymentDate = 'Data do próximo pagamento é obrigatória para contratos recorrentes';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        onSave(formData);
      } catch (err) {
        // Error handling is done in the parent component
      }
    } else {
      // Se houver erros, muda para a aba que contém o primeiro erro
      const firstErrorField = Object.keys(newErrors)[0];
      
      if (['name', 'contractNumber', 'contractType', 'startDate', 'endDate', 'partnerName'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (['value', 'currency', 'recurrenceType', 'nextPaymentDate', 'costCenterId', 'fiscalYearId'].includes(firstErrorField)) {
        setActiveTab('financial');
      } else {
        setActiveTab('additional');
      }
    }
  };

  const handleRecurrenceChange = (recurrenceType: string) => {
    setFormData(prev => ({
      ...prev,
      recurrenceType: recurrenceType as any,
      nextPaymentDate: recurrenceType === 'none' ? '' : prev.nextPaymentDate
    }));
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Contrato' : 'Novo Contrato';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Contrato';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
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
              onClick={() => setActiveTab('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Informações Financeiras
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
                    Nome do Contrato *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Serviço de Limpeza, Aluguel de Escritório"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Contrato *
                  </label>
                  <input
                    type="text"
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.contractNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: CONT-2024-001"
                  />
                  {errors.contractNumber && <p className="text-red-500 text-xs mt-1">{errors.contractNumber}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Contrato *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {Object.entries(contractTypeLabels).map(([value, label]) => (
                    <label 
                      key={value} 
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.contractType === value 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="contractType"
                        value={value}
                        checked={formData.contractType === value}
                        onChange={() => setFormData({ ...formData, contractType: value as any })}
                        className="sr-only"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {errors.contractType && <p className="text-red-500 text-xs mt-1">{errors.contractType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrição detalhada do contrato..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Início *
                  </label>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Término
                  </label>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Parceiro/Fornecedor *
                </label>
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.partnerName}
                    onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.partnerName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nome da empresa parceira ou fornecedor"
                  />
                </div>
                {errors.partnerName && <p className="text-red-500 text-xs mt-1">{errors.partnerName}</p>}
              </div>
            </div>
          )}

          {/* Tab: Informações Financeiras */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor *
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.value ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {currencyOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recorrência
                  </label>
                  <select
                    value={formData.recurrenceType}
                    onChange={(e) => handleRecurrenceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(contractRecurrenceLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.recurrenceType !== 'none' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data do Próximo Pagamento *
                  </label>
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      value={formData.nextPaymentDate}
                      onChange={(e) => setFormData({ ...formData, nextPaymentDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.nextPaymentDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.nextPaymentDate && <p className="text-red-500 text-xs mt-1">{errors.nextPaymentDate}</p>}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Centro de Custo *
                  </label>
                  <select
                    value={formData.costCenterId}
                    onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.costCenterId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um centro de custo</option>
                    {costCenters.map((center) => (
                      <option key={center.id} value={center.id}>
                        {center.code} - {center.name}
                      </option>
                    ))}
                  </select>
                  {errors.costCenterId && <p className="text-red-500 text-xs mt-1">{errors.costCenterId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exercício Financeiro *
                  </label>
                  <select
                    value={formData.fiscalYearId}
                    onChange={(e) => setFormData({ ...formData, fiscalYearId: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.fiscalYearId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecione um exercício</option>
                    {financialYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name} ({year.year})
                      </option>
                    ))}
                  </select>
                  {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {Object.entries(contractStatusLabels).map(([value, label]) => (
                    <label 
                      key={value} 
                      className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.status === value 
                          ? value === 'active' ? 'bg-green-50 border-green-300 text-green-700' :
                            value === 'inactive' ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                            value === 'expired' ? 'bg-red-50 border-red-300 text-red-700' :
                            'bg-gray-50 border-gray-300 text-gray-700'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={value}
                        checked={formData.status === value}
                        onChange={() => setFormData({ ...formData, status: value as any })}
                        className="sr-only"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab: Informações Adicionais */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre o contrato..."
                />
              </div>

              {/* Placeholder para futura implementação de upload de anexos */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Funcionalidade de upload de anexos em desenvolvimento
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Aqui você poderá anexar documentos relacionados ao contrato
                  </p>
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