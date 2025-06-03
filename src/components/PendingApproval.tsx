
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AccessRequest } from '@/types/auth';

const PendingApproval = () => {
  const { user, signOut } = useAuth();
  const [userRequest, setUserRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRequest = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('access_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao buscar solicitação:', error);
        } else if (data) {
          // Type cast para garantir que status seja do tipo correto
          setUserRequest({
            ...data,
            status: data.status as 'pending' | 'approved' | 'denied'
          });
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRequest();
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
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

          <div className="pt-4 border-t border-blue-600/30">
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
