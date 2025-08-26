import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface CompanyInfo {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  activeCompany: CompanyInfo | null;
  userCompanies: CompanyInfo[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchCompany: (companyId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440101',
    email: 'admin@empresa.com',
    name: 'João Silva',
    role: 'admin',
    department: 'TI',
    companyId: '550e8400-e29b-41d4-a716-446655440001',
    companies: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440102',
    email: 'gestor@empresa.com',
    name: 'Maria Santos',
    role: 'manager',
    department: 'Financeiro',
    companyId: '550e8400-e29b-41d4-a716-446655440001',
    companies: ['550e8400-e29b-41d4-a716-446655440001'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440103',
    email: 'usuario@empresa.com',
    name: 'Pedro Costa',
    role: 'user',
    department: 'Marketing',
    companyId: '550e8400-e29b-41d4-a716-446655440002',
    companies: ['550e8400-e29b-41d4-a716-446655440002'],
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    createdAt: '2023-01-01'
  }
];

// Mock companies for demo
const mockCompanies: CompanyInfo[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Empresa Modelo Ltda'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Tecnologia Avançada S.A.'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Indústria Nacional de Produtos Ltda'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeCompany, setActiveCompany] = useState<CompanyInfo | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    const storedCompanyId = localStorage.getItem('activeCompanyId');
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      // Carregar empresas do usuário
      if (parsedUser.companies && parsedUser.companies.length > 0) {
        const companies = parsedUser.companies.map(companyId => 
          mockCompanies.find(c => c.id === companyId)
        ).filter(Boolean) as CompanyInfo[];
        
        setUserCompanies(companies);
        
        // Definir empresa ativa
        const companyId = storedCompanyId || parsedUser.companyId || parsedUser.companies[0];
        const company = mockCompanies.find(c => c.id === companyId);
        if (company) {
          setActiveCompany(company);
          localStorage.setItem('activeCompanyId', company.id);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const switchCompany = (companyId: string) => {
    const company = mockCompanies.find(c => c.id === companyId);
    if (company && user && user.companies?.includes(companyId)) {
      setActiveCompany(company);
      localStorage.setItem('activeCompanyId', company.id);
      
      // Atualizar o usuário com a nova empresa ativa
      const updatedUser = { ...user, companyId };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && password === '123456') {
      // Carregar empresas do usuário
      if (foundUser.companies && foundUser.companies.length > 0) {
        const companies = foundUser.companies.map(companyId => 
          mockCompanies.find(c => c.id === companyId)
        ).filter(Boolean) as CompanyInfo[];
        
        setUserCompanies(companies);
        
        // Definir empresa ativa
        const companyId = foundUser.companyId || foundUser.companies[0];
        const company = mockCompanies.find(c => c.id === companyId);
        if (company) {
          setActiveCompany(company);
          localStorage.setItem('activeCompanyId', company.id);
        }
      }
      
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setActiveCompany(null);
    setUserCompanies([]);
    localStorage.removeItem('user');
    localStorage.removeItem('activeCompanyId');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      activeCompany,
      userCompanies,
      login, 
      logout, 
      switchCompany,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}