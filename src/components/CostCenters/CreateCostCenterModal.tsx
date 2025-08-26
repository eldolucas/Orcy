import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { CostCenter } from '../../types';

interface CreateCostCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (costCenter: Partial<CostCenter>) => Promise<void>; // ← agora retorna Promise
  parentCostCenters: CostCenter[];
}

export function CreateCostCenterModal({ 
  isOpen, 
  onClose, 
  onSave, 
  parentCostCenters 
}: CreateCostCenterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    department: '',
    manager: '',
    parentId: '',
    budget: '',
    status: 'active' as const
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => { // ← agora é async
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.code.trim()) newErrors.code = 'Código é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.department.trim()) newErrors.department = 'Departamento é obrigatório';
    if (!formData.manager.trim()) newErrors.manager = 'Gestor é obrigatório';
    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Orçamento deve ser maior que zero';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      
      const parentCenter = parentCostCenters.find(c => c.id === formData.parentId);
      const level = parentCenter ? parentCenter.level + 1 : 0;
      const path = parentCenter ? `${parentCenter.path}/${formData.code}` : formData.code;

      const costCenterData: Partial<CostCenter> = {
        ...formData,
        budget: parseFloat(formData.budget),
        spent: 0,
        allocatedBudget: parseFloat(formData.budget),
        inheritedBudget: 0,
        level,
        path,
        parentId: formData.parentId || undefined,
        createdAt: new Date().toISOString().split('T')[0],
        status: formData.status as 'active' | 'inactive'
      };

      try {
        await onSave(costCenterData); // ← agora compila
        // Reset form APÓS salvar com sucesso
        setFormData({
          name: '',
          code: '',
          description: '',
          department: '',
          manager: '',
          parentId: '',
          budget: '',
          status: 'active'
        });
        setErrors({});
        onClose();
      } catch (err) {
        // Tratamento de erro é feito no componente pai
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Novo Centro de Custo</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
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
                placeholder="Nome do centro de custo"
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
                placeholder="Código único"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descrição do centro de custo"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Hierarchy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Centro de Custo Pai (Opcional)
            </label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Nenhum (Centro de custo raiz)</option>
              {parentCostCenters.map((center) => (
                <option key={center.id} value={center.id}>
                  {center.path} - {center.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selecione um centro de custo pai para criar uma hierarquia
            </p>
          </div>

          {/* Management Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento *
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.department ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Departamento responsável"
              />
              {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gestor Responsável *
              </label>
              <input
                type="text"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.manager ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nome do gestor"
              />
              {errors.manager && <p className="text-red-500 text-xs mt-1">{errors.mana
