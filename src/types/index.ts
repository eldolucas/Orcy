export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  companyId?: string;
  companies?: string[];
  avatar?: string;
  createdAt: string;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  manager: string;
  parentId?: string;
  level: number;
  path: string;
  children?: CostCenter[];
  budget: number;
  spent: number;
  allocatedBudget: number;
  inheritedBudget: number;
  status: 'active' | 'inactive';
  isExpanded?: boolean;
  createdAt: string;
}

export interface Budget {
  id: string;
  name: string;
  costCenterId: string;
  fiscalYearId: string;
  period: string;
  totalBudget: number;
  spent: number;
  remaining: number;
  status: 'planning' | 'approved' | 'active' | 'completed';
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  percentage: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  costCenterId: string;
  budgetId: string;
  fiscalYearId: string;
  date: string;
  createdBy: string;
  status: 'pending' | 'approved' | 'rejected';
  lastUpdated: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  notes?: string;
  attachments?: string[];
}

export interface Revenue {
  id: string;
  description: string;
  amount: number;
  source: string;
  costCenterId: string;
  budgetId: string;
  fiscalYearId: string;
  date: string;
  createdBy: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  lastUpdated: string;
  confirmedBy?: string;
  confirmedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  notes?: string;
  attachments?: string[];
  recurrenceType?: 'none' | 'monthly' | 'quarterly' | 'yearly';
  nextRecurrenceDate?: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  costCenterId?: string;
  budgetId?: string;
  threshold: number;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetUtilization: number;
  monthlyTrend: number;
  departmentBreakdown: Array<{
    department: string;
    budgeted: number;
    spent: number;
    utilization: number;
  }>;
  recentTransactions: Expense[];
  activeAlerts: Alert[];
}

export interface FiscalYear {
  id: string;
  year: number;
  name: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'closed' | 'archived';
  description?: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
  closedAt?: string;
  budgetVersion: number;
  totalBudget?: number;
  totalSpent?: number;
}

export interface ApprovalWorkflow {
  id: string;
  type: 'expense' | 'revenue' | 'budget';
  entityId: string;
  entityType: string;
  title: string;
  description: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  steps: ApprovalStep[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  metadata?: Record<string, any>;
  lastUpdated: string;
}

export interface ApprovalStep {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  approverRole: string;
  approverIds: string[];
  requiredApprovals: number;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvals: ApprovalAction[];
  dueDate?: string;
  isParallel: boolean;
  conditions?: ApprovalCondition[];
}

export interface ApprovalAction {
  id: string;
  approverId: string;
  approverName: string;
  action: 'approve' | 'reject' | 'request_changes';
  comments?: string;
  timestamp: string;
  attachments?: string[];
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface ApprovalTemplate {
  id: string;
  name: string;
  description: string;
  type: 'expense' | 'revenue' | 'budget';
  steps: Omit<ApprovalStep, 'id' | 'status' | 'approvals'>[];
  conditions: ApprovalCondition[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
}

export interface ApprovalRule {
  id: string;
  name: string;
  description: string;
  type: 'expense' | 'revenue' | 'budget';
  conditions: ApprovalCondition[];
  templateId: string;
  priority: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}
export interface BudgetPlan {
  id: string;
  name: string;
  description: string;
  fiscalYearId: string;
  costCenterId: string;
  planType: 'annual' | 'quarterly' | 'monthly';
  status: 'draft' | 'review' | 'approved' | 'active';
  totalPlanned: number;
  categories: BudgetPlanCategory[];
  assumptions: PlanningAssumption[];
  scenarios: BudgetScenario[];
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BudgetPlanCategory {
  id: string;
  name: string;
  plannedAmount: number;
  growthRate: number;
  seasonality: number[];
  priority: 'high' | 'medium' | 'low';
  justification: string;
}

export interface BudgetScenario {
  id: string;
  name: string;
  description: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  adjustmentFactor: number;
  assumptions: string[];
  projectedTotal: number;
  isDefault: boolean;
}

export interface PlanningAssumption {
  id: string;
  category: string;
  description: string;
  value: number;
  unit: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
}

export interface Forecast {
  id: string;
  name: string;
  description: string;
  type: 'revenue' | 'expense' | 'budget';
  method: 'linear' | 'exponential' | 'seasonal' | 'regression';
  period: 'monthly' | 'quarterly' | 'yearly';
  horizon: number;
  baseData: ForecastDataPoint[];
  projections: ForecastDataPoint[];
  accuracy: number;
  confidence: number;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
}

export interface ForecastDataPoint {
  period: string;
  actual?: number;
  projected: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface VarianceAnalysis {
  id: string;
  name: string;
  period: string;
  costCenterId: string;
  budgetId: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  status: 'favorable' | 'unfavorable' | 'neutral';
  causes: VarianceCause[];
  actions: CorrectiveAction[];
  createdAt: string;
}

export interface VarianceCause {
  id: string;
  category: string;
  description: string;
  impact: number;
  probability: number;
  controllable: boolean;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  responsible: string;
  dueDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  expectedImpact: number;
}

export interface KPI {
  id: string;
  name: string;
  description: string;
  category: string;
  formula: string;
  target: number;
  current: number;
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  owner: string;
  lastUpdated: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'project' | 'cost_center';
  categories: BudgetTemplateCategory[];
  rules: BudgetRule[];
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

export interface BudgetTemplateCategory {
  id: string;
  name: string;
  percentage: number;
  minAmount: number;
  maxAmount: number;
  isRequired: boolean;
}

export interface BudgetRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  isActive: boolean;
}