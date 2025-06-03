
import React, { useState } from 'react';
import { Search, Plus, Shield, AlertTriangle, FileText, Calendar, User, Users, Activity, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfractionForm from '@/components/InfractionForm';
import InfractionTable from '@/components/InfractionTable';
import OfficersTable from '@/components/OfficersTable';
import AuditLogsTable from '@/components/AuditLogsTable';
import { useInfractions } from '@/hooks/useInfractions';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';

export interface Infraction {
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

const Index = () => {
  const { 
    infractions, 
    isLoading, 
    error, 
    addInfraction, 
    deleteInfraction,
    isCreating,
    isDeleting,
    statistics,
    auditLogs,
    userRole
  } = useInfractions();
  const { user, signOut, refreshUserRole } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('infractions');
  const [officerFilter, setOfficerFilter] = useState('');

  const handleAddInfraction = (infraction: Omit<Infraction, 'id' | 'date'>) => {
    addInfraction(infraction);
    setShowForm(false);
  };

  const handleDeleteInfraction = (infractionId: string, deletedBy: string, reason: string) => {
    deleteInfraction(infractionId, deletedBy, reason);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleRefreshRole = async () => {
    await refreshUserRole();
    toast({
      title: "Role atualizada",
      description: "As permissões do usuário foram recarregadas.",
    });
  };

  // Filtrar infrações
  const filteredInfractions = infractions.filter(infraction => {
    const matchesSearch = (
      infraction.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraction.officerId.includes(searchTerm) ||
      infraction.garrison.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraction.punishmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infraction.registeredBy.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const matchesOfficerFilter = officerFilter === '' || 
      infraction.registeredBy.toLowerCase().includes(officerFilter.toLowerCase());
    
    return matchesSearch && matchesOfficerFilter;
  });

  // Função para filtrar por policial aplicador
  const handleFilterByOfficer = (officerName: string) => {
    setOfficerFilter(officerName);
    setActiveTab('infractions');
    setSearchTerm('');
    toast({
      title: "Filtro aplicado",
      description: `Mostrando infrações aplicadas por ${officerName}`,
    });
  };

  // Função para limpar filtros
  const clearFilters = () => {
    setOfficerFilter('');
    setSearchTerm('');
  };

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400 mx-auto"></div>
          <p className="text-white mt-4 text-lg">Carregando dados do banco...</p>
        </div>
      </div>
    );
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <Card className="bg-red-800/80 border-red-600/70">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Erro de Conexão</h2>
            <p className="text-red-200">
              Erro ao conectar com o banco de dados. Verifique a configuração do Supabase.
            </p>
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
                  CORREGEDORIA POLICIAL
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  Sistema de Acompanhamento de Infrações - Polícia das Bahamas
                  <span className="block text-green-200 text-sm mt-1">
                    ✅ Conectado ao Supabase - {user?.name || user?.email} ({userRole === 'admin' ? 'Administrador' : 'Membro'})
                  </span>
                  <span className="block text-blue-100 text-xs mt-1">
                    DEBUG: Role atual = {userRole} | User ID = {user?.id}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button 
                onClick={handleRefreshRole}
                variant="outline"
                size="sm"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-blue-900"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar Role
              </Button>
              {userRole === 'admin' && (
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold shadow-lg"
                >
                  <User className="h-5 w-5 mr-2" />
                  Painel Admin
                </Button>
              )}
              <Button 
                onClick={() => setShowForm(true)}
                disabled={isCreating}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 px-6 py-3"
              >
                <Plus className="h-6 w-6 mr-2" />
                {isCreating ? 'Salvando...' : 'Nova Infração'}
              </Button>
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
        {/* Estatísticas com dados reais do banco */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Card className="bg-gradient-to-br from-blue-800/95 to-slate-800/95 border-blue-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-blue-100">
                Total de Infrações
              </CardTitle>
              <FileText className="h-5 w-5 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{statistics.totalInfractions}</div>
              <p className="text-sm text-blue-200 mt-1">
                registradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-800/95 to-slate-800/95 border-red-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-red-100">
                Infrações Graves
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{statistics.graveInfractions}</div>
              <p className="text-sm text-red-200 mt-1">
                requerem atenção especial
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-800/95 to-slate-800/95 border-purple-600/70 backdrop-blur-sm shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-medium text-purple-100">
                Policiais Aplicadores
              </CardTitle>
              <Users className="h-5 w-5 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{statistics.uniqueOfficers}</div>
              <p className="text-sm text-purple-200 mt-1">
                aplicadores ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/95 border-blue-600/60 mb-8 h-14 shadow-xl">
            <TabsTrigger 
              value="infractions" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-amber-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <FileText className="h-5 w-5 mr-3" />
              Infrações ({infractions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="officers" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-amber-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <Users className="h-5 w-5 mr-3" />
              Policiais Aplicadores ({statistics.uniqueOfficers})
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="text-blue-100 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/60 data-[state=active]:to-yellow-500/60 data-[state=active]:text-amber-50 data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-amber-400/60 py-3 px-6 text-base font-medium transition-all duration-200"
            >
              <Activity className="h-5 w-5 mr-3" />
              Logs de Auditoria ({auditLogs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infractions" className="space-y-8">
            {/* Barra de Pesquisa */}
            <Card className="bg-gradient-to-br from-blue-800/85 to-slate-800/85 border-blue-600/70 backdrop-blur-sm shadow-2xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200 h-6 w-6" />
                    <Input
                      placeholder="Pesquisar por nome, ID, guarnição, tipo de punição ou registrado por..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200 focus:border-amber-400 focus:ring-amber-400/60 h-12 text-base shadow-lg"
                    />
                  </div>
                  
                  {/* Filtros ativos */}
                  {officerFilter && (
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="bg-amber-500/40 text-amber-100 border-amber-400/60 px-4 py-2 shadow-lg">
                        Aplicador: {officerFilter}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-blue-200 hover:text-white hover:bg-blue-700/60 h-8 px-4"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Infrações */}
            <InfractionTable 
              infractions={filteredInfractions} 
              onDeleteInfraction={handleDeleteInfraction}
            />
          </TabsContent>

          <TabsContent value="officers" className="space-y-8">
            {/* Tabela de Policiais Aplicadores */}
            <OfficersTable 
              infractions={infractions} 
              onFilterByOfficer={handleFilterByOfficer}
            />
          </TabsContent>

          <TabsContent value="logs" className="space-y-8">
            {/* Tabela de Logs de Auditoria */}
            <AuditLogsTable auditLogs={auditLogs} />
          </TabsContent>
        </Tabs>

        {/* Formulário Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <div className="bg-gradient-to-br from-slate-800/95 to-blue-900/95 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-700/40">
              <InfractionForm 
                onSubmit={handleAddInfraction} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          </div>
        )}

        {/* Indicador de carregamento para remoção */}
        {isDeleting && (
          <div className="fixed bottom-4 right-4 bg-red-800/90 border border-red-600 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3 text-white">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
              <span>Removendo infração...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
