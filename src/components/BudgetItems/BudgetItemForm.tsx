import React, { useState, useEffect } from 'react';
import { X, Save, FileText, DollarSign } from 'lucide-react';
import { BudgetItem, BudgetItemFormData, budgetItemTypeLabels } from '../../types/budgetItem';
import { FinancialYear } from '../../types/financialYear';
import { BudgetRevision } from '../../types/budgetRevision';
import { AccountingClassification } from '../../types/accountingClassification';
import { CostCenter } from '../../types';

interface BudgetItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BudgetItemFormData) => void;
  initialData?: BudgetItem | null;
  financialYears: FinancialYear[];
  budgetRevisions: BudgetRevision[];
  accountingClassifications: AccountingClassification[];
  costCenters: CostCenter[];
}

export function BudgetItemForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  financialYears,
  budgetRevisions,
  accountingClassifications,
  costCenters
}: BudgetItemFormProps) {
  const [formData, setFormData] = useState<BudgetItemFormData>({
    financialYearId: '',
    budgetRevisionId: '',
    accountingClassificationId: '',
    costCenterId: '',
    name: '',
    description: '',
    budgetedAmount: 0,
    type: 'expense'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableRevisions, setAvailableRevisions] = useState<BudgetRevision[]>([]);
  const [filteredClassifications, setFilteredClassifications] = useState<AccountingClassification[]>([]);

  // Initialize form with initial data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        financialYearId: initialData.financialYearId,
        budgetRevisionId: initialData.budgetRevisionId,
        accountingClassificationId: initialData.accountingClassificationId,
        costCenterId: initialData.costCenterId,
        name: initialData.name,
        description: initialData.description || '',
        budgetedAmount: initialData.budgetedAmount,
        type: initialData.type
      });
      
      // Filter revisions for the selected financial year
      if (initialData.financialYearId) {
        const revisions = budgetRevisions.filter(
          revision => revision.financialYearId === initialData.financialYearId
        );
        setAvailableRevisions(revisions);
      }
      
      // Filter classifications by type
      const classifications = accountingClassifications.filter(
        classification => classification.type === initialData.type
      );
      setFilteredClassifications(classifications);
    } else {
      // Reset form when creating new
      setFormData({
        financialYearId: '',
        budgetRevisionId: '',
        accountingClassificationId: '',
        costCenterId: '',
        name: '',
        description: '',
        budgetedAmount: 0,
        type: 'expense'
      });
      setAvailableRevisions([]);
      setFilteredClassifications([]);
    }
    setErrors({});
  }, [initialData, isOpen, budgetRevisions, accountingClassifications]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.financialYearId) newErrors.financialYearId = 'Exercício financeiro é obrigatório';
    if (!formData.accountingClassificationId) newErrors.accountingClassificationId = 'Classificação contábil é obrigatória';
    if (!formData.costCenterId) newErrors.costCenterId = 'Centro de custo é obrigatório';
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.budgetedAmount || formData.budgetedAmount <= 0) {
      newErrors.budgetedAmount = 'Valor orçado deve ser maior que zero';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleFinancialYearChange = (financialYearId: string) => {
    setFormData(prev => ({
      ...prev,
      financialYearId,
      budgetRevisionId: '' // Reset revision when financial year changes
    }));
    
    // Filter revisions for the selected financial year
    const revisions = budgetRevisions.filter(
      revision => revision.financialYearId === financialYearId
    );
    setAvailableRevisions(revisions);
  };

  const handleTypeChange = (type: 'revenue' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type,
      accountingClassificationId: '' // Reset classification when type changes
    }));
    
    // Filter classifications by type
    const classifications = accountingClassifications.filter(
      classification => classification.type === type
    );
    setFilteredClassifications(classifications);
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Item Orçamentário' : 'Novo Item Orçamentário';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Criar Item';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
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
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(budgetItemTypeLabels).map(([value, label]) => (
                <label 
                  key={value} 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === value 
                      ? value === 'revenue' 
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-red-50 border-red-300 text-red-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={formData.type === value}
                    onChange={() => handleTypeChange(value as 'revenue' | 'expense')}
                    className="sr-only"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Financial Year and Revision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exercício Financeiro *
              </label>
              <select
                value={formData.financialYearId}
                onChange={(e) => handleFinancialYearChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.financialYearId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isEditing} // Can't change financial year when editing
              >
                <option value="">Selecione um exercício</option>
                {financialYears
                  .filter(year => year.status === 'active' || year.status === 'planning')
                  .map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name} ({year.year})
                    </option>
                  ))}
              </select>
              {errors.financialYearId && <p className="text-red-500 text-xs mt-1">{errors.financialYearId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Revisão Orçamentária (Opcional)
              </label>
              <select
                value={formData.budgetRevisionId || ''}
                onChange={(e) => setFormData({ ...formData, budgetRevisionId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.financialYearId || availableRevisions.length === 0}
              >
                <option value="">Nenhuma (Orçamento Original)</option>
                {availableRevisions.map((revision) => (
                  <option key={revision.id} value={revision.id}>
                    Revisão #{revision.revisionNumber} ({new Date(revision.revisionDate).toLocaleDateString('pt-BR')})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {!formData.financialYearId 
                  ? 'Selecione um exercício financeiro primeiro'
                  : availableRevisions.length === 0
                  ? 'Não há revisões disponíveis para este exercício'
                  : 'Selecione uma revisão ou deixe em branco para o orçamento original'}
              </p>
            </div>
          </div>

          {/* Classification and Cost Center */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classificação Contábil *
              </label>
              <select
                value={formData.accountingClassificationId}
                onChange={(e) => setFormData({ ...formData, accountingClassificationId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.accountingClassificationId ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={filteredClassifications.length === 0}
              >
                <option value="">Selecione uma classificação</option>
                {filteredClassifications.map((classification) => (
                  <option key={classification.id} value={classification.id}>
                    {classification.code} - {classification.name}
                  </option>
                ))}
              </select>
              {errors.accountingClassificationId && <p className="text-red-500 text-xs mt-1">{errors.accountingClassificationId}</p>}
              {filteredClassifications.length === 0 && (
                <p className="text-yellow-600 text-xs mt-1">
                  Não há classificações disponíveis para o tipo selecionado
                </p>
              )}
            </div>

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
          </div>

          {/* Name and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Nome do item orçamentário"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Orçado (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.budgetedAmount || ''}
                onChange={(e) => setFormData({ ...formData, budgetedAmount: parseFloat(e.target.value) || 0 })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.budgetedAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.budgetedAmount && <p className="text-red-500 text-xs mt-1">{errors.budgetedAmount}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição detalhada do item orçamentário..."
            />
          </div>

          {/* Actions */}
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