
import React, { useState } from 'react';
import { Users, Shield, Activity, FileText, UserPlus, UserMinus, Settings, RefreshCw, Trash2, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { useDeletionRequests } from '@/hooks/useDeletionRequests';
import AccessRequestsTable from '@/components/AccessRequestsTable';
import RemoveUserDialog from '@/components/RemoveUserDialog';
import { toast } from '@/hooks/use-toast';

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { users, isLoading: usersLoading, removeUser, updateUserRole, isProcessing } = useUserManagement();
  const { accessRequests, processRequest, isProcessing: requestsProcessing } = useAccessRequests();
  const { deletionRequests, processRequest: processDeletionRequest, isProcessing: deletionProcessing } = useDeletionRequests();
  const [activeTab, setActiveTab] = useState('users');
  const [removeDialog, setRemoveDialog] = useState<{ userId: string; userName: string; userEmail: string } | null>(null);

  const handleLogout = async () => {
    await signOut();
  };

  const handleRemoveUser = (userId: string, userName: string, userEmail: string) => {
    setRemoveDialog({ userId, userName, userEmail });
  };

  const handleConfirmRemove = () => {
    if (removeDialog) {
      removeUser(removeDialog.userId);
      setRemoveDialog(null);
    }
  };

  const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
    updateUserRole({ userId, role: newRole });
  };

  const handleProcessRequest = (requestId: string, action: 'approved' | 'rejected') => {
    processRequest({ requestId, action, processedByName: user?.name || user?.email || 'Admin' });
  };

  const handleProcessDeletionRequest = (requestId: string, action: 'approved' | 'rejected') => {
    processDeletionRequest({ requestId, action, processedByName: user?.name || user?.email || 'Admin' });
  };

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');
  const processedRequests = accessRequests.filter(req => req.status !== 'pending');
  const pendingDeletions = deletionRequests.filter(req => req.status === 'pending');

  const registeredUsers = users.filter(u => u.role);
  const adminUsers = users.filter(u => u.role === 'admin');
  const memberUsers = users.filter(u => u.role === 'member');

  if (usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 to-slate-900 shadow-2xl border-b border-purple-800/30">
        <div className="container mx-auto px-8 py-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-xl shadow-lg">
                <Settings className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  PAINEL ADMINISTRATIVO
                </h1>
                <p className="text-purple-200 mt-2 text-lg">
                  Gerenciamento de Usuários e Solicitações - Corregedoria Policial
                  <span className="block text-green-200 text-sm mt-1">
                    ✅ {user?.name || user?.email} - Administrador
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-purple-900"
              >
                <Shield className="h-5 w-5 mr-2" />
                Sistema Principal
              </Button>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-purple-900"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="bg-gradient-to-br from-blue-800/95 to-slate-800/95 border-blue-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-blue-100">
                Usuários Registrados
              </CardTitle>
              <UserCheck className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{registeredUsers.length}</div>
              <p className="text-sm text-blue-200 mt-1">
                {adminUsers.length} admins, {memberUsers.length} membros
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-800/95 to-slate-800/95 border-amber-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-amber-100">
                Solicitações Pendentes
              </CardTitle>
              <UserPlus className="h-5 w-5 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingRequests.length}</div>
              <p className="text-sm text-amber-200 mt-1">
                aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-800/95 to-slate-800/95 border-red-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-red-100">
                Remoções Pendentes
              </CardTitle>
              <Trash2 className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingDeletions.length}</div>
              <p className="text-sm text-red-200 mt-1">
                infrações para revisar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800/95 to-slate-800/95 border-green-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-green-100">
                Total Processado
              </CardTitle>
              <Activity className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{processedRequests.length}</div>
              <p className="text-sm text-green-200 mt-1">
                solicitações processadas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/95 border-purple-600/60 mb-8 h-14 shadow-xl">
            <TabsTrigger 
              value="users" 
              className="text-purple-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/60 data-[state=active]:to-pink-500/60 data-[state=active]:text-purple-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-purple-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <Users className="h-5 w-5 mr-3" />
              Usuários Registrados ({registeredUsers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="access-requests" 
              className="text-purple-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/60 data-[state=active]:to-pink-500/60 data-[state=active]:text-purple-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-purple-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Solicitações de Acesso ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="deletion-requests" 
              className="text-purple-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/60 data-[state=active]:to-pink-500/60 data-[state=active]:text-purple-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-purple-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <Trash2 className="h-5 w-5 mr-3" />
              Remoção de Infrações ({pendingDeletions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-8">
            {/* Tabela de Usuários Registrados */}
            <Card className="bg-gradient-to-br from-purple-800/80 to-slate-800/80 border-purple-700/70 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="h-6 w-6 text-purple-400" />
                  <span>Usuários Registrados</span>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                    {registeredUsers.length} usuários
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registeredUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-purple-200">Nenhum usuário registrado no sistema</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-purple-700/50">
                          <th className="text-left p-4 text-purple-200 font-medium">Nome</th>
                          <th className="text-left p-4 text-purple-200 font-medium">Email</th>
                          <th className="text-left p-4 text-purple-200 font-medium">Role</th>
                          <th className="text-left p-4 text-purple-200 font-medium">Data de Registro</th>
                          <th className="text-left p-4 text-purple-200 font-medium">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registeredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-purple-700/30 hover:bg-purple-900/20">
                            <td className="p-4 text-white font-medium">{user.name}</td>
                            <td className="p-4 text-purple-200">{user.email}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Badge className={user.role === 'admin' 
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
                                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                }>
                                  {user.role === 'admin' ? 'Administrador' : 'Membro'}
                                </Badge>
                                {user.role === 'member' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRoleChange(user.id, 'admin')}
                                    className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                                    disabled={isProcessing}
                                  >
                                    Promover
                                  </Button>
                                )}
                                {user.role === 'admin' && registeredUsers.filter(u => u.role === 'admin').length > 1 && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRoleChange(user.id, 'member')}
                                    className="text-purple-300 hover:text-white hover:bg-purple-600/20"
                                    disabled={isProcessing}
                                  >
                                    Rebaixar
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-purple-200">
                              {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="p-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRemoveUser(user.id, user.name, user.email)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                disabled={isProcessing || (user.role === 'admin' && registeredUsers.filter(u => u.role === 'admin').length === 1)}
                                title={user.role === 'admin' && registeredUsers.filter(u => u.role === 'admin').length === 1 
                                  ? 'Não é possível remover o último administrador' 
                                  : 'Remover usuário do sistema'
                                }
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access-requests" className="space-y-8">
            <AccessRequestsTable
              accessRequests={accessRequests}
              onProcessRequest={handleProcessRequest}
              isProcessing={requestsProcessing}
            />
          </TabsContent>

          <TabsContent value="deletion-requests" className="space-y-8">
            {/* Tabela de Solicitações de Remoção */}
            <Card className="bg-gradient-to-br from-red-800/80 to-slate-800/80 border-red-700/70 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Trash2 className="h-6 w-6 text-red-400" />
                  <span>Solicitações de Remoção de Infrações</span>
                  <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-500/30">
                    {pendingDeletions.length} pendentes
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDeletions.length === 0 ? (
                  <div className="text-center py-8">
                    <Trash2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-200">Nenhuma solicitação de remoção pendente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDeletions.map((request) => (
                      <div key={request.id} className="bg-red-900/20 border border-red-700/40 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-white font-semibold">
                              Solicitação de {request.requested_by_name}
                            </h3>
                            <p className="text-red-200 text-sm">
                              {new Date(request.created_at || '').toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                            Pendente
                          </Badge>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                          <div>
                            <span className="text-red-300 font-medium">Motivo:</span>
                            <p className="text-red-200 mt-1">{request.deletion_reason}</p>
                          </div>
                          
                          {request.original_data && (
                            <div>
                              <span className="text-red-300 font-medium">Dados da Infração:</span>
                              <div className="bg-red-900/30 border border-red-700/30 rounded p-3 mt-1">
                                <p className="text-red-200 text-sm">
                                  <strong>Policial:</strong> {request.original_data.officer_name} (ID: {request.original_data.officer_id})
                                </p>
                                <p className="text-red-200 text-sm">
                                  <strong>Punição:</strong> {request.original_data.punishment_type}
                                </p>
                                <p className="text-red-200 text-sm">
                                  <strong>Severidade:</strong> {request.original_data.severity}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleProcessDeletionRequest(request.id, 'approved')}
                            disabled={deletionProcessing}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Aprovar Remoção
                          </Button>
                          <Button
                            onClick={() => handleProcessDeletionRequest(request.id, 'rejected')}
                            disabled={deletionProcessing}
                            variant="outline"
                            className="border-red-600 text-red-300 hover:bg-red-900/20"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Remoção */}
        {removeDialog && (
          <RemoveUserDialog
            userName={removeDialog.userName}
            userEmail={removeDialog.userEmail}
            onClose={() => setRemoveDialog(null)}
            onConfirm={handleConfirmRemove}
            isLoading={isProcessing}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
