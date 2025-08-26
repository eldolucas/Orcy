import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Percent, Plus } from 'lucide-react';
import { BudgetVersionItem, BudgetVersionItemFormData } from '../../types/budgetVersion';
import { BudgetItem } from '../../types/budgetItem';

interface VersionItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: BudgetVersionItemFormData) => void;
  initialData?: BudgetVersionItem | null;
  budgetItems: BudgetItem[];
  excludedItemIds?: string[]; // IDs de itens que já estão na versão
}

export function VersionItemForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  budgetItems,
  excludedItemIds = []
}: VersionItemFormProps) {
  const [formData, setFormData] = useState<BudgetVersionItemFormData>({
    budgetItemId: '',
    adjustmentType: 'percentage',
    adjustmentValue: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalAmount, setOriginalAmount] = useState<number>(0);
  const [adjustedAmount, setAdjustedAmount] = useState<number>(0);

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        budgetItemId: initialData.budgetItemId,
        adjustmentType: initialData.adjustmentType,
        adjustmentValue: initialData.adjustmentValue,
        notes: initialData.notes || ''
      });
      
      setOriginalAmount(initialData.originalAmount);
      setAdjustedAmount(initialData.adjustedAmount);
    } else {
      // Reset do formulário quando for um novo item
      setFormData({
        budgetItemId: '',
        adjustmentType: 'percentage',
        adjustmentValue: 0,
        notes: ''
      });
      
      setOriginalAmount(0);
      setAdjustedAmount(0);
    }
    
    setErrors({});
  }, [initialData, isOpen]);

  // Atualiza o valor original e ajustado quando o item orçamentário muda
  useEffect(() => {
    if (formData.budgetItemId) {
      const budgetItem = budgetItems.find(item => item.id === formData.budgetItemId);
      
      if (budgetItem) {
        const original = budgetItem.budgetedAmount;
        setOriginalAmount(original);
        
        // Calcula o valor ajustado
        let adjusted = original;
        
        if (formData.adjustmentType === 'percentage') {
          adjusted = original * (1 + formData.adjustmentValue / 100);
        } else { // absolute
          adjusted = original + formData.adjustmentValue;
        }
        
        // Garante que o valor não seja negativo
        adjusted = Math.max(0, adjusted);
        
        setAdjustedAmount(adjusted);
      }
    }
  }, [formData.budgetItemId, formData.adjustmentType, formData.adjustmentValue, budgetItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.budgetItemId) newErrors.budgetItemId = 'Item orçamentário é obrigatório';
    
    // Validação específica para o tipo de ajuste
    if (formData.adjustmentType === 'percentage') {
      if (formData.adjustmentValue < -100) {
        newErrors.adjustmentValue = 'O ajuste percentual não pode ser menor que -100%';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
      onClose();
    }
  };

  const handleAdjustmentTypeChange = (type: 'percentage' | 'absolute') => {
    // Converte o valor de ajuste entre percentual e absoluto
    let newValue = 0;
    
    if (type === 'percentage' && formData.adjustmentType === 'absolute') {
      // Converte de absoluto para percentual
      newValue = originalAmount > 0 ? (formData.adjustmentValue / originalAmount) * 100 : 0;
    } else if (type === 'absolute' && formData.adjustmentType === 'percentage') {
      // Converte de percentual para absoluto
      newValue = originalAmount * (formData.adjustmentValue / 100);
    } else {
      newValue = formData.adjustmentValue;
    }
    
    setFormData({
      ...formData,
      adjustmentType: type,
      adjustmentValue: newValue
    });
  };

  // Filtra os itens orçamentários que já estão na versão
  const availableBudgetItems = budgetItems.filter(item => !excludedItemIds.includes(item.id));

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Item da Versão' : 'Adicionar Item à Versão';
  const submitButtonText = isEditing ? 'Salvar Alterações' : 'Adicionar Item';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
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
          {/* Item Orçamentário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Orçamentário *
            </label>
            <select
              value={formData.budgetItemId}
              onChange={(e) => setFormData({ ...formData, budgetItemId: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.budgetItemId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isEditing} // Não permite alterar o item orçamentário ao editar
            >
              <option value="">Selecione um item orçamentário</option>
              {availableBudgetItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.type === 'revenue' ? 'Receita' : 'Despesa'}) - R$ {item.budgetedAmount.toLocaleString()}
                </option>
              ))}
            </select>
            {errors.budgetItemId && <p className="text-red-500 text-xs mt-1">{errors.budgetItemId}</p>}
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1">O item orçamentário não pode ser alterado após a criação</p>
            )}
          </div>

          {/* Valor Original e Ajustado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Original
              </label>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={originalAmount.toLocaleString()}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Ajustado (Calculado)
              </label>
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={adjustedAmount.toLocaleString()}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Tipo e Valor de Ajuste */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Ajuste
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.adjustmentType === 'percentage' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="adjustmentType"
                    value="percentage"
                    checked={formData.adjustmentType === 'percentage'}
                    onChange={() => handleAdjustmentTypeChange('percentage')}
                    className="sr-only"
                  />
                  <Percent className="w-5 h-5 mr-2" />
                  <span>Percentual</span>
                </label>
                
                <label 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.adjustmentType === 'absolute' 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="adjustmentType"
                    value="absolute"
                    checked={formData.adjustmentType === 'absolute'}
                    onChange={() => handleAdjustmentTypeChange('absolute')}
                    className="sr-only"
                  />
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span>Absoluto</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Ajuste {formData.adjustmentType === 'percentage' ? '(%)' : '(R$)'}
              </label>
              <div className="flex items-center">
                {formData.adjustmentType === 'percentage' ? (
                  <Percent className="w-5 h-5 text-gray-400 mr-2" />
                ) : (
                  <DollarSign className="w-5 h-5 text-gray-400 mr-2" />
                )}
                <input
                  type="number"
                  step={formData.adjustmentType === 'percentage' ? '0.1' : '0.01'}
                  value={formData.adjustmentValue}
                  onChange={(e) => setFormData({ ...formData, adjustmentValue: parseFloat(e.target.value) || 0 })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adjustmentValue ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={formData.adjustmentType === 'percentage' ? '0.0' : '0.00'}
                />
              </div>
              {errors.adjustmentValue && <p className="text-red-500 text-xs mt-1">{errors.adjustmentValue}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formData.adjustmentType === 'percentage' 
                  ? 'Use valores positivos para aumento e negativos para redução (ex: 10 para +10%, -5 para -5%)' 
                  : 'Use valores positivos para aumento e negativos para redução (ex: 1000 para +R$1.000, -500 para -R$500)'}
              </p>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Observações sobre o ajuste..."
            />
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