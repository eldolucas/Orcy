import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Tag } from 'lucide-react';
import { AccountingClassification, AccountingClassificationFormData, accountingTypeLabels } from '../../types/accountingClassification';

interface AccountingClassificationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (classification: AccountingClassificationFormData) => void;
  initialData?: AccountingClassification | null;
}

export function AccountingClassificationForm({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData 
}: AccountingClassificationFormProps) {
  const [formData, setFormData] = useState<AccountingClassificationFormData>({
    name: '',
    code: '',
    type: 'expense',
    description: '',
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializa o formulário com os dados iniciais quando estiver editando
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        type: initialData.type,
        description: initialData.description,
        isActive: initialData.isActive
      });
    } else {
      // Reset do formulário quando for uma nova classificação
      setFormData({
        name: '',
        code: '',
        type: 'expense',
      updateAccountingClassification(classificationToEdit.id, classificationData)
        .then(() => {
          setClassificationToEdit(null);
          setShowCreateModal(false);
        })
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (!formData.type) newErrors.type = 'Tipo é obrigatório';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    addAccountingClassification(classificationData)
      .then(() => {
        setShowCreateModal(false);
      })
      .catch(() => {
        // Error is handled in the hook and displayed in the UI
      });
  };

  const isEditing = !!initialData;
  const modalTitle = isEditing ? 'Editar Classificação Contábil' : 'Nova Classificação Contábil';
      deleteAccountingClassification(id)
        .catch(() => {
          // Error is handled in the hook and displayed in the UI
        });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-blue-600" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Classificação *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Receita de Vendas, Despesas Administrativas, etc."
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

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
                placeholder="Ex: REC-VND, DESP-ADM, etc."
                maxLength={10}
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Classificação *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(accountingTypeLabels).map(([value, label]) => (
                <label 
                  key={value} 
                  className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.type === value 
                      ? 'bg-blue-50 border-blue-300 text-blue-700' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={formData.type === value}
                    onChange={() => setFormData({ ...formData, type: value as any })}
                    className="sr-only"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <div className="flex items-start">
              <FileText className="w-5 h-5 text-gray-400 mr-2 mt-2" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descrição detalhada da classificação contábil..."
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Classificação Ativa</span>
            </label>
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