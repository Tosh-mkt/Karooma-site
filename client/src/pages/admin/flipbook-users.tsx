import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Users, Mail, Calendar, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuthorizedUser {
  id: string;
  email: string;
  flipbookId: string;
  addedByAdmin: string;
  notes?: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

const FLIPBOOK_OPTIONS = [
  { value: 'organizacao', label: 'Organização da Casa' },
  { value: 'bem-estar', label: 'Bem-estar Familiar' },
  { value: 'alimentacao', label: 'Alimentação Saudável' },
  { value: 'educacao', label: 'Educação Infantil' }
];

export default function FlipbookUsersAdmin() {
  const [selectedFlipbook, setSelectedFlipbook] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all authorized users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/flipbook-users'],
    retry: false,
  });

  // Filter users by selected flipbook
  const filteredUsers = selectedFlipbook === 'all' 
    ? users 
    : users.filter((user: AuthorizedUser) => user.flipbookId === selectedFlipbook);

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: { email: string; flipbookId: string; notes?: string; expiresAt?: string }) => {
      return await apiRequest('/api/admin/flipbook-users', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flipbook-users'] });
      setIsAddDialogOpen(false);
      toast({
        title: 'Usuário adicionado',
        description: 'Acesso ao flipbook concedido com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar usuário',
        variant: 'destructive',
      });
    }
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: async ({ email, flipbookId }: { email: string; flipbookId: string }) => {
      return await apiRequest(`/api/admin/flipbook-users/${encodeURIComponent(email)}/${flipbookId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/flipbook-users'] });
      toast({
        title: 'Usuário removido',
        description: 'Acesso ao flipbook revogado com sucesso!',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Falha ao remover usuário',
        variant: 'destructive',
      });
    }
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-fredoka text-3xl text-gray-800 mb-2">
          Gerenciar Acesso aos Flipbooks
        </h1>
        <p className="text-gray-600 font-poppins">
          Controle quem pode acessar cada flipbook do sistema.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Label htmlFor="flipbook-filter" className="text-sm font-medium">
            Filtrar por Flipbook:
          </Label>
          <Select value={selectedFlipbook} onValueChange={setSelectedFlipbook}>
            <SelectTrigger className="w-48" id="flipbook-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Flipbooks</SelectItem>
              {FLIPBOOK_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Autorizar Novo Usuário</DialogTitle>
            </DialogHeader>
            <AddUserForm 
              onSubmit={(data) => addUserMutation.mutate(data)} 
              isLoading={addUserMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-600" />
              <div>
                <p className="text-sm text-gray-600">Flipbooks Ativos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(users.map((u: AuthorizedUser) => u.flipbookId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Emails Únicos</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(users.map((u: AuthorizedUser) => u.email)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários Autorizados
            {selectedFlipbook !== 'all' && (
              <Badge variant="secondary" className="ml-2">
                {FLIPBOOK_OPTIONS.find(f => f.value === selectedFlipbook)?.label}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum usuário autorizado encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user: AuthorizedUser) => (
                <UserCard 
                  key={`${user.email}-${user.flipbookId}`}
                  user={user}
                  onRemove={() => removeUserMutation.mutate({ 
                    email: user.email, 
                    flipbookId: user.flipbookId 
                  })}
                  isRemoving={removeUserMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Add User Form Component
function AddUserForm({ 
  onSubmit, 
  isLoading 
}: { 
  onSubmit: (data: any) => void; 
  isLoading: boolean; 
}) {
  const [formData, setFormData] = useState({
    email: '',
    flipbookId: '',
    notes: '',
    expiresAt: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiresAt: formData.expiresAt || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email do Usuário</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="usuario@exemplo.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="flipbook">Flipbook</Label>
        <Select 
          value={formData.flipbookId} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, flipbookId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um flipbook" />
          </SelectTrigger>
          <SelectContent>
            {FLIPBOOK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notas (Opcional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Informações sobre o usuário..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="expires">Data de Expiração (Opcional)</Label>
        <Input
          id="expires"
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Adicionando...' : 'Adicionar Usuário'}
      </Button>
    </form>
  );
}

// User Card Component
function UserCard({ 
  user, 
  onRemove, 
  isRemoving 
}: { 
  user: AuthorizedUser; 
  onRemove: () => void; 
  isRemoving: boolean; 
}) {
  const flipbookName = FLIPBOOK_OPTIONS.find(f => f.value === user.flipbookId)?.label || user.flipbookId;
  const isExpired = user.expiresAt && new Date(user.expiresAt) < new Date();

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="font-medium">{user.email}</span>
            {isExpired && (
              <Badge variant="destructive" className="text-xs">
                Expirado
              </Badge>
            )}
            {!user.isActive && (
              <Badge variant="secondary" className="text-xs">
                Inativo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {flipbookName}
            </div>
            
            {user.expiresAt && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Expira: {new Date(user.expiresAt).toLocaleDateString('pt-BR')}
              </div>
            )}
            
            <span>
              Adicionado: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
          
          {user.notes && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{user.notes}"
            </p>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={isRemoving}
          className="text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}