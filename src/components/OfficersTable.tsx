
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Filter, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

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

interface OfficerStat {
  name: string;
  totalApplications: number;
  firstApplication: string;
  lastApplication: string;
  activityPeriod: number;
}

interface OfficersTableProps {
  infractions: Infraction[];
  onFilterByOfficer: (officerName: string) => void;
}

const OfficersTable: React.FC<OfficersTableProps> = ({ infractions, onFilterByOfficer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'total' | 'recent'>('total');

  // Calcular estatísticas dos policiais aplicadores
  const getOfficerStats = (): OfficerStat[] => {
    const officerMap = new Map<string, Infraction[]>();
    
    infractions.forEach(infraction => {
      if (!officerMap.has(infraction.registeredBy)) {
        officerMap.set(infraction.registeredBy, []);
      }
      officerMap.get(infraction.registeredBy)!.push(infraction);
    });

    const stats: OfficerStat[] = [];
    
    officerMap.forEach((infractionsList, officerName) => {
      const sortedDates = infractionsList
        .map(inf => new Date(inf.date.split('/').reverse().join('-')))
        .sort((a, b) => a.getTime() - b.getTime());
      
      const firstDate = sortedDates[0];
      const lastDate = sortedDates[sortedDates.length - 1];
      const activityPeriod = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
      
      stats.push({
        name: officerName,
        totalApplications: infractionsList.length,
        firstApplication: firstDate.toLocaleDateString('pt-BR'),
        lastApplication: lastDate.toLocaleDateString('pt-BR'),
        activityPeriod: activityPeriod || 1
      });
    });

    return stats;
  };

  const officerStats = getOfficerStats();

  // Filtrar e ordenar
  const filteredOfficers = officerStats
    .filter(officer => 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'total':
          return b.totalApplications - a.totalApplications;
        case 'recent':
          return new Date(b.lastApplication.split('/').reverse().join('-')).getTime() - 
                 new Date(a.lastApplication.split('/').reverse().join('-')).getTime();
        default:
          return 0;
      }
    });

  const getActivityBadgeColor = (total: number) => {
    if (total >= 10) return 'bg-red-500/20 text-red-300 border-red-500/30';
    if (total >= 5) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    return 'bg-green-500/20 text-green-300 border-green-500/30';
  };

  if (officerStats.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-blue-800/30 to-slate-800/30 border-blue-700/30 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-700/30 p-4 rounded-full">
              <User className="h-12 w-12 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Nenhum policial aplicador encontrado
            </h3>
            <p className="text-blue-300 max-w-md">
              Quando infrações forem registradas, os policiais que as aplicaram aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-800/30 to-slate-800/30 border-blue-700/30 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 p-4 border-b border-blue-700/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <User className="h-5 w-5 text-amber-400" />
              <span>Policiais Aplicadores</span>
              <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {officerStats.length} total
              </Badge>
            </h3>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-4 w-4" />
                <Input
                  placeholder="Buscar policial..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 w-64"
                />
              </div>
              
              {/* Ordenação */}
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === 'total' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('total')}
                  className="text-xs"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Total
                </Button>
                <Button
                  variant={sortBy === 'recent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('recent')}
                  className="text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Recente
                </Button>
                <Button
                  variant={sortBy === 'name' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('name')}
                  className="text-xs"
                >
                  Nome
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50 border-b border-blue-700/30">
                <th className="text-left p-4 text-blue-200 font-medium">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Nome do Policial</span>
                  </div>
                </th>
                <th className="text-left p-4 text-blue-200 font-medium">Total de Aplicações</th>
                <th className="text-left p-4 text-blue-200 font-medium">Primeira Aplicação</th>
                <th className="text-left p-4 text-blue-200 font-medium">Última Aplicação</th>
                <th className="text-left p-4 text-blue-200 font-medium">Período de Atividade</th>
                <th className="text-left p-4 text-blue-200 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredOfficers.map((officer, index) => (
                <tr 
                  key={officer.name}
                  className="border-b border-blue-700/20 hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <td className="p-4">
                    <span className="text-white font-medium">
                      {officer.name}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Badge className={getActivityBadgeColor(officer.totalApplications)}>
                        {officer.totalApplications}
                      </Badge>
                      {officer.totalApplications >= 10 && (
                        <span className="text-red-400 text-xs">Alto volume</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-300 text-sm">
                      {officer.firstApplication}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-300 text-sm">
                      {officer.lastApplication}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-300 text-sm">
                      {officer.activityPeriod} dias
                    </span>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFilterByOfficer(officer.name)}
                      className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                    >
                      <Filter className="h-3 w-3 mr-1" />
                      Ver Infrações
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rodapé com estatísticas */}
        <div className="p-4 bg-slate-800/30 border-t border-blue-700/30">
          <div className="flex flex-wrap items-center justify-between text-sm text-blue-300">
            <span>
              Total de {filteredOfficers.length} policiais aplicadores encontrados
            </span>
            {filteredOfficers.length > 0 && (
              <span>
                Policial mais ativo: {filteredOfficers[0]?.name} ({filteredOfficers[0]?.totalApplications} aplicações)
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OfficersTable;
