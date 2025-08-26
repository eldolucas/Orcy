import { useState, useEffect } from 'react';
import { ApprovalWorkflow, ApprovalStep, ApprovalAction, ApprovalTemplate, ApprovalRule } from '../types';

// Mock data for approval workflows
const mockWorkflows: ApprovalWorkflow[] = [
  {
    id: '1',
    type: 'expense',
    entityId: '3',
    entityType: 'Equipamentos de TI',
    title: 'Aprovação de Despesa - Equipamentos de TI',
    description: '5 notebooks para equipe de desenvolvimento',
    amount: 25000,
    requestedBy: 'Ana Rodrigues',
    requestedAt: '2024-01-13',
    status: 'pending',
    currentStep: 1,
    totalSteps: 3,
    priority: 'high',
    dueDate: '2024-01-20',
    lastUpdated: '2024-01-13',
    steps: [
      {
        id: '1',
        stepNumber: 1,
        name: 'Aprovação do Gestor Direto',
        description: 'Aprovação pelo gestor do centro de custo',
        approverRole: 'manager',
        approverIds: ['2'],
        requiredApprovals: 1,
        status: 'pending',
        approvals: [],
        isParallel: false,
        dueDate: '2024-01-15'
      },
      {
        id: '2',
        stepNumber: 2,
        name: 'Aprovação Financeira',
        description: 'Aprovação pelo departamento financeiro',
        approverRole: 'financial',
        approverIds: ['1'],
        requiredApprovals: 1,
        status: 'pending',
        approvals: [],
        isParallel: false,
        dueDate: '2024-01-18'
      },
      {
        id: '3',
        stepNumber: 3,
        name: 'Aprovação da Diretoria',
        description: 'Aprovação final pela diretoria',
        approverRole: 'admin',
        approverIds: ['1'],
        requiredApprovals: 1,
        status: 'pending',
        approvals: [],
        isParallel: false,
        dueDate: '2024-01-20'
      }
    ],
    metadata: {
      costCenterId: '12',
      budgetId: '1',
      category: 'Infraestrutura'
    }
  },
  {
    id: '2',
    type: 'revenue',
    entityId: '3',
    entityType: 'Consultoria Especializada',
    title: 'Confirmação de Receita - Consultoria',
    description: 'Projeto de consultoria em andamento',
    amount: 25000,
    requestedBy: 'Ana Rodrigues',
    requestedAt: '2024-01-20',
    status: 'approved',
    currentStep: 2,
    totalSteps: 2,
    priority: 'medium',
    lastUpdated: '2024-01-22',
    steps: [
      {
        id: '4',
        stepNumber: 1,
        name: 'Validação Comercial',
        description: 'Validação pelo departamento comercial',
        approverRole: 'manager',
        approverIds: ['2'],
        requiredApprovals: 1,
        status: 'approved',
        approvals: [
          {
            id: '1',
            approverId: '2',
            approverName: 'Maria Santos',
            action: 'approve',
            comments: 'Receita validada conforme contrato',
            timestamp: '2024-01-21'
          }
        ],
        isParallel: false
      },
      {
        id: '5',
        stepNumber: 2,
        name: 'Aprovação Financeira',
        description: 'Confirmação pelo departamento financeiro',
        approverRole: 'admin',
        approverIds: ['1'],
        requiredApprovals: 1,
        status: 'approved',
        approvals: [
          {
            id: '2',
            approverId: '1',
            approverName: 'João Silva',
            action: 'approve',
            comments: 'Receita confirmada e registrada',
            timestamp: '2024-01-22'
          }
        ],
        isParallel: false
      }
    ],
    metadata: {
      costCenterId: '1',
      budgetId: '1',
      source: 'Serviços'
    }
  },
  {
    id: '3',
    type: 'expense',
    entityId: '7',
    entityType: 'Consultoria em Segurança',
    title: 'Aprovação de Despesa - Consultoria',
    description: 'Auditoria de segurança trimestral',
    amount: 12000,
    requestedBy: 'Roberto Lima',
    requestedAt: '2024-01-09',
    status: 'rejected',
    currentStep: 2,
    totalSteps: 3,
    priority: 'medium',
    lastUpdated: '2024-01-11',
    steps: [
      {
        id: '6',
        stepNumber: 1,
        name: 'Aprovação do Gestor Direto',
        description: 'Aprovação pelo gestor do centro de custo',
        approverRole: 'manager',
        approverIds: ['1'],
        requiredApprovals: 1,
        status: 'approved',
        approvals: [
          {
            id: '3',
            approverId: '1',
            approverName: 'João Silva',
            action: 'approve',
            comments: 'Aprovado para prosseguir',
            timestamp: '2024-01-10'
          }
        ],
        isParallel: false
      },
      {
        id: '7',
        stepNumber: 2,
        name: 'Aprovação Financeira',
        description: 'Aprovação pelo departamento financeiro',
        approverRole: 'financial',
        approverIds: ['2'],
        requiredApprovals: 1,
        status: 'rejected',
        approvals: [
          {
            id: '4',
            approverId: '2',
            approverName: 'Maria Santos',
            action: 'reject',
            comments: 'Orçamento insuficiente para este trimestre',
            timestamp: '2024-01-11'
          }
        ],
        isParallel: false
      },
      {
        id: '8',
        stepNumber: 3,
        name: 'Aprovação da Diretoria',
        description: 'Aprovação final pela diretoria',
        approverRole: 'admin',
        approverIds: ['1'],
        requiredApprovals: 1,
        status: 'pending',
        approvals: [],
        isParallel: false
      }
    ],
    metadata: {
      costCenterId: '13',
      budgetId: '1',
      category: 'Consultoria'
    }
  }
];

const mockTemplates: ApprovalTemplate[] = [
  {
    id: '1',
    name: 'Despesas até R$ 10.000',
    description: 'Fluxo simplificado para despesas de baixo valor',
    type: 'expense',
    steps: [
      {
        stepNumber: 1,
        name: 'Aprovação do Gestor',
        description: 'Aprovação pelo gestor direto',
        approverRole: 'manager',
        approverIds: [],
        requiredApprovals: 1,
        isParallel: false
      }
    ],
    conditions: [
      { field: 'amount', operator: 'less_than', value: 10000 }
    ],
    isActive: true,
    createdBy: 'João Silva',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '2',
    name: 'Despesas acima de R$ 10.000',
    description: 'Fluxo completo para despesas de alto valor',
    type: 'expense',
    steps: [
      {
        stepNumber: 1,
        name: 'Aprovação do Gestor',
        description: 'Aprovação pelo gestor direto',
        approverRole: 'manager',
        approverIds: [],
        requiredApprovals: 1,
        isParallel: false
      },
      {
        stepNumber: 2,
        name: 'Aprovação Financeira',
        description: 'Aprovação pelo departamento financeiro',
        approverRole: 'financial',
        approverIds: [],
        requiredApprovals: 1,
        isParallel: false
      },
      {
        stepNumber: 3,
        name: 'Aprovação da Diretoria',
        description: 'Aprovação final pela diretoria',
        approverRole: 'admin',
        approverIds: [],
        requiredApprovals: 1,
        isParallel: false
      }
    ],
    conditions: [
      { field: 'amount', operator: 'greater_than', value: 10000 }
    ],
    isActive: true,
    createdBy: 'João Silva',
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-01'
  }
];

export function useApprovals() {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [templates, setTemplates] = useState<ApprovalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setWorkflows(mockWorkflows);
      setTemplates(mockTemplates);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const createWorkflow = (workflow: Omit<ApprovalWorkflow, 'id' | 'lastUpdated'>) => {
    const newWorkflow: ApprovalWorkflow = {
      ...workflow,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setWorkflows(prev => [newWorkflow, ...prev]);
    return newWorkflow;
  };

  const updateWorkflow = (id: string, updates: Partial<ApprovalWorkflow>) => {
    setWorkflows(prev => 
      prev.map(workflow => 
        workflow.id === id 
          ? { 
              ...workflow, 
              ...updates, 
              lastUpdated: new Date().toISOString().split('T')[0]
            }
          : workflow
      )
    );
  };

  const approveStep = (workflowId: string, stepId: string, approverId: string, approverName: string, comments?: string) => {
    setWorkflows(prev => 
      prev.map(workflow => {
        if (workflow.id !== workflowId) return workflow;

        const updatedSteps = workflow.steps.map(step => {
          if (step.id !== stepId) return step;

          const newApproval: ApprovalAction = {
            id: Date.now().toString(),
            approverId,
            approverName,
            action: 'approve',
            comments,
            timestamp: new Date().toISOString().split('T')[0]
          };

          const updatedApprovals = [...step.approvals, newApproval];
          const isStepComplete = updatedApprovals.length >= step.requiredApprovals;

          return {
            ...step,
            approvals: updatedApprovals,
            status: isStepComplete ? 'approved' as const : 'pending' as const
          };
        });

        // Check if current step is complete and advance workflow
        const currentStep = updatedSteps.find(s => s.stepNumber === workflow.currentStep);
        const isCurrentStepComplete = currentStep?.status === 'approved';
        const isWorkflowComplete = workflow.currentStep === workflow.totalSteps && isCurrentStepComplete;
        const nextStep = isCurrentStepComplete && !isWorkflowComplete ? workflow.currentStep + 1 : workflow.currentStep;

        return {
          ...workflow,
          steps: updatedSteps,
          currentStep: nextStep,
          status: isWorkflowComplete ? 'approved' as const : workflow.status,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  const rejectStep = (workflowId: string, stepId: string, approverId: string, approverName: string, comments?: string) => {
    setWorkflows(prev => 
      prev.map(workflow => {
        if (workflow.id !== workflowId) return workflow;

        const updatedSteps = workflow.steps.map(step => {
          if (step.id !== stepId) return step;

          const newApproval: ApprovalAction = {
            id: Date.now().toString(),
            approverId,
            approverName,
            action: 'reject',
            comments,
            timestamp: new Date().toISOString().split('T')[0]
          };

          return {
            ...step,
            approvals: [...step.approvals, newApproval],
            status: 'rejected' as const
          };
        });

        return {
          ...workflow,
          steps: updatedSteps,
          status: 'rejected' as const,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  const requestChanges = (workflowId: string, stepId: string, approverId: string, approverName: string, comments: string) => {
    setWorkflows(prev => 
      prev.map(workflow => {
        if (workflow.id !== workflowId) return workflow;

        const updatedSteps = workflow.steps.map(step => {
          if (step.id !== stepId) return step;

          const newApproval: ApprovalAction = {
            id: Date.now().toString(),
            approverId,
            approverName,
            action: 'request_changes',
            comments,
            timestamp: new Date().toISOString().split('T')[0]
          };

          return {
            ...step,
            approvals: [...step.approvals, newApproval]
          };
        });

        return {
          ...workflow,
          steps: updatedSteps,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  const cancelWorkflow = (workflowId: string) => {
    updateWorkflow(workflowId, { status: 'cancelled' });
  };

  const getFilteredWorkflows = (
    searchTerm: string, 
    statusFilter: string, 
    typeFilter: string = 'all',
    priorityFilter: string = 'all',
    assignedToMe: boolean = false,
    userId?: string
  ) => {
    let filtered = workflows;

    if (searchTerm) {
      filtered = filtered.filter(workflow =>
        workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        workflow.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.type === typeFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(workflow => workflow.priority === priorityFilter);
    }

    if (assignedToMe && userId) {
      filtered = filtered.filter(workflow => {
        const currentStep = workflow.steps.find(s => s.stepNumber === workflow.currentStep);
        return currentStep?.approverIds.includes(userId) && workflow.status === 'pending';
      });
    }

    return filtered.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  };

  const getWorkflowsByStatus = (status: string) => {
    return workflows.filter(workflow => workflow.status === status);
  };

  const getWorkflowsByType = (type: string) => {
    return workflows.filter(workflow => workflow.type === type);
  };

  const getPendingApprovalsForUser = (userId: string) => {
    return workflows.filter(workflow => {
      if (workflow.status !== 'pending') return false;
      const currentStep = workflow.steps.find(s => s.stepNumber === workflow.currentStep);
      return currentStep?.approverIds.includes(userId);
    });
  };

  const getWorkflowStats = () => {
    const total = workflows.length;
    const pending = workflows.filter(w => w.status === 'pending').length;
    const approved = workflows.filter(w => w.status === 'approved').length;
    const rejected = workflows.filter(w => w.status === 'rejected').length;
    const cancelled = workflows.filter(w => w.status === 'cancelled').length;

    return { total, pending, approved, rejected, cancelled };
  };

  const getOverdueWorkflows = () => {
    const today = new Date();
    return workflows.filter(workflow => {
      if (workflow.status !== 'pending' || !workflow.dueDate) return false;
      return new Date(workflow.dueDate) < today;
    });
  };

  return {
    workflows,
    templates,
    isLoading,
    createWorkflow,
    updateWorkflow,
    approveStep,
    rejectStep,
    requestChanges,
    cancelWorkflow,
    getFilteredWorkflows,
    getWorkflowsByStatus,
    getWorkflowsByType,
    getPendingApprovalsForUser,
    getWorkflowStats,
    getOverdueWorkflows
  };
}