
import React, { useState, useEffect } from 'react';
import { Search, Plus, Shield, AlertTriangle, FileText, Calendar, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InfractionForm from '@/components/InfractionForm';
import InfractionTable from '@/components/InfractionTable';
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
    
    setInfractions(prev => [newInfraction, ...prev]);
    setShowForm(false);
    
    toast({
      title: "Infração registrada",
      description: `Infração de ${infraction.officerName} foi registrada com sucesso.`,
    });
  };

  const filteredInfractions = infractions.filter(infraction =>
    infraction.officerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    infraction.officerId.includes(searchTerm) ||
    infraction.garrison.toLowerCase().includes(searchTerm.toLowerCase()) ||
    infraction.punishmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    infraction.registeredBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalInfractions = infractions.length;
  const uniqueOfficers = new Set(infractions.map(i => i.officerId)).size;
  const graveInfractions = infractions.filter(i => i.severity === 'Grave').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 shadow-2xl border-b border-blue-800/30">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-3 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-blue-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  CORREGEDORIA POLICIAL
                </h1>
                <p className="text-blue-200 mt-1">
                  Sistema de Acompanhamento de Infrações - Polícia das Bahamas
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Infração
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-800/50 to-slate-800/50 border-blue-700/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">
                Total de Infrações
              </CardTitle>
              <FileText className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalInfractions}</div>
              <p className="text-xs text-blue-300">
                registradas no sistema
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-800/50 to-slate-800/50 border-blue-700/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">
                Policiais Envolvidos
              </CardTitle>
              <User className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{uniqueOfficers}</div>
              <p className="text-xs text-blue-300">
                policiais únicos
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-800/50 to-slate-800/50 border-red-700/30 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-200">
                Infrações Graves
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{graveInfractions}</div>
              <p className="text-xs text-red-300">
                requerem atenção especial
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Pesquisa */}
        <Card className="bg-gradient-to-br from-blue-800/30 to-slate-800/30 border-blue-700/30 backdrop-blur-sm mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 h-5 w-5" />
              <Input
                placeholder="Pesquisar por nome, ID, guarnição, tipo de punição ou registrado por..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 focus:ring-amber-400/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Infrações */}
        <InfractionTable infractions={filteredInfractions} />

        {/* Formulário Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-slate-800 to-blue-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-700/30">
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
