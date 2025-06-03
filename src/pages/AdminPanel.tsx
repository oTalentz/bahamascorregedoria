
import React, { useState } from 'react';
import { Shield, Users, Clock, CheckCircle, UserPlus, XCircle, UserX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useAuth } from '@/hooks/useAuth';
import { useDeletionRequests } from '@/hooks/useDeletionRequests';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import AccessRequestsTable from '@/components/AccessRequestsTable';
import RemoveUserDialog from '@/components/RemoveUserDialog';
import { Badge } from "@/components/ui/badge";

const AdminPanel = () => {
  const { user, signOut } = useAuth();
  const { 
    deletionRequests, 
    isLoading: requestsLoading, 
    approveDeletionRequest, 
    denyDeletionRequest,
    isProcessing 
  } = useDeletionRequests();
  const { 
    users, 
    isLoading: usersLoading, 
    removeUser, 
    updateUserRole,
    isProcessing: userProcessing 
  } = useUserManagement();
  const { 
    accessRequests, 
    isLoading: accessRequestsLoading, 
    processRequest,
    isProcessing: accessProcessing 
  } = useAccessRequests();

  const [activeTab, setActiveTab] = useState('access-requests');
  const [removeUserDialog, setRemoveUserDialog] = useState<{
    isOpen: boolean;
    user: { id: string; name: string; email: string } | null;
  }>({
    isOpen: false,
    user: null
  });

  const handleApprove = async (requestId: string) => {
    await approveDeletionRequest(requestId);
  };

  const handleDeny = async (requestId: string) => {
    await denyDeletionRequest(requestId);
  };

  const handleApproveAccess = async (requestId: string) => {
    if (!user?.name) return;
    processRequest({
      requestId,
      action: 'approved',
      adminName: user.name
    });
  };

  const handleDenyAccess = async (requestId: string) => {
    if (!user?.name) return;
    processRequest({
      requestId,
      action: 'denied',
      adminName: user.name
    });
  };

  const handleRemoveUserClick = (userToRemove: { id: string; name: string; email: string }) => {
    setRemoveUserDialog({
      isOpen: true,
      user: userToRemove
    });
  };

  const handleConfirmRemoveUser = async () => {
    if (!removeUserDialog.user) return;
    
    try {
      await removeUser(removeUserDialog.user.id);
      setRemoveUserDialog({ isOpen: false, user: null });
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
    }
  };

  const handleCloseRemoveDialog = () => {
    setRemoveUserDialog({ isOpen: false, user: null });
  };

  const handleLogout = async () => {
    await signOut();
  };

  const pendingDeletionRequests = deletionRequests.filter(req => req.status === 'pending');
  const pendingAccessRequests = accessRequests.filter(req => req.status === 'pending');

  // Verificar se o usuário atual é admin
  const isCurrentUserAdmin = user?.role === 'admin';

  if (!isCurrentUserAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-red-800/95 border-red-600/70 max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-red-200">Apenas administradores podem acessar este painel.</p>
            <Button onClick={handleLogout} className="mt-4 bg-red-600 hover:bg-red-700">
              Voltar ao Login
            </Button>
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
                <Shield className="h-10 w-10 text-blue-900" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  PAINEL ADMINISTRATIVO
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  Bem-vindo, {user?.name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-blue-900"
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <Card className="bg-gradient-to-br from-emerald-800/95 to-slate-800/95 border-emerald-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-emerald-100">
                Solicitações de Acesso
              </CardTitle>
              <UserPlus className="h-5 w-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingAccessRequests.length}</div>
              <p className="text-sm text-emerald-200 mt-1">
                aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-800/95 to-slate-800/95 border-orange-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-orange-100">
                Solicitações de Remoção
              </CardTitle>
              <Clock className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{pendingDeletionRequests.length}</div>
              <p className="text-sm text-orange-200 mt-1">
                aguardando aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-800/95 to-slate-800/95 border-green-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-green-100">
                Total Processado
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {accessRequests.filter(req => req.status !== 'pending').length + 
                 deletionRequests.filter(req => req.status !== 'pending').length}
              </div>
              <p className="text-sm text-green-200 mt-1">
                aprovadas/negadas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-800/95 to-slate-800/95 border-purple-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-purple-100">
                Usuários Ativos
              </CardTitle>
              <Users className="h-5 w-5 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{users.length}</div>
              <p className="text-sm text-purple-200 mt-1">
                membros cadastrados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Abas principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/95 border-blue-600/60 mb-8 h-14 shadow-xl">
            <TabsTrigger 
              value="access-requests" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 py-3 px-6 text-base font-medium"
            >
              <UserPlus className="h-5 w-5 mr-3" />
              Solicitações de Acesso ({pendingAccessRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="deletion-requests" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 py-3 px-6 text-base font-medium"
            >
              <Clock className="h-5 w-5 mr-3" />
              Remoções ({pendingDeletionRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 py-3 px-6 text-base font-medium"
            >
              <Users className="h-5 w-5 mr-3" />
              Usuários ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="access-requests" className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-800/85 to-slate-800/85 border-blue-600/70 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">Gerenciar Solicitações de Acesso</CardTitle>
              </CardHeader>
              <CardContent>
                <AccessRequestsTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deletion-requests" className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-800/85 to-slate-800/85 border-blue-600/70 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">Solicitações de Remoção Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                {requestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-blue-200">Carregando solicitações...</p>
                  </div>
                ) : pendingDeletionRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                    <p className="text-blue-200 text-lg">Nenhuma solicitação pendente</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-600/50">
                        <TableHead className="text-blue-200">Solicitante</TableHead>
                        <TableHead className="text-blue-200">Motivo</TableHead>
                        <TableHead className="text-blue-200">Data</TableHead>
                        <TableHead className="text-blue-200">Expira em</TableHead>
                        <TableHead className="text-blue-200">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingDeletionRequests.map((request) => (
                        <TableRow key={request.id} className="border-blue-600/30 hover:bg-blue-700/30">
                          <TableCell className="text-white">{request.requested_by_name}</TableCell>
                          <TableCell className="text-blue-200 max-w-xs truncate">
                            {request.deletion_reason}
                          </TableCell>
                          <TableCell className="text-blue-200">
                            {new Date(request.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell className="text-blue-200">
                            {new Date(request.expires_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeny(request.id)}
                                disabled={isProcessing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Negar
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-8">
            <Card className="bg-gradient-to-br from-blue-800/85 to-slate-800/85 border-blue-600/70 backdrop-blur-sm shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl text-white">Gerenciamento de Usuários</CardTitle>
                <p className="text-blue-200 text-sm">
                  {users.length} usuários cadastrados. Clique em "Remover" para excluir um usuário do sistema.
                </p>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-blue-200">Carregando usuários...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                    <p className="text-blue-200 text-lg">Nenhum usuário encontrado</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-600/50">
                        <TableHead className="text-blue-200">Nome</TableHead>
                        <TableHead className="text-blue-200">Email</TableHead>
                        <TableHead className="text-blue-200">Role</TableHead>
                        <TableHead className="text-blue-200">Criado em</TableHead>
                        <TableHead className="text-blue-200">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.filter(u => u.id !== user?.id).map((userItem) => (
                        <TableRow key={userItem.id} className="border-blue-600/30 hover:bg-blue-700/30">
                          <TableCell className="text-white font-medium">{userItem.name}</TableCell>
                          <TableCell className="text-blue-200">{userItem.email}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={userItem.role === 'admin' ? 'default' : 'secondary'}
                              className={userItem.role === 'admin' ? 'bg-amber-500 text-blue-900' : 'bg-blue-500 text-white'}
                            >
                              {userItem.role === 'admin' ? 'Admin' : 'Membro'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-blue-200">
                            {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRemoveUserClick({
                                id: userItem.id,
                                name: userItem.name,
                                email: userItem.email
                              })}
                              disabled={userProcessing}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <RemoveUserDialog
        isOpen={removeUserDialog.isOpen}
        onClose={handleCloseRemoveDialog}
        onConfirm={handleConfirmRemoveUser}
        userName={removeUserDialog.user?.name || ''}
        userEmail={removeUserDialog.user?.email || ''}
        isLoading={userProcessing}
      />
    </div>
  );
};

export default AdminPanel;
