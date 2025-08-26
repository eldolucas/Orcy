import { User } from './index';

export interface Company {
  id: string;
  razaoSocial: string;
  apelido: string;
  cnpj: string;
  codigoEmpresa: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  logo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  responsavel?: string;
  observacoes?: string;
}

export interface CompanyFormData {
  razaoSocial: string;
  apelido: string;
  cnpj: string;
  codigoEmpresa: string;
  status: 'active' | 'inactive';
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  responsavel?: string;
  observacoes?: string;
}