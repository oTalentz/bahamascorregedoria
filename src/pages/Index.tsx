
import React, { useState, useEffect } from 'react';
import { Search, Plus, Shield, AlertTriangle, FileText, Calendar, User, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfractionForm from '@/components/InfractionForm';
import InfractionTable from '@/components/InfractionTable';
import OfficersTable from '@/components/OfficersTable';
import { toast } from "@/hooks/use-toast";

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
  const [infractions, setInfractions] = useState<Infraction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('infractions');
  const [officerFilter, setOfficerFilter] = useState('');

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedInfractions = localStorage.getItem('policeInfractions');
    if (savedInfractions) {
      setInfractions(JSON.parse(savedInfractions));
    }
  }, []);

  // Salvar dados no localStorage sempre que infrações mudarem
  useEffect(() => {
    localStorage.setItem('policeInfractions', JSON.stringify(infractions));
  }, [infractions]);

  const addInfraction = (infraction: Omit<Infraction, 'id' | 'date'>) => {
    const newInfraction: Infraction = {
      ...infraction,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR')
    };
    
    // Ordenar por data (mais recentes primeiro)
    setInfractions(prev => [newInfraction, ...prev]);
    setShowForm(false);
    
    toast({
      title: "Infração registrada",
      description: `Infração de ${infraction.officerName} foi registrada com sucesso.`,
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

  // Estatísticas
  const totalInfractions = infractions.length;
  const graveInfractions = infractions.filter(i => i.severity === 'Grave').length;

  // Estatísticas dos policiais aplicadores
  const uniqueOfficers = new Set(infractions.map(i => i.registeredBy)).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-800 shadow-xl border-b border-blue-200">
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
                <p className="text-blue-100 mt-2 text-lg font-medium">
                  Sistema de Acompanhamento de Infrações - Polícia das Bahamas
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105 px-8 py-4 text-base"
            >
              <Plus className="h-6 w-6 mr-3" />
              Nova Infração
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-10">
        {/* Estatísticas Atualizadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <Card className="bg-white/90 border-2 border-blue-200 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-slate-700">
                Total de Infrações
              </CardTitle>
              <FileText className="h-6 w-6 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-800 mb-2">{totalInfractions}</div>
              <p className="text-base text-slate-600 font-medium">
                registradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-2 border-red-200 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-slate-700">
                Infrações Graves
              </CardTitle>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-700 mb-2">{graveInfractions}</div>
              <p className="text-base text-slate-600 font-medium">
                requerem atenção especial
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/90 border-2 border-purple-200 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-bold text-slate-700">
                Policiais Aplicadores
              </CardTitle>
              <Users className="h-6 w-6 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-700 mb-2">{uniqueOfficers}</div>
              <p className="text-base text-slate-600 font-medium">
                aplicadores ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sistema de Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 border-2 border-slate-200 mb-8 h-16 shadow-md">
            <TabsTrigger 
              value="infractions" 
              className="text-slate-700 font-semibold text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-blue-300 py-4 px-8 transition-all duration-300 hover:bg-blue-50"
            >
              <FileText className="h-5 w-5 mr-3" />
              Infrações ({infractions.length})
            </TabsTrigger>
            <TabsTrigger 
              value="officers" 
              className="text-slate-700 font-semibold text-base data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-700 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:border-2 data-[state=active]:border-purple-300 py-4 px-8 transition-all duration-300 hover:bg-purple-50"
            >
              <Users className="h-5 w-5 mr-3" />
              Policiais Aplicadores ({uniqueOfficers})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="infractions" className="space-y-8">
            {/* Barra de Pesquisa com filtros */}
            <Card className="bg-white/90 border-2 border-slate-200 shadow-lg backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 h-6 w-6" />
                    <Input
                      placeholder="Pesquisar por nome, ID, guarnição, tipo de punição ou registrado por..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 bg-white/80 border-2 border-slate-300 text-slate-800 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/30 h-14 text-base font-medium shadow-sm"
                    />
                  </div>
                  
                  {/* Filtros ativos */}
                  {officerFilter && (
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-2 border-amber-300 px-4 py-2 text-sm font-semibold">
                        Aplicador: {officerFilter}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 h-10 px-4 font-medium"
                      >
                        Limpar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Infrações */}
            <InfractionTable infractions={filteredInfractions} />
          </TabsContent>

          <TabsContent value="officers" className="space-y-8">
            {/* Tabela de Policiais Aplicadores */}
            <OfficersTable 
              infractions={infractions} 
              onFilterByOfficer={handleFilterByOfficer}
            />
          </TabsContent>
        </Tabs>

        {/* Formulário Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200">
              <InfractionForm 
                onSubmit={addInfraction} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
