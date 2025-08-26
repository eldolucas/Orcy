export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'approver' | 'viewer' | 'staff';
  department: string;
  companyId?: string;
  companies?: string[];
  avatar?: string;
  createdAt: string;
  status: 'active' | 'inactive';
  costCenters?: string[];
  lastLogin?: string;
  phone?: string;
  position?: string;
}

export interface UserFormData {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'user' | 'approver' | 'viewer' | 'staff';
  department: string;
  companyId?: string;
  companies?: string[];
  status: 'active' | 'inactive';
  costCenters?: string[];
  phone?: string;
  position?: string;
  password?: string;
}

export const userRoleLabels = {
  admin: 'Administrador',
  manager: 'Gestor',
  user: 'Usuário',
  approver: 'Aprovador',
  viewer: 'Visualizador',
  staff: 'Staff'
};

export const userRoleDescriptions = {
  admin: 'Acesso total ao sistema, incluindo configurações e cadastros',
  manager: 'Gerencia orçamentos, aprova despesas e receitas',
  user: 'Registra despesas e receitas, visualiza orçamentos',
  approver: 'Responsável por aprovar solicitações financeiras',
  viewer: 'Apenas visualiza informações, sem permissão para editar',
  staff: 'Equipe de suporte com acesso a configurações específicas'
};

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export';
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}