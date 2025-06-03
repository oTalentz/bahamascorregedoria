
import React, { useState, useEffect } from 'react';
import { Clock, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AccessRequest } from '@/types/auth';

const PendingApproval = () => {
  const { user, signOut } = useAuth();
  const [accessRequest, setAccessRequest] = useState<AccessRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccessRequest = async () => {
      if (!user) return;

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
          setAccessRequest(data);
        }
      } catch (error) {
        console.error('Erro inesperado:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessRequest();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-400';
      case 'approved': return 'text-green-400';
      case 'denied': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando Aprovação';
      case 'approved': return 'Aprovada';
      case 'denied': return 'Negada';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-blue-800/95 border-blue-600/70">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Verificando status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 shadow-2xl border-b border-blue-800/30">
        <div className="container mx-auto px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-xl shadow-lg">
                <Clock className="h-10 w-10 text-blue-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  AGUARDANDO APROVAÇÃO
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  Sua solicitação está sendo analisada
                </p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-blue-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-16 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-gradient-to-br from-blue-800/95 to-slate-800/95 border-blue-600/70 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center space-x-3">
              <User className="h-8 w-8 text-amber-400" />
              <span>Status da Solicitação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {accessRequest ? (
              <>
                <div className="bg-slate-700/95 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-medium">Status:</span>
                    <span className={`font-bold text-lg ${getStatusColor(accessRequest.status)}`}>
                      {getStatusText(accessRequest.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-blue-200 font-medium">Solicitado em:</span>
                    <span className="text-white">
                      {new Date(accessRequest.requested_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {accessRequest.reason && (
                    <div>
                      <span className="text-blue-200 font-medium block mb-2">Motivo:</span>
                      <span className="text-white bg-slate-600/95 p-3 rounded block">
                        {accessRequest.reason}
                      </span>
                    </div>
                  )}

                  {accessRequest.status === 'denied' && (
                    <div className="bg-red-900/50 border border-red-600 rounded-lg p-4">
                      <p className="text-red-200 text-center">
                        Sua solicitação foi negada. Entre em contato com um administrador para mais informações.
                      </p>
                    </div>
                  )}

                  {accessRequest.processed_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200 font-medium">Processado em:</span>
                      <span className="text-white">
                        {new Date(accessRequest.processed_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  {accessRequest.processed_by_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-blue-200 font-medium">Processado por:</span>
                      <span className="text-white">{accessRequest.processed_by_name}</span>
                    </div>
                  )}
                </div>

                {accessRequest.status === 'pending' && (
                  <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-4">
                    <p className="text-orange-200 text-center">
                      <Clock className="h-5 w-5 inline mr-2" />
                      Sua solicitação está sendo analisada pelos administradores. 
                      Você será notificado quando houver uma decisão.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-blue-200 text-lg mb-4">
                  Nenhuma solicitação de acesso encontrada.
                </p>
                <p className="text-white">
                  Entre em contato com um administrador para solicitar acesso ao sistema.
                </p>
              </div>
            )}

            <div className="text-center">
              <Button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Trocar de Conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingApproval;
