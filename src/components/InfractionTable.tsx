
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Shield, AlertTriangle, FileText, UserCheck, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DeleteInfractionDialog from './DeleteInfractionDialog';

interface Infraction {
  id: string;
  garrison: string;
  officerId: string;
  officerName: string;
  punishmentType: string;
  evidence: string;
  date: string;
  severity: 'Leve' | 'Média' | 'Grave';
  registeredBy: string;
}

interface InfractionTableProps {
  infractions: Infraction[];
  onDeleteInfraction?: (infractionId: string, deletedBy: string, reason: string) => void;
}

const InfractionTable: React.FC<InfractionTableProps> = ({ infractions, onDeleteInfraction }) => {
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; officerName: string } | null>(null);

  // Função para contar infrações por policial
  const getInfractionCount = (officerId: string) => {
    return infractions.filter(infraction => infraction.officerId === officerId).length;
  };

  // Função para determinar a cor da severidade
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Leve':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Média':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Grave':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  // Função para determinar a cor da guarnição
  const getGarrisonColor = (garrison: string) => {
    const colors: { [key: string]: string } = {
      'CORE': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'DIP': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'LEGIAO': 'bg-red-500/20 text-red-300 border-red-500/30',
      'SWAT': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'BPDS': 'bg-green-500/20 text-green-300 border-green-500/30',
      'BPDN': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'ROCAM': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'SPEED': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'SOE': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    };
    return colors[garrison] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const handleDeleteClick = (infraction: Infraction) => {
    setDeleteDialog({ id: infraction.id, officerName: infraction.officerName });
  };

  const handleDeleteConfirm = (infractionId: string, deletedBy: string, reason: string) => {
    if (onDeleteInfraction) {
      onDeleteInfraction(infractionId, deletedBy, reason);
    }
    setDeleteDialog(null);
  };

  if (infractions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-800/80 to-slate-800/80 border-blue-700/70 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-700/50 p-4 rounded-full">
              <FileText className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Nenhuma infração registrada
            </h3>
            <p className="text-blue-300 max-w-md">
              Quando infrações forem registradas, elas aparecerão aqui organizadas por data.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-800/80 to-slate-800/80 border-blue-700/70 backdrop-blur-sm shadow-2xl">
        <CardContent className="p-0">
          {/* Header da Tabela */}
          <div className="bg-gradient-to-r from-blue-900/80 to-slate-900/80 p-4 border-b border-blue-700/50">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Registro de Infrações</span>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {infractions.length} total
              </Badge>
            </h3>
          </div>

          {/* Tabela Responsiva */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/70 border-b border-blue-700/50">
                  <th className="text-left p-4 text-blue-200 font-medium">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Guarnição</span>
                    </div>
                  </th>
                  <th className="text-left p-4 text-blue-200 font-medium">ID</th>
                  <th className="text-left p-4 text-blue-200 font-medium">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Nome</span>
                    </div>
                  </th>
                  <th className="text-left p-4 text-blue-200 font-medium">Punição</th>
                  <th className="text-left p-4 text-blue-200 font-medium">Gravidade</th>
                  <th className="text-left p-4 text-blue-200 font-medium">Evidências</th>
                  <th className="text-left p-4 text-blue-200 font-medium">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4" />
                      <span>Registrado Por</span>
                    </div>
                  </th>
                  <th className="text-left p-4 text-blue-200 font-medium">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Data</span>
                    </div>
                  </th>
                  <th className="text-left p-4 text-blue-200 font-medium">Total</th>
                  {onDeleteInfraction && (
                    <th className="text-left p-4 text-blue-200 font-medium">Ações</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {infractions.map((infraction, index) => (
                  <tr 
                    key={infraction.id}
                    className="border-b border-blue-700/30 hover:bg-blue-900/30 transition-colors duration-200"
                  >
                    <td className="p-4">
                      <Badge className={getGarrisonColor(infraction.garrison)}>
                        {infraction.garrison}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-mono text-sm bg-slate-700/70 px-2 py-1 rounded">
                        {infraction.officerId}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium">
                        {infraction.officerName}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-blue-200 text-sm">
                        {infraction.punishmentType}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={getSeverityColor(infraction.severity)}>
                        {infraction.severity}
                      </Badge>
                    </td>
                    <td className="p-4 max-w-xs">
                      <div className="text-blue-200 text-sm truncate" title={infraction.evidence}>
                        {infraction.evidence}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-blue-300 text-sm">
                        {infraction.registeredBy}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-blue-300 text-sm">
                        {infraction.date}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className="border-amber-500/30 text-amber-300 bg-amber-500/10"
                        >
                          {getInfractionCount(infraction.officerId)}
                        </Badge>
                        {getInfractionCount(infraction.officerId) >= 3 && (
                          <div title="Policial com múltiplas infrações">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    {onDeleteInfraction && (
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(infraction)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          title="Remover infração"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legenda */}
          <div className="p-4 bg-slate-800/50 border-t border-blue-700/50">
            <div className="flex flex-wrap items-center justify-between text-sm">
              <div className="flex items-center space-x-4 text-blue-300">
                <span>Legenda de Gravidade:</span>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Leve</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Média</Badge>
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Grave</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-blue-300 mt-2 md:mt-0">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>3+ infrações = Atenção especial</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Remoção */}
      {deleteDialog && (
        <DeleteInfractionDialog
          infractionId={deleteDialog.id}
          officerName={deleteDialog.officerName}
          onClose={() => setDeleteDialog(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </>
  );
};

export default InfractionTable;
