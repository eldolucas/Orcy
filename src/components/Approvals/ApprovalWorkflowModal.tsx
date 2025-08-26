import React, { useState } from 'react';
import { X, Clock, Save } from 'lucide-react';
import { ApprovalWorkflow } from '../../types';

interface ApprovalWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workflow: Omit<ApprovalWorkflow, 'id' | 'lastUpdated'>) => void;
}

export function ApprovalWorkflowModal({ isOpen, onClose, onSave }: ApprovalWorkflowModalProps) {
  const [formData, setFormData] = useState({
    type: 'expense' as const,
    entityId: '',
    entityType: '',
    title: '',
    description: '',
    amount: '',
    requestedBy: 'Usuário Atual',
    requestedAt: new Date().toISOString().split('T')[0],
    status: 'pending' as const,
    currentStep: 1,
    totalSteps: 3,
    priority: 'medium' as const,
    dueDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Título é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    if (!formData.entityType.trim()) newErrors.entityType = 'Tipo da entidade é obrigatório';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Create basic workflow structure
      const workflow: Omit<ApprovalWorkflow, 'id' | 'lastUpdated'> = {
        ...formData,
        amount: parseFloat(formData.amount),
        steps: [
          {
            id: '1',
            stepNumber: 1,
            name: 'Aprovação do Gestor',
            description: 'Aprovação pelo gestor direto',
            approverRole: 'manager',
            approverIds: ['2'], // Mock approver ID
            requiredApprovals: 1,
            status: 'pending',
            approvals: [],
            isParallel: false
          },
          {
            id: '2',
            stepNumber: 2,
            name: 'Aprovação Financeira',
            description: 'Aprovação pelo departamento financeiro',
            approverRole: 'financial',
            approverIds: ['1'], // Mock approver ID
            requiredApprovals: 1,
            status: 'pending',
            approvals: [],
            isParallel: false
          },
          {
            id: '3',
            stepNumber: 3,
            name: 'Aprovação da Diretoria',
            description: 'Aprovação final pela diretoria',
            approverRole: 'admin',
            approverIds: ['1'], // Mock approver ID
            requiredApprovals: 1,
            status: 'pending',
            approvals: [],
            isParallel: false
          }
        ]
      };

      onSave(workflow);

      // Reset form
      setFormData({
        type: 'expense',
        entityId: '',
        entityType: '',
        title: '',
        description: '',
        amount: '',
        requestedBy: 'Usuário Atual',
        requestedAt: new Date().toISOString().split('T')[0],
        status: 'pending',
        currentStep: 1,
        totalSteps: 3,
        priority: 'medium',
        dueDate: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Novo Workflow de Aprovação</h2>
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
                Tipo *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="expense">Despesa</option>
                <option value="revenue">Receita</option>
                <option value="budget">Orçamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Aprovação de Despesa - Equipamentos"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
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
              placeholder="Descrição detalhada do que está sendo solicitado..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor (R$) *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo da Entidade *
              </label>
              <input
                type="text"
                value={formData.entityType}
                onChange={(e) => setFormData({ ...formData, entityType: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.entityType ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: Equipamentos de TI, Consultoria, etc."
              />
              {errors.entityType && <p className="text-red-500 text-xs mt-1">{errors.entityType}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <span>Criar Workflow</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}