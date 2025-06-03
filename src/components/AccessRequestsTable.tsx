
import React from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAccessRequests } from '@/hooks/useAccessRequests';
import { useAuth } from '@/hooks/useAuth';

const AccessRequestsTable = () => {
  const { user } = useAuth();
  const { accessRequests, isLoading, processRequest, isProcessing } = useAccessRequests();

  const handleApprove = (requestId: string) => {
    if (!user?.name) return;
    processRequest({
      requestId,
      action: 'approved',
      adminName: user.name
    });
  };

  const handleDeny = (requestId: string) => {
    if (!user?.name) return;
    processRequest({
      requestId,
      action: 'denied',
      adminName: user.name
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-orange-500 text-white">Pendente</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500 text-white">Aprovada</Badge>;
      case 'denied':
        return <Badge variant="destructive">Negada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = accessRequests.filter(req => req.status === 'pending');
  const processedRequests = accessRequests.filter(req => req.status !== 'pending');

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4"></div>
        <p className="text-blue-200">Carregando solicitações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Solicitações Pendentes */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">
            Solicitações Pendentes ({pendingRequests.length})
          </h3>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-8 bg-slate-700/95 rounded-lg">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <p className="text-blue-200 text-lg">Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div className="bg-slate-700/95 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-600/50">
                  <TableHead className="text-blue-200">Nome</TableHead>
                  <TableHead className="text-blue-200">Email</TableHead>
                  <TableHead className="text-blue-200">Motivo</TableHead>
                  <TableHead className="text-blue-200">Data</TableHead>
                  <TableHead className="text-blue-200">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id} className="border-blue-600/30 hover:bg-blue-700/30">
                    <TableCell className="text-white font-medium">{request.name}</TableCell>
                    <TableCell className="text-blue-200">{request.email}</TableCell>
                    <TableCell className="text-blue-200 max-w-xs">
                      {request.reason ? (
                        <span className="truncate block" title={request.reason}>
                          {request.reason}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Nenhum motivo informado</span>
                      )}
                    </TableCell>
                    <TableCell className="text-blue-200">
                      {new Date(request.requested_at).toLocaleDateString('pt-BR')}
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
          </div>
        )}
      </div>

      {/* Solicitações Processadas */}
      {processedRequests.length > 0 && (
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <User className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">
              Histórico de Solicitações ({processedRequests.length})
            </h3>
          </div>

          <div className="bg-slate-700/95 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-600/50">
                  <TableHead className="text-blue-200">Nome</TableHead>
                  <TableHead className="text-blue-200">Email</TableHead>
                  <TableHead className="text-blue-200">Status</TableHead>
                  <TableHead className="text-blue-200">Processado por</TableHead>
                  <TableHead className="text-blue-200">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedRequests.map((request) => (
                  <TableRow key={request.id} className="border-blue-600/30 hover:bg-blue-700/30">
                    <TableCell className="text-white font-medium">{request.name}</TableCell>
                    <TableCell className="text-blue-200">{request.email}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-blue-200">
                      {request.processed_by_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-blue-200">
                      {request.processed_at 
                        ? new Date(request.processed_at).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessRequestsTable;
