
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User, Shield, AlertTriangle, FileText } from 'lucide-react';

interface Infraction {
  id: string;
  garrison: string;
  officerId: string;
  officerName: string;
  punishmentType: string;
  evidence: string;
  date: string;
  severity: 'Leve' | 'Média' | 'Grave';
}

interface InfractionTableProps {
  infractions: Infraction[];
}

const InfractionTable: React.FC<InfractionTableProps> = ({ infractions }) => {
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
      'BOPE': 'bg-red-500/20 text-red-300 border-red-500/30',
      'COE': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'GATE': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'PRF': 'bg-green-500/20 text-green-300 border-green-500/30',
      'CIVIL': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'ROTAM': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'CHOQUE': 'bg-pink-500/20 text-pink-300 border-pink-500/30'
    };
    return colors[garrison] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  if (infractions.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-800/30 to-slate-800/30 border-blue-700/30 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-700/30 p-4 rounded-full">
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
    <Card className="bg-gradient-to-br from-blue-800/30 to-slate-800/30 border-blue-700/30 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Header da Tabela */}
        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 p-4 border-b border-blue-700/30">
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
              <tr className="bg-slate-800/50 border-b border-blue-700/30">
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
                    <Calendar className="h-4 w-4" />
                    <span>Data</span>
                  </div>
                </th>
                <th className="text-left p-4 text-blue-200 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {infractions.map((infraction, index) => (
                <tr 
                  key={infraction.id}
                  className="border-b border-blue-700/20 hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <td className="p-4">
                    <Badge className={getGarrisonColor(infraction.garrison)}>
                      {infraction.garrison}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <span className="text-white font-mono text-sm bg-slate-700/50 px-2 py-1 rounded">
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
                        <AlertTriangle className="h-4 w-4 text-red-400" title="Policial com múltiplas infrações" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda */}
        <div className="p-4 bg-slate-800/30 border-t border-blue-700/30">
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
  );
};

export default InfractionTable;
