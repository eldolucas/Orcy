import React from 'react';
import { Mail, Phone, Building2, Edit, Trash2, Calendar, User as UserIcon, Briefcase } from 'lucide-react';
import { User, userRoleLabels } from '../../types/user';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'approver':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      case 'viewer':
        return 'bg-yellow-100 text-yellow-800';
      case 'staff':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img 
              src={user.avatar || 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                {userRoleLabels[user.role as keyof typeof userRoleLabels]}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {user.phone}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-1" />
                {user.department}
              </div>
              {user.position && (
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {user.position}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => onEdit(user)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar usuário"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(user.id)}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title={user.status === 'active' ? 'Desativar usuário' : 'Excluir usuário'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Criado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
          {user.lastLogin && (
            <span>Último acesso: {new Date(user.lastLogin).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>
    </div>
  );
}