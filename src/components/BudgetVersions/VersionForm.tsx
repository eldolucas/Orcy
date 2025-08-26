import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Star, BarChart3, Plus, Minus } from 'lucide-react';
import { BudgetVersion, BudgetVersionFormData, versionStatusLabels, scenarioTypeLabels } from '../../types/budgetVersion';
import { useFinancialYears } from '../../hooks/useFinancialYears';
import { useCostCenters } from '../../hooks/useCostCenters';
import { useBudgetVersions } from '../../hooks/useBudgetVersions';

interface VersionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (version: BudgetVersionFormData) => void;
  initialData?: BudgetVersion | null;
}

export function VersionForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: VersionFormProps) {
  const { financialYears } = useFinancialYears();
  const { costCenters } = useCostCenters();
  const { versions, getVersionsByFiscalYear } = useBudgetVersions();
  
  const [formData, setFormData] = useState<BudgetVersionFormData>({
    name: '',
    description: '',
    fiscalYearId: '',
    costCenterId: '',
    status: 'draft',
    isBaseline: false,
    metadata: {
      assumptions: [''],
      scenarioType: 'realistic',
      adjustmentFactor: 1.0,
      tags: ['']
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableParentVersions, setAvailableParentVersions] = useState<BudgetVersion[]>([]);

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        fiscalYearId: initialData.fiscalYearId,
        costCenterId: initialData.costCenterId,
        status: initialData.status,
        isBaseline: initialData.isBaseline,
        parentVersionId: initialData.parentVersionId,
        metadata: {
          assumptions: initialData.metadata?.assumptions || [''],
          scenarioType: initialData.metadata?.scenarioType || 'realistic',
          adjustmentFactor: initialData.metadata?.adjustmentFactor || 1.0,
          tags: initialData.metadata?.tags || ['']
        }
      });
      
      // Carrega as versões disponíveis para o ano fiscal
      if (initialData.fiscalYearId) {
        const fiscalYearVersions = getVersionsByFiscalYear(initialData.fiscalYearId);
        setAvailableParentVersions(fiscalYearVersions.filter(v => v.id !== initialData.id));
      }
    } else {
      // Reset do formulário quando for uma nova versão
      setFormData({
        name: '',
        description: '',
        fiscalYearId: '',
        costCenterId: '',
        status: 'draft',
        isBaseline: false,
        metadata: {
          assumptions: [''],
          scenarioType: 'realistic',
          adjustmentFactor: 1.0,
          tags: ['']
        }
      });
      
      setAvailableParentVersions([]);
    }
    
    setErrors({});
  }, [initialData, isOpen, getVersionsByFiscalYear]);

  // Atualiza as versões disponíveis quando o ano fiscal muda
  useEffect(() => {
    if (formData.fiscalYearId) {
      const fiscalYearVersions = getVersionsByFiscalYear(formData.fiscalYearId);
      
      // Se estiver editando, exclui a própria versão da lista
      if (initialData) {
        setAvailableParentVersions(fiscalYearVersions.filter(v => v.id !== initialData.id));
      } else {
        setAvailableParentVersions(fiscalYearVersions);
      }
    } else {
      setAvailableParentVersions([]);
    }
  }, [formData.fiscalYearId, getVersionsByFiscalYear, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.fiscalYearId) newErrors.fiscalYearId = 'Exercício financeiro é obrigatório';
    
    // Validação de fator de ajuste
    if (formData.metadata?.adjustmentFactor !== undefined && formData.metadata.adjustmentFactor <= 0) {
      newErrors.adjustmentFactor = 'Fator de ajuste deve ser maior que zero';
    }
    
    // Validação de premissas
    if (formData.metadata?.assumptions) {
      const validAssumptions = formData.metadata.assumptions.filter(a => a.trim());
      if (validAssumptions.length === 0) {
        newErrors.assumptions = 'Pelo menos uma premissa é obrigatória';
      }
    }
    
    // Validação de versão base
    if (formData.isBaseline && !initialData?.isBaseline) {
      const existingBaseline = versions.find(v => 
        v.fiscalYearId === formData.fiscalYearId && 
        v.isBaseline
      );
      
      if (existingBaseline) {
        newErrors.isBaseline = 'Já existe uma versão base para este exercício financeiro';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Limpa premissas e tags vazias
      const cleanedFormData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          assumptions: formData.metadata?.assumptions?.filter(a => a.trim()) || [],
          tags: formData.metadata?.tags?.filter(t => t.trim()) || []
        }
      };
      
      onSave(cleanedFormData);
      onClose();
    }
  };

  const handleAddAssumption = () => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        assumptions: [...(prev.metadata?.assumptions || []), '']
      }
    }));
  };

  const handleRemoveAssumption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        assumptions: prev.metadata?.assumptions?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleUpdateAssumption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        assumptions: prev.metadata?.assumptions?.map((a, i) => i === index ? value : a) || []
      }
    }));
  };

  const handleAddTag = () => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: [...(prev.metadata?.tags || []), '']
      }
    }));
  };

  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata?.tags?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const handleUpdateTag = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata?.tags?.map((t, i) => i === index ? value : t) || []
      }
    }));
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Versão de Orçamento' : 'Nova Versão de Orçamento';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Versão';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
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
                Nome da Versão *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Orçamento Base 2024, Simulação - Corte de 10%"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
                disabled={isEditing} // Não permite alterar o exercício financeiro ao editar
              >
                <option value="">Selecione um exercício</option>
                {financialYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.year})
                  </option>
                ))}
              </select>
              {errors.fiscalYearId && <p className="text-red-500 text-xs mt-1">{errors.fiscalYearId}</p>}
              {isEditing && (
                <p className="text-yellow-600 text-xs mt-1">O exercício financeiro não pode ser alterado após a criação</p>
              )}
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
              placeholder="Descrição detalhada da versão de orçamento..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centro de Custo (Opcional)
              </label>
              <select
                value={formData.costCenterId || ''}
                onChange={(e) => setFormData({ ...formData, costCenterId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos os centros de custo</option>
                {costCenters.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.code} - {center.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Deixe em branco para uma versão que abranja toda a empresa
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(versionStatusLabels)
                  .filter(([key]) => ['draft', 'simulation'].includes(key)) // Limita as opções iniciais
                  .map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Versão Base e Versão Pai */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Versão Base
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id="isBaseline"
                    checked={formData.isBaseline}
                    onChange={(e) => setFormData({ ...formData, isBaseline: e.target.checked })}
                    className="sr-only"
                    disabled={isEditing && initialData?.isBaseline} // Não permite desmarcar se já for base
                  />
                  <label
                    htmlFor="isBaseline"
                    className={`block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer ${
                      formData.isBaseline ? 'bg-blue-500' : ''
                    }`}
                  >
                    <span
                      className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform ${
                        formData.isBaseline ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                A versão base é a versão oficial do orçamento para o exercício
              </p>
              {errors.isBaseline && <p className="text-red-500 text-xs mt-1">{errors.isBaseline}</p>}
              {isEditing && initialData?.isBaseline && (
                <p className="text-yellow-600 text-xs mt-1">Uma versão base não pode deixar de ser base</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baseada em (Opcional)
              </label>
              <select
                value={formData.parentVersionId || ''}
                onChange={(e) => setFormData({ ...formData, parentVersionId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isEditing || !formData.fiscalYearId || availableParentVersions.length === 0} // Não permite alterar após criação
              >
                <option value="">Nenhuma (Versão independente)</option>
                {availableParentVersions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.name} {version.isBaseline ? '(Base)' : `(#${version.versionNumber})`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {!formData.fiscalYearId 
                  ? 'Selecione um exercício financeiro primeiro' 
                  : availableParentVersions.length === 0
                  ? 'Não há versões disponíveis para este exercício'
                  : 'Selecione uma versão existente para basear esta nova versão'}
              </p>
              {isEditing && (
                <p className="text-yellow-600 text-xs mt-1">A versão base não pode ser alterada após a criação</p>
              )}
            </div>
          </div>

          {/* Cenário e Fator de Ajuste */}
          {formData.parentVersionId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cenário
                </label>
                <select
                  value={formData.metadata?.scenarioType || 'realistic'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    metadata: { 
                      ...formData.metadata, 
                      scenarioType: e.target.value as any 
                    } 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Object.entries(scenarioTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fator de Ajuste
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.01"
                  value={formData.metadata?.adjustmentFactor || 1.0}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    metadata: { 
                      ...formData.metadata, 
                      adjustmentFactor: parseFloat(e.target.value) || 1.0 
                    } 
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adjustmentFactor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1.0"
                />
                {errors.adjustmentFactor && <p className="text-red-500 text-xs mt-1">{errors.adjustmentFactor}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Use valores maiores que 1 para aumento (ex: 1.1 = +10%) ou menores que 1 para redução (ex: 0.9 = -10%)
                </p>
              </div>
            </div>
          )}

          {/* Premissas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Premissas
              </label>
              <button
                type="button"
                onClick={handleAddAssumption}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Premissa</span>
              </button>
            </div>
            
            {errors.assumptions && <p className="text-red-500 text-xs mb-2">{errors.assumptions}</p>}
            
            <div className="space-y-2">
              {formData.metadata?.assumptions?.map((assumption, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={assumption}
                    onChange={(e) => handleUpdateAssumption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Redução de 10% em despesas não essenciais"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveAssumption(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    disabled={formData.metadata?.assumptions?.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Tags (Opcional)
              </label>
              <button
                type="button"
                onClick={handleAddTag}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Tag</span>
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.metadata?.tags?.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleUpdateTag(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: contingência, redução, expansão"
                  />
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    disabled={formData.metadata?.tags?.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
            >
              <Save className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}