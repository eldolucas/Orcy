import { useState, useEffect } from 'react';
import { Role, RoleFormData, Permission } from '../types/user';

// Mock data para permissões
const mockPermissions: Permission[] = [
  // Permissões para Orçamentos
  { id: '1', name: 'Visualizar Orçamentos', description: 'Permite visualizar orçamentos', module: 'budgets', action: 'read', createdAt: '2024-01-01' },
  { id: '2', name: 'Criar Orçamentos', description: 'Permite criar novos orçamentos', module: 'budgets', action: 'create', createdAt: '2024-01-01' },
  { id: '3', name: 'Editar Orçamentos', description: 'Permite editar orçamentos existentes', module: 'budgets', action: 'update', createdAt: '2024-01-01' },
  { id: '4', name: 'Excluir Orçamentos', description: 'Permite excluir orçamentos', module: 'budgets', action: 'delete', createdAt: '2024-01-01' },
  { id: '5', name: 'Aprovar Orçamentos', description: 'Permite aprovar orçamentos', module: 'budgets', action: 'approve', createdAt: '2024-01-01' },
  
  // Permissões para Despesas
  { id: '6', name: 'Visualizar Despesas', description: 'Permite visualizar despesas', module: 'expenses', action: 'read', createdAt: '2024-01-01' },
  { id: '7', name: 'Criar Despesas', description: 'Permite criar novas despesas', module: 'expenses', action: 'create', createdAt: '2024-01-01' },
  { id: '8', name: 'Editar Despesas', description: 'Permite editar despesas existentes', module: 'expenses', action: 'update', createdAt: '2024-01-01' },
  { id: '9', name: 'Excluir Despesas', description: 'Permite excluir despesas', module: 'expenses', action: 'delete', createdAt: '2024-01-01' },
  { id: '10', name: 'Aprovar Despesas', description: 'Permite aprovar despesas', module: 'expenses', action: 'approve', createdAt: '2024-01-01' },
  
  // Permissões para Receitas
  { id: '11', name: 'Visualizar Receitas', description: 'Permite visualizar receitas', module: 'revenues', action: 'read', createdAt: '2024-01-01' },
  { id: '12', name: 'Criar Receitas', description: 'Permite criar novas receitas', module: 'revenues', action: 'create', createdAt: '2024-01-01' },
  { id: '13', name: 'Editar Receitas', description: 'Permite editar receitas existentes', module: 'revenues', action: 'update', createdAt: '2024-01-01' },
  { id: '14', name: 'Excluir Receitas', description: 'Permite excluir receitas', module: 'revenues', action: 'delete', createdAt: '2024-01-01' },
  { id: '15', name: 'Aprovar Receitas', description: 'Permite aprovar receitas', module: 'revenues', action: 'approve', createdAt: '2024-01-01' },
  
  // Permissões para Centros de Custo
  { id: '16', name: 'Visualizar Centros de Custo', description: 'Permite visualizar centros de custo', module: 'cost-centers', action: 'read', createdAt: '2024-01-01' },
  { id: '17', name: 'Criar Centros de Custo', description: 'Permite criar novos centros de custo', module: 'cost-centers', action: 'create', createdAt: '2024-01-01' },
  { id: '18', name: 'Editar Centros de Custo', description: 'Permite editar centros de custo existentes', module: 'cost-centers', action: 'update', createdAt: '2024-01-01' },
  { id: '19', name: 'Excluir Centros de Custo', description: 'Permite excluir centros de custo', module: 'cost-centers', action: 'delete', createdAt: '2024-01-01' },
  
  // Permissões para Exercícios Financeiros
  { id: '20', name: 'Visualizar Exercícios Financeiros', description: 'Permite visualizar exercícios financeiros', module: 'financial-years', action: 'read', createdAt: '2024-01-01' },
  { id: '21', name: 'Criar Exercícios Financeiros', description: 'Permite criar novos exercícios financeiros', module: 'financial-years', action: 'create', createdAt: '2024-01-01' },
  { id: '22', name: 'Editar Exercícios Financeiros', description: 'Permite editar exercícios financeiros existentes', module: 'financial-years', action: 'update', createdAt: '2024-01-01' },
  { id: '23', name: 'Excluir Exercícios Financeiros', description: 'Permite excluir exercícios financeiros', module: 'financial-years', action: 'delete', createdAt: '2024-01-01' },
  
  // Permissões para Relatórios
  { id: '24', name: 'Visualizar Relatórios', description: 'Permite visualizar relatórios', module: 'reports', action: 'read', createdAt: '2024-01-01' },
  { id: '25', name: 'Exportar Relatórios', description: 'Permite exportar relatórios', module: 'reports', action: 'export', createdAt: '2024-01-01' },
  
  // Permissões para Usuários
  { id: '26', name: 'Visualizar Usuários', description: 'Permite visualizar usuários', module: 'users', action: 'read', createdAt: '2024-01-01' },
  { id: '27', name: 'Criar Usuários', description: 'Permite criar novos usuários', module: 'users', action: 'create', createdAt: '2024-01-01' },
  { id: '28', name: 'Editar Usuários', description: 'Permite editar usuários existentes', module: 'users', action: 'update', createdAt: '2024-01-01' },
  { id: '29', name: 'Excluir Usuários', description: 'Permite excluir usuários', module: 'users', action: 'delete', createdAt: '2024-01-01' },
  
  // Permissões para Empresas
  { id: '30', name: 'Visualizar Empresas', description: 'Permite visualizar empresas', module: 'companies', action: 'read', createdAt: '2024-01-01' },
  { id: '31', name: 'Criar Empresas', description: 'Permite criar novas empresas', module: 'companies', action: 'create', createdAt: '2024-01-01' },
  { id: '32', name: 'Editar Empresas', description: 'Permite editar empresas existentes', module: 'companies', action: 'update', createdAt: '2024-01-01' },
  { id: '33', name: 'Excluir Empresas', description: 'Permite excluir empresas', module: 'companies', action: 'delete', createdAt: '2024-01-01' },
  
  // Permissões para Configurações
  { id: '34', name: 'Visualizar Configurações', description: 'Permite visualizar configurações do sistema', module: 'settings', action: 'read', createdAt: '2024-01-01' },
  { id: '35', name: 'Editar Configurações', description: 'Permite editar configurações do sistema', module: 'settings', action: 'update', createdAt: '2024-01-01' }
];

// Mock data para funções (roles)
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Administrador',
    description: 'Acesso total ao sistema, incluindo configurações e cadastros',
    permissions: mockPermissions.map(p => p.id), // Todas as permissões
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    name: 'Gestor',
    description: 'Gerencia orçamentos, aprova despesas e receitas',
    permissions: [
      '1', '2', '3', '5', // Orçamentos (exceto excluir)
      '6', '7', '8', '10', // Despesas (exceto excluir)
      '11', '12', '13', '15', // Receitas (exceto excluir)
      '16', // Visualizar Centros de Custo
      '20', // Visualizar Exercícios Financeiros
      '24', '25', // Relatórios
      '26' // Visualizar Usuários
    ],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '3',
    name: 'Usuário',
    description: 'Registra despesas e receitas, visualiza orçamentos',
    permissions: [
      '1', // Visualizar Orçamentos
      '6', '7', '8', // Despesas (exceto aprovar e excluir)
      '11', '12', '13', // Receitas (exceto aprovar e excluir)
      '16', // Visualizar Centros de Custo
      '20', // Visualizar Exercícios Financeiros
      '24' // Visualizar Relatórios
    ],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '4',
    name: 'Aprovador',
    description: 'Responsável por aprovar solicitações financeiras',
    permissions: [
      '1', // Visualizar Orçamentos
      '5', // Aprovar Orçamentos
      '6', // Visualizar Despesas
      '10', // Aprovar Despesas
      '11', // Visualizar Receitas
      '15', // Aprovar Receitas
      '16', // Visualizar Centros de Custo
      '20', // Visualizar Exercícios Financeiros
      '24' // Visualizar Relatórios
    ],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '5',
    name: 'Visualizador',
    description: 'Apenas visualiza informações, sem permissão para editar',
    permissions: [
      '1', // Visualizar Orçamentos
      '6', // Visualizar Despesas
      '11', // Visualizar Receitas
      '16', // Visualizar Centros de Custo
      '20', // Visualizar Exercícios Financeiros
      '24' // Visualizar Relatórios
    ],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '6',
    name: 'Staff',
    description: 'Equipe de suporte com acesso a configurações específicas',
    permissions: [
      '1', '2', '3', '4', // Orçamentos (completo)
      '6', '7', '8', '9', // Despesas (exceto aprovar)
      '11', '12', '13', '14', // Receitas (exceto aprovar)
      '16', '17', '18', '19', // Centros de Custo (completo)
      '20', '21', '22', '23', // Exercícios Financeiros (completo)
      '24', '25', // Relatórios
      '26', '27', '28', // Usuários (exceto excluir)
      '30', '31', '32', // Empresas (exceto excluir)
      '34', '35' // Configurações
    ],
    isSystem: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setRoles(mockRoles);
        setPermissions(mockPermissions);
      } catch (err) {
        setError('Erro ao carregar funções e permissões. Por favor, tente novamente.');
        console.error('Erro ao buscar funções e permissões:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addRole = async (roleData: RoleFormData): Promise<Role> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se já existe uma função com o mesmo nome
      const existingRole = roles.find(role => 
        role.name.toLowerCase() === roleData.name.toLowerCase()
      );
      
      if (existingRole) {
        throw new Error('Já existe uma função com este nome');
      }
      
      const newRole: Role = {
        id: Date.now().toString(),
        ...roleData,
        isSystem: roleData.isSystem || false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setRoles(prev => [...prev, newRole]);
      return newRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar função';
      setError(errorMessage);
      console.error('Erro ao adicionar função:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (id: string, updates: Partial<RoleFormData>): Promise<Role> => {
    setIsLoading(true);
    
    try {
      console.log("Atualizando função:", id, updates);
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a função existe
      const roleToUpdate = roles.find(role => role.id === id);
      if (!roleToUpdate) {
        console.error("Função não encontrada:", id);
        throw new Error('Função não encontrada');
      }
      
      // Verifica se é uma função do sistema e está tentando alterar o nome
      if (roleToUpdate.isSystem && updates.name && updates.name !== roleToUpdate.name) {
        console.error("Tentativa de alterar nome de função do sistema");
        throw new Error('Não é possível alterar o nome de uma função do sistema');
      }
      
      // Verifica se já existe outra função com o mesmo nome
      if (updates.name) {
        const existingRole = roles.find(role => 
          role.id !== id && role.name.toLowerCase() === updates.name.toLowerCase()
        );
        
        if (existingRole) {
          console.error("Já existe outra função com este nome:", updates.name);
          throw new Error('Já existe outra função com este nome');
        }
      }
      
      let updatedRole: Role | undefined;
      
      setRoles(prev => 
        prev.map((role) => {
          if (role.id === id) {
            updatedRole = {
              ...role,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            };
            return updatedRole;
          }
          return role;
        })
      );
      
      if (!updatedRole) {
        console.error("Erro ao atualizar função - não encontrada após mapeamento");
        throw new Error('Erro ao atualizar função');
      }
      
      console.log("Função atualizada com sucesso:", updatedRole);
      return updatedRole;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar função';
      setError(errorMessage);
      console.error('Erro ao atualizar função:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRole = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se a função existe
      const roleToDelete = roles.find(role => role.id === id);
      if (!roleToDelete) {
        throw new Error('Função não encontrada');
      }
      
      // Não permite excluir funções do sistema
      if (roleToDelete.isSystem) {
        throw new Error('Não é possível excluir uma função do sistema');
      }
      
      setRoles(prev => prev.filter(role => role.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir função';
      setError(errorMessage);
      console.error('Erro ao excluir função:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleById = (id: string): Role | undefined => {
    return roles.find(role => role.id === id);
  };

  const getPermissionsByModule = (module: string): Permission[] => {
    return permissions.filter(permission => permission.module === module);
  };

  const getPermissionsByIds = (ids: string[]): Permission[] => {
    return permissions.filter(permission => ids.includes(permission.id));
  };

  const getModules = (): string[] => {
    const modules = [...new Set(permissions.map(permission => permission.module))];
    return modules.sort();
  };

  return {
    roles,
    permissions,
    isLoading,
    error,
    addRole,
    updateRole,
    deleteRole,
    getRoleById,
    getPermissionsByModule,
    getPermissionsByIds,
    getModules
  };
}