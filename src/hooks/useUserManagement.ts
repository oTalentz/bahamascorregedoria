
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';
import { toast } from '@/hooks/use-toast';

interface UserWithRole extends User {
  created_at: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();

  // Query para buscar usuários
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Buscar usuários com suas roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          created_at
        `);

      if (rolesError) {
        console.error('Erro ao buscar roles:', rolesError);
        throw rolesError;
      }

      // Buscar dados dos usuários do auth
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.error('Erro ao buscar usuários:', authError);
        throw authError;
      }

      // Combinar dados com tipagem correta
      const usersWithRoles: UserWithRole[] = authUsers
        .map(authUser => {
          const roleData = rolesData?.find(r => r.user_id === authUser.id);
          const userRole = roleData?.role as 'admin' | 'member' || 'member';
          
          return {
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name || authUser.email,
            role: userRole,
            created_at: roleData?.created_at || authUser.created_at
          };
        })
        .filter(user => user.email); // Filtrar usuários sem email

      return usersWithRoles;
    }
  });

  // Mutation para remover usuário
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Primeiro remover role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) throw roleError;

      // Depois remover usuário do auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Usuário removido",
        description: "O usuário foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao remover usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover usuário.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar role do usuário
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'member' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Role atualizada",
        description: "A role do usuário foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar role:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar role do usuário.",
        variant: "destructive"
      });
    }
  });

  return {
    users,
    isLoading,
    removeUser: removeUserMutation.mutate,
    updateUserRole: updateUserRoleMutation.mutate,
    isProcessing: removeUserMutation.isPending || updateUserRoleMutation.isPending
  };
};
