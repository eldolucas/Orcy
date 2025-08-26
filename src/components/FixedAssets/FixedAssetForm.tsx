import React, { useState, useEffect } from 'react';
import { X, Save, Monitor, Calendar, DollarSign, Building2, Map, Truck, Home, BookOpen, Package } from 'lucide-react';
import { FixedAsset, FixedAssetFormData, assetCategoryLabels, assetStatusLabels, depreciationMethodLabels } from '../../types/fixedAsset';
import { useCostCenters } from '../../hooks/useCostCenters';
import { useFinancialYears } from '../../hooks/useFinancialYears';

interface FixedAssetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: FixedAssetFormData) => void;
  initialData?: FixedAsset | null;
}

export function FixedAssetForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: FixedAssetFormProps) {
  const { costCenters } = useCostCenters();
  const { financialYears } = useFinancialYears();
  
  const [formData, setFormData] = useState<FixedAssetFormData>({
    name: '',
    description: '',
    category: 'equipment',
    acquisitionDate: '',
    acquisitionValue: 0,
    depreciationRate: 20,
    depreciationMethod: 'linear',
    usefulLifeYears: 5,
    status: 'active',
    costCenterId: '',
    fiscalYearId: '',
    supplier: '',
    invoiceNumber: '',
    serialNumber: '',
    location: '',
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
        category: initialData.category,
        acquisitionDate: initialData.acquisitionDate,
        acquisitionValue: initialData.acquisitionValue,
        depreciationRate: initialData.depreciationRate,
        depreciationMethod: initialData.depreciationMethod,
        usefulLifeYears: initialData.usefulLifeYears,
        status: initialData.status,
        disposalDate: initialData.disposalDate,
        disposalValue: initialData.disposalValue,
        costCenterId: initialData.costCenterId,
        fiscalYearId: initialData.fiscalYearId,
        supplier: initialData.supplier || '',
        invoiceNumber: initialData.invoiceNumber || '',
        serialNumber: initialData.serialNumber || '',
        location: initialData.location || '',
        notes: initialData.notes || ''
      });
    } else {
      // Reset do formulário quando for um novo ativo
      setFormData({
        name: '',
        description: '',
        category: 'equipment',
        acquisitionDate: '',
        acquisitionValue: 0,
        depreciationRate: 20,
        depreciationMethod: 'linear',
        usefulLifeYears: 5,
        status: 'active',
        costCenterId: '',
        fiscalYearId: '',
        supplier: '',
        invoiceNumber: '',
        serialNumber: '',
        location: '',
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
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.acquisitionDate) newErrors.acquisitionDate = 'Data de aquisição é obrigatória';
    if (!formData.acquisitionValue || formData.acquisitionValue <= 0) {
      newErrors.acquisitionValue = 'Valor de aquisição deve ser maior que zero';
    }
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    
    // Validações específicas
    if (formData.status === 'disposed' && !formData.disposalDate) {
      newErrors.disposalDate = 'Data de baixa é obrigatória para ativos baixados';
    }
    
    if (formData.depreciationMethod !== 'none' && (!formData.depreciationRate || formData.depreciationRate <= 0)) {
      newErrors.depreciationRate = 'Taxa de depreciação deve ser maior que zero';
    }
    
    if (formData.depreciationMethod !== 'none' && (!formData.usefulLifeYears || formData.usefulLifeYears <= 0)) {
      newErrors.usefulLifeYears = 'Vida útil deve ser maior que zero';
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
      
      if (['name', 'category', 'acquisitionDate', 'status', 'costCenterId', 'fiscalYearId'].includes(firstErrorField)) {
        setActiveTab('basic');
      } else if (['acquisitionValue', 'depreciationRate', 'depreciationMethod', 'usefulLifeYears', 'disposalDate', 'disposalValue'].includes(firstErrorField)) {
        setActiveTab('financial');
      } else {
        setActiveTab('additional');
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    // Ajusta valores padrão com base na categoria
    let depreciationRate = formData.depreciationRate;
    let usefulLifeYears = formData.usefulLifeYears;
    let depreciationMethod = formData.depreciationMethod;
    
    switch (category) {
      case 'equipment':
        depreciationRate = 20;
        usefulLifeYears = 5;
        depreciationMethod = 'linear';
        break;
      case 'vehicle':
        depreciationRate = 20;
        usefulLifeYears = 5;
        depreciationMethod = 'linear';
        break;
      case 'furniture':
        depreciationRate = 10;
        usefulLifeYears = 10;
        depreciationMethod = 'linear';
        break;
      case 'building':
        depreciationRate = 4;
        usefulLifeYears = 25;
        depreciationMethod = 'linear';
        break;
      case 'land':
        depreciationRate = 0;
        usefulLifeYears = 0;
        depreciationMethod = 'none';
        break;
      case 'software':
        depreciationRate = 20;
        usefulLifeYears = 5;
        depreciationMethod = 'linear';
        break;
      default:
        depreciationRate = 10;
        usefulLifeYears = 10;
        depreciationMethod = 'linear';
    }
    
    setFormData(prev => ({
      ...prev,
      category: category as any,
      depreciationRate,
      usefulLifeYears,
      depreciationMethod: depreciationMethod as any
    }));
  };

  const handleStatusChange = (status: string) => {
    // Se o status for "disposed", define a data de baixa como hoje se não estiver definida
    if (status === 'disposed' && !formData.disposalDate) {
      setFormData(prev => ({
        ...prev,
        status: status as any,
        disposalDate: new Date().toISOString().split('T')[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        status: status as any
      }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'equipment':
        return <Monitor className="w-5 h-5" />;
      case 'vehicle':
        return <Truck className="w-5 h-5" />;
      case 'furniture':
        return <Home className="w-5 h-5" />;
      case 'building':
        return <Building2 className="w-5 h-5" />;
      case 'land':
        return <Map className="w-5 h-5" />;
      case 'software':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Ativo Imobilizado' : 'Novo Ativo Imobilizado';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Ativo';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {getCategoryIcon(formData.category)}
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
                    Nome do Ativo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Notebook Dell XPS, Veículo Utilitário"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(assetCategoryLabels).map(([value, label]) => (
                      <label 
                        key={value} 
                        className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-colors ${
                          formData.category === value 
                            ? 'bg-blue-50 border-blue-300 text-blue-700' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={value}
                          checked={formData.category === value}
                          onChange={() => handleCategoryChange(value)}
                          className="sr-only"
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>
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
                  placeholder="Descrição detalhada do ativo..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Aquisição *
                  </label>
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="date"
                      value={formData.acquisitionDate}
                      onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.acquisitionDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.acquisitionDate && <p className="text-red-500 text-xs mt-1">{errors.acquisitionDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {Object.entries(assetStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
                </div>
              </div>

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
                  Localização
                </label>
                <div className="flex items-center">
                  <Map className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Escritório Central - Andar 2, Sala de Servidores"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Informações Financeiras */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor de Aquisição (R$) *
                  </label>
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.acquisitionValue || ''}
                      onChange={(e) => setFormData({ ...formData, acquisitionValue: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.acquisitionValue ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.acquisitionValue && <p className="text-red-500 text-xs mt-1">{errors.acquisitionValue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Depreciação
                  </label>
                  <select
                    value={formData.depreciationMethod}
                    onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(depreciationMethodLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.depreciationMethod !== 'none' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taxa de Depreciação Anual (%) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.depreciationRate || ''}
                      onChange={(e) => setFormData({ ...formData, depreciationRate: parseFloat(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.depreciationRate ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="20"
                    />
                    {errors.depreciationRate && <p className="text-red-500 text-xs mt-1">{errors.depreciationRate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vida Útil (anos) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formData.usefulLifeYears || ''}
                      onChange={(e) => setFormData({ ...formData, usefulLifeYears: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.usefulLifeYears ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="5"
                    />
                    {errors.usefulLifeYears && <p className="text-red-500 text-xs mt-1">{errors.usefulLifeYears}</p>}
                  </div>
                </div>
              )}

              {formData.status === 'disposed' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Baixa *
                    </label>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        type="date"
                        value={formData.disposalDate || ''}
                        onChange={(e) => setFormData({ ...formData, disposalDate: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.disposalDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                    </div>
                    {errors.disposalDate && <p className="text-red-500 text-xs mt-1">{errors.disposalDate}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor de Baixa (R$)
                    </label>
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.disposalValue || ''}
                        onChange={(e) => setFormData({ ...formData, disposalValue: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Informações Adicionais */}
          {activeTab === 'additional' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número da Nota Fiscal
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: NF-12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Série
                </label>
                <input
                  type="text"
                  value={formData.serialNumber || ''}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: SN-123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre o ativo..."
                />
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