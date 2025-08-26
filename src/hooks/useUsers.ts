import { useState, useEffect } from 'react';
import { User, UserFormData } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

// Mock data para usuários
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@empresa.com',
    name: 'João Silva',
    role: 'admin',
    department: 'TI',
    companyId: '1',
    companies: ['1', '2'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01',
    status: 'active',
    costCenters: ['1', '11', '12'],
    lastLogin: '2024-11-25',
    position: 'Diretor de TI'
  },
  {
    id: '2',
    email: 'gestor@empresa.com',
    name: 'Maria Santos',
    role: 'manager',
    department: 'Financeiro',
    companyId: '1',
    companies: ['1'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01',
    status: 'active',
    costCenters: ['3'],
    lastLogin: '2024-11-24',
    position: 'Gerente Financeiro'
  },
  {
    id: '3',
    email: 'usuario@empresa.com',
    name: 'Pedro Costa',
    role: 'user',
    department: 'Marketing',
    companyId: '2',
    companies: ['2'],
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01',
    status: 'active',
    costCenters: ['21', '22', '23'],
    lastLogin: '2024-11-23',
    position: 'Analista de Marketing'
  },
  {
    id: '4',
    email: 'aprovador@empresa.com',
    name: 'Ana Rodrigues',
    role: 'approver',
    department: 'Diretoria',
    companyId: '1',
    companies: ['1', '2'],
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-02-15',
    status: 'active',
    costCenters: ['1', '2', '3'],
    lastLogin: '2024-11-22',
    position: 'Diretora Executiva'
  },
  {
    id: '5',
    email: 'visualizador@empresa.com',
    name: 'Carlos Oliveira',
    role: 'viewer',
    department: 'Contabilidade',
    companyId: '2',
    companies: ['2'],
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-03-10',
    status: 'active',
    costCenters: ['21'],
    lastLogin: '2024-11-21',
    position: 'Contador'
  },
  {
    id: '6',
    email: 'staff@empresa.com',
    name: 'Roberto Lima',
    role: 'staff',
    department: 'Suporte',
    companyId: '1',
    companies: ['1', '2', '3'],
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-04-05',
    status: 'active',
    costCenters: [],
    lastLogin: '2024-11-20',
    position: 'Analista de Suporte'
  },
  {
    id: '7',
    email: 'inativo@empresa.com',
    name: 'Juliana Costa',
    role: 'user',
    department: 'RH',
    companyId: '3',
    companies: ['3'],
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-05-20',
    status: 'inactive',
    costCenters: [],
    lastLogin: '2024-10-15',
    position: 'Ex-Analista de RH'
  }
];

export function useUsers() {
  const { activeCompany } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simula uma chamada de API
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simula um delay de rede
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Filtrar usuários pela empresa ativa
        const filteredUsers = activeCompany 
          ? mockUsers.filter(user => user.companies?.includes(activeCompany.id))
          : mockUsers;
        
        setUsers(filteredUsers);
      } catch (err) {
        setError('Erro ao carregar usuários. Por favor, tente novamente.');
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [activeCompany]);

  const addUser = async (userData: UserFormData): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!activeCompany && !userData.companyId && (!userData.companies || userData.companies.length === 0)) {
        throw new Error('É necessário especificar pelo menos uma empresa para o usuário');
      }
      
      const companyId = userData.companyId || activeCompany?.id;
      const companies = userData.companies || (companyId ? [companyId] : []);
      
      const newUser: User = {
        id: Date.now().toString(),
        ...userData,
        companyId,
        companies,
        createdAt: new Date().toISOString().split('T')[0],
        status: userData.status || 'active',
        lastLogin: undefined
      };
      
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar usuário';
      setError(errorMessage);
      console.error('Erro ao adicionar usuário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (id: string, updates: Partial<UserFormData>): Promise<User> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let updatedUser: User | undefined;
      
      setUsers(prev => 
        prev.map(user => {
          if (user.id === id) {
            updatedUser = {
              ...user,
              ...updates,
              // Se estiver atualizando companies, certifique-se de que companyId está incluído
              companyId: updates.companyId || (updates.companies && updates.companies.length > 0 ? updates.companies[0] : user.companyId)
            };
            return updatedUser;
          }
          return user;
        })
      );
      
      if (!updatedUser) {
        throw new Error('Usuário não encontrado');
      }
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar usuário';
      setError(errorMessage);
      console.error('Erro ao atualizar usuário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simula um delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verifica se o usuário existe
      const userExists = users.some(user => user.id === id);
      if (!userExists) {
        throw new Error('Usuário não encontrado');
      }
      
      // Em vez de excluir, marca como inativo
      setUsers(prev => 
        prev.map(user => 
          user.id === id 
            ? { ...user, status: 'inactive' }
            : user
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir usuário';
      setError(errorMessage);
      console.error('Erro ao excluir usuário:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
  };

  const getFilteredUsers = (
    searchTerm: string = '', 
    roleFilter: string = 'all',
    statusFilter: string = 'all',
    departmentFilter: string = 'all'
  ): User[] => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department.toLowerCase().includes(term) ||
        (user.position && user.position.toLowerCase().includes(term))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === departmentFilter);
    }

    return filtered;
  };

  const getUsersByRole = (role: string): User[] => {
    return users.filter(user => user.role === role);
  };

  const getUsersByDepartment = (department: string): User[] => {
    return users.filter(user => user.department === department);
  };

  const getUsersByCompany = (companyId: string): User[] => {
    return users.filter(user => user.companies?.includes(companyId));
  };

  const getUsersByCostCenter = (costCenterId: string): User[] => {
    return users.filter(user => user.costCenters?.includes(costCenterId));
  };

  const getDepartments = (): string[] => {
    const departments = [...new Set(users.map(user => user.department))];
    return departments.sort();
  };

  return {
    users,
    isLoading,
    error,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    getFilteredUsers,
    getUsersByRole,
    getUsersByDepartment,
    getUsersByCompany,
    getUsersByCostCenter,
    getDepartments
  };
}