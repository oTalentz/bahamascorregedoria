
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Activity, Clock, Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AuditLog } from '@/types/database';

interface AuditLogsTableProps {
  auditLogs: AuditLog[];
}

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<'ALL' | 'CREATE' | 'DELETE'>('ALL');

  // Filtrar logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = (
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id.includes(searchTerm) ||
      JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesFilter = filterAction === 'ALL' || log.action_type === filterAction;
    
    return matchesSearch && matchesFilter;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'DELETE':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Activity className="h-4 w-4 text-green-400" />;
      case 'DELETE':
        return <Eye className="h-4 w-4 text-red-400" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  if (auditLogs.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-800/80 to-slate-800/80 border-blue-700/70 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-700/50 p-4 rounded-full">
              <Activity className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Nenhum log encontrado
            </h3>
            <p className="text-blue-300 max-w-md">
              Quando ações forem realizadas no sistema, elas aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-800/80 to-slate-800/80 border-blue-700/70 backdrop-blur-sm shadow-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/80 to-slate-900/80 p-4 border-b border-blue-700/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <Activity className="h-5 w-5 text-amber-400" />
              <span>Logs de Auditoria</span>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {auditLogs.length} total
              </Badge>
            </h3>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
                <Input
                  placeholder="Buscar logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/70 border-blue-600/50 text-white placeholder-blue-300 focus:border-amber-400 w-64"
                />
              </div>
              
              {/* Filtros */}
              <div className="flex space-x-2">
                <Button
                  variant={filterAction === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('ALL')}
                  className="text-xs"
                >
                  Todos
                </Button>
                <Button
                  variant={filterAction === 'CREATE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('CREATE')}
                  className="text-xs"
                >
                  Criações
                </Button>
                <Button
                  variant={filterAction === 'DELETE' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('DELETE')}
                  className="text-xs"
                >
                  Remoções
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/70 border-b border-blue-700/50">
                <th className="text-left p-4 text-blue-200 font-medium">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4" />
                    <span>Ação</span>
                  </div>
                </th>
                <th className="text-left p-4 text-blue-200 font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Usuário</span>
                  </div>
                </th>
                <th className="text-left p-4 text-blue-200 font-medium">ID do Registro</th>
                <th className="text-left p-4 text-blue-200 font-medium">Detalhes</th>
                <th className="text-left p-4 text-blue-200 font-medium">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>Data/Hora</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr 
                  key={log.id}
                  className="border-b border-blue-700/30 hover:bg-blue-900/30 transition-colors duration-200"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      {getActionIcon(log.action_type)}
                      <Badge className={getActionBadgeColor(log.action_type)}>
                        {log.action_type === 'CREATE' ? 'Criação' : 'Remoção'}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-medium">
                      {log.user_name}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-300 font-mono text-sm bg-slate-700/70 px-2 py-1 rounded">
                      {log.record_id.substring(0, 8)}...
                    </span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-blue-200 text-sm">
                      {log.details.garrison && (
                        <div><strong>Guarnição:</strong> {log.details.garrison}</div>
                      )}
                      {log.details.officer_name && (
                        <div><strong>Policial:</strong> {log.details.officer_name}</div>
                      )}
                      {log.details.reason && (
                        <div><strong>Motivo:</strong> {log.details.reason}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-300 text-sm">
                      {formatDateTime(log.created_at)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé */}
        <div className="p-4 bg-slate-800/50 border-t border-blue-700/50">
          <div className="flex flex-wrap items-center justify-between text-sm text-blue-300">
            <span>
              {filteredLogs.length} de {auditLogs.length} logs exibidos
            </span>
            <span>
              Última atualização: {auditLogs.length > 0 ? formatDateTime(auditLogs[0].created_at) : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditLogsTable;
