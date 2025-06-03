
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Shield, FileText, AlertTriangle, User, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SupabaseService } from '@/services/supabaseService';

interface InfractionFormProps {
  onSubmit: (infraction: {
    garrison: string;
    officerId: string;
    officerName: string;
    punishmentType: string;
    evidence: string;
    severity: 'Leve' | 'Média' | 'Grave';
    registeredBy: string;
  }) => void;
  onCancel: () => void;
}

const PUNISHMENT_TYPES = [
  'Advertência Verbal',
  'Advertência Escrita',
  'Repreensão',
  'Suspensão de 1 dia',
  'Suspensão de 3 dias',
  'Suspensão de 7 dias',
  'Suspensão de 15 dias',
  'Suspensão de 30 dias',
  'Demissão',
  'Punição'
];

const InfractionForm: React.FC<InfractionFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    garrison: '',
    officerId: '',
    officerName: '',
    punishmentType: '',
    evidence: '',
    severity: 'Leve' as 'Leve' | 'Média' | 'Grave',
    registeredBy: ''
  });

  // Buscar guarnições disponíveis
  const { data: garrisons = [] } = useQuery({
    queryKey: ['garrisons'],
    queryFn: SupabaseService.getGarrisons,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.garrison || !formData.officerId || !formData.officerName || 
        !formData.punishmentType || !formData.evidence || !formData.registeredBy) {
      return;
    }

    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

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

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-slate-800/95 to-blue-900/95 border-blue-700/40">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-2 rounded-lg">
              <FileText className="h-6 w-6 text-blue-900" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                Registrar Nova Infração
              </CardTitle>
              <p className="text-blue-200 text-sm mt-1">
                Preencha todos os campos obrigatórios
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel}
            className="text-blue-300 hover:text-white hover:bg-blue-600/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de Guarnição */}
          <div className="space-y-2">
            <Label htmlFor="garrison" className="text-blue-200 font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Guarnição</span>
            </Label>
            <Select value={formData.garrison} onValueChange={(value) => handleInputChange('garrison', value)}>
              <SelectTrigger className="bg-slate-700/50 border-blue-600/30 text-white focus:border-amber-400">
                <SelectValue placeholder="Selecione a guarnição" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-blue-600/30">
                {garrisons.map((garrison) => (
                  <SelectItem key={garrison.id} value={garrison.name} className="text-white hover:bg-blue-700/50">
                    {garrison.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ID e Nome do Policial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officerId" className="text-blue-200 font-medium">
                ID do Policial
              </Label>
              <Input
                id="officerId"
                value={formData.officerId}
                onChange={(e) => handleInputChange('officerId', e.target.value)}
                placeholder="Ex: 12345"
                className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="officerName" className="text-blue-200 font-medium flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Nome do Policial</span>
              </Label>
              <Input
                id="officerName"
                value={formData.officerName}
                onChange={(e) => handleInputChange('officerName', e.target.value)}
                placeholder="Ex: João Silva"
                className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Tipo de Punição */}
          <div className="space-y-2">
            <Label htmlFor="punishmentType" className="text-blue-200 font-medium">
              Tipo de Punição
            </Label>
            <Select value={formData.punishmentType} onValueChange={(value) => handleInputChange('punishmentType', value)}>
              <SelectTrigger className="bg-slate-700/50 border-blue-600/30 text-white focus:border-amber-400">
                <SelectValue placeholder="Selecione o tipo de punição" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-blue-600/30 max-h-60">
                {PUNISHMENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type} className="text-white hover:bg-blue-700/50">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Severidade */}
          <div className="space-y-2">
            <Label htmlFor="severity" className="text-blue-200 font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Severidade</span>
            </Label>
            <div className="flex space-x-3">
              {(['Leve', 'Média', 'Grave'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleInputChange('severity', level)}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                    formData.severity === level
                      ? getSeverityColor(level)
                      : 'bg-slate-700/30 border-slate-600/50 text-slate-300 hover:bg-slate-600/50'
                  }`}
                >
                  <Badge className={formData.severity === level ? getSeverityColor(level) : 'bg-slate-600/50 text-slate-300'}>
                    {level}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {/* Evidências */}
          <div className="space-y-2">
            <Label htmlFor="evidence" className="text-blue-200 font-medium">
              Evidências / Descrição
            </Label>
            <Textarea
              id="evidence"
              value={formData.evidence}
              onChange={(e) => handleInputChange('evidence', e.target.value)}
              placeholder="Descreva a infração e as evidências..."
              rows={4}
              className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 resize-none"
              required
            />
          </div>

          {/* Registrado Por */}
          <div className="space-y-2">
            <Label htmlFor="registeredBy" className="text-blue-200 font-medium">
              Registrado Por
            </Label>
            <Input
              id="registeredBy"
              value={formData.registeredBy}
              onChange={(e) => handleInputChange('registeredBy', e.target.value)}
              placeholder="Ex: Inspetor Carlos Santos"
              className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400"
              required
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4 border-t border-blue-700/30">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-blue-600/30 text-blue-200 hover:bg-blue-700/20 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Registrar Infração
            </Button>
          </div>
        </form>

        {/* Informações adicionais */}
        <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-blue-200 text-sm">
              <p className="font-medium mb-1">Informações importantes:</p>
              <ul className="space-y-1 text-blue-300">
                <li>• A infração será registrada com data e hora atuais</li>
                <li>• Infrações graves requerem evidências detalhadas</li>
                <li>• O registro será auditado e não pode ser alterado</li>
                <li>• Todos os campos são obrigatórios</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InfractionForm;
