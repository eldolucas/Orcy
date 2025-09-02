import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
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

// Mock companies for demo (these will be replaced with real data from Supabase)
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

  // Function to fetch user profile from profiles table
  const fetchUserProfile = async (authUser: AuthUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!profile) {
        console.error('No profile found for user');
        return null;
      }

      // Convert profile data to User type
      const userData: User = {
        id: profile.id,
        email: authUser.email || '',
        name: profile.name,
        role: profile.role,
        department: profile.department,
        companyId: profile.company_id,
        companies: profile.companies || [],
        avatar: profile.avatar,
        createdAt: profile.created_at
      };

      return userData;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  // Function to load user companies
  const loadUserCompanies = async (userData: User) => {
    try {
      if (userData.companies && userData.companies.length > 0) {
        const { data: companies, error } = await supabase
          .from('companies')
          .select('id, apelido')
          .in('id', userData.companies);

        if (error) {
          console.error('Error fetching user companies:', error);
          // Fallback to mock companies if real data fails
          const companies = userData.companies.map(companyId => 
            mockCompanies.find(c => c.id === companyId)
          ).filter(Boolean) as CompanyInfo[];
          return companies;
        }

        return companies?.map(company => ({
          id: company.id,
          name: company.apelido
        })) || [];
      }
      return [];
    } catch (err) {
      console.error('Error loading user companies:', err);
      return [];
    }
  };

  // Function to set active company
  const setActiveCompanyFromUser = async (userData: User) => {
    const companies = await loadUserCompanies(userData);
    setUserCompanies(companies);

    // Set active company
    const storedCompanyId = localStorage.getItem('activeCompanyId');
    const companyId = storedCompanyId || userData.companyId || userData.companies?.[0];
    
    if (companyId) {
      const company = companies.find(c => c.id === companyId) || 
                    mockCompanies.find(c => c.id === companyId);
      if (company) {
        setActiveCompany(company);
        localStorage.setItem('activeCompanyId', company.id);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          const userData = await fetchUserProfile(session.user);
          if (userData) {
            setUser(userData);
            await setActiveCompanyFromUser(userData);
          }
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await fetchUserProfile(session.user);
          if (userData) {
            setUser(userData);
            await setActiveCompanyFromUser(userData);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setActiveCompany(null);
          setUserCompanies([]);
          localStorage.removeItem('activeCompanyId');
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchCompany = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId) || 
                   mockCompanies.find(c => c.id === companyId);
    
    if (company && user && user.companies?.includes(companyId)) {
      setActiveCompany(company);
      localStorage.setItem('activeCompanyId', company.id);
      
      // Update user with new active company
      const updatedUser = { ...user, companyId };
      setUser(updatedUser);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setIsLoading(false);
        return false;
      }

      if (data.user) {
        const userData = await fetchUserProfile(data.user);
        if (userData) {
          setUser(userData);
          await setActiveCompanyFromUser(userData);
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      
      // State cleanup is handled by the auth state change listener
    } catch (err) {
      console.error('Logout error:', err);
    }
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