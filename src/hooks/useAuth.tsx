
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateUserRole: (userId: string, role: 'admin' | 'member') => Promise<{ error: any }>;
  removeUser: (userId: string) => Promise<{ error: any }>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('🔍 Buscando role para usuário:', supabaseUser.email, 'ID:', supabaseUser.id);
    
    try {
      // Use the fixed function to get current user role
      const { data: roleData, error } = await supabase
        .rpc('get_current_user_role');

      if (error) {
        console.error('❌ Erro ao buscar role:', error);
      } else {
        console.log('✅ Role encontrada via RPC:', roleData);
      }

      // If no role, the user hasn't been approved yet
      const userRole = roleData as 'admin' | 'member' | null;

      const userData: User = {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: userRole,
        name: supabaseUser.user_metadata?.name || supabaseUser.email
      };

      console.log('👤 Dados finais do usuário:', userData);
      return userData;
    } catch (err) {
      console.error('💥 Erro inesperado ao buscar role:', err);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: null,
        name: supabaseUser.user_metadata?.name || supabaseUser.email
      };
    }
  };

  const refreshUserRole = async () => {
    console.log('🔄 Fazendo refresh da role do usuário...');
    if (session?.user) {
      const userData = await fetchUserRole(session.user);
      setUser(userData);
      console.log('✅ Role atualizada com sucesso');
    }
  };

  useEffect(() => {
    console.log('🚀 Inicializando AuthProvider...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth state change:', event, session?.user?.email);
        setSession(session);
        
        if (session?.user) {
          console.log('👤 Usuário logado, buscando role...');
          const userData = await fetchUserRole(session.user);
          setUser(userData);
        } else {
          console.log('👤 Usuário deslogado');
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('🔍 Verificando sessão existente:', session?.user?.email);
      setSession(session);
      
      if (session?.user) {
        console.log('👤 Sessão encontrada, buscando role...');
        const userData = await fetchUserRole(session.user);
        setUser(userData);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentativa de login:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('❌ Erro no login:', error);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    console.log('📝 Tentativa de cadastro:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (data.user && !error) {
      console.log('✅ Usuário criado, criando solicitação de acesso...');
      
      // Create access request automatically
      try {
        const { error: requestError } = await supabase
          .from('access_requests')
          .insert([{
            user_id: data.user.id,
            email: email,
            name: name,
            reason: 'Solicitação automática de acesso ao sistema'
          }]);

        if (requestError) {
          console.error('❌ Erro ao criar solicitação:', requestError);
        } else {
          console.log('✅ Solicitação de acesso criada com sucesso');
        }
      } catch (requestErr) {
        console.error('💥 Erro inesperado ao criar solicitação:', requestErr);
      }
    }

    return { error };
  };

  const signOut = async () => {
    console.log('🚪 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const updateUserRole = async (userId: string, role: 'admin' | 'member') => {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ 
        user_id: userId, 
        role: role,
        created_by: user?.name || 'admin'
      });

    return { error };
  };

  const removeUser = async (userId: string) => {
    // First remove role
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    if (roleError) return { error: roleError };

    // Remove user (if has admin permissions)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserRole,
    removeUser,
    refreshUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
