
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AccessRequest } from '@/types/auth';

const PendingApproval = () => {
  const { user, signOut, refreshUserRole } = useAuth();
  const [userRequest, setUserRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserRequest = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar solicitação:', error);
      } else if (data && data.length > 0) {
        // Type cast to ensure status is correct type
        setUserRequest({
          ...data[0],
          status: data[0].status as 'pending' | 'approved' | 'denied'
        });
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequest();
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshUserRole();
      await fetchUserRequest();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-blue-800/95 border-blue-600/70">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-blue-800/95 border-blue-600/70 backdrop-blur-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Clock className="h-10 w-10 text-blue-900" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Aguardando Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-blue-200 mb-4">
              Sua solicitação de acesso foi enviada para aprovação dos administradores.
            </p>
            
            {userRequest ? (
              <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-medium">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userRequest.status === 'pending' 
                      ? 'bg-orange-500 text-white' 
                      : userRequest.status === 'approved'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {userRequest.status === 'pending' ? 'Pendente' : 
                     userRequest.status === 'approved' ? 'Aprovado' : 'Negado'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 font-medium">Enviado em:</span>
                  <span className="text-white">
                    {new Date(userRequest.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {userRequest.reason && (
                  <div className="text-left">
                    <span className="text-blue-300 font-medium block mb-2">Motivo:</span>
                    <div className="bg-slate-600/50 rounded p-3">
                      <p className="text-blue-100 text-sm">{userRequest.reason}</p>
                    </div>
                  </div>
                )}

                {userRequest.status === 'approved' && (
                  <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
                    <p className="text-green-200 text-sm text-center">
                      ✅ Sua solicitação foi aprovada! Faça logout e login novamente para acessar o sistema.
                    </p>
                  </div>
                )}

                {userRequest.status === 'denied' && (
                  <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
                    <p className="text-red-200 text-sm text-center">
                      ❌ Sua solicitação foi negada. Entre em contato com um administrador para mais informações.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-blue-200 text-sm">
                  Nenhuma solicitação encontrada. Você pode tentar fazer logout e se cadastrar novamente.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-sm text-blue-300">
              <FileText className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">O que acontece agora?</p>
                <p className="text-blue-200 mt-1">
                  Um administrador irá revisar sua solicitação e aprovar ou negar o acesso. 
                  Você receberá uma notificação assim que houver uma decisão.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-600/30 space-y-3">
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-blue-900"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Verificar Status'}
            </Button>
            
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-blue-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApproval;
