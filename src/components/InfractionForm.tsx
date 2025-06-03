
import React, { useState } from 'react';
import { X, Shield, User, FileText, AlertTriangle, UserCheck } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInfractions } from '@/hooks/useInfractions';

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

const InfractionForm: React.FC<InfractionFormProps> = ({ onSubmit, onCancel }) => {
  const { garrisons } = useInfractions();
  const [formData, setFormData] = useState({
    garrison: '',
    officerId: '',
    officerName: '',
    punishmentType: '',
    evidence: '',
    severity: 'Leve' as 'Leve' | 'Média' | 'Grave',
    registeredBy: ''
  });

  const punishmentTypes = [
    'Observação',
    'Aviso 1',
    'Aviso 2',
    'Aviso 3',
    'Advertência',
    'Exoneração'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.garrison && formData.officerId && formData.officerName && formData.punishmentType && formData.evidence && formData.registeredBy) {
      onSubmit(formData);
      setFormData({
        garrison: '',
        officerId: '',
        officerName: '',
        punishmentType: '',
        evidence: '',
        severity: 'Leve',
        registeredBy: ''
      });
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-blue-700/30">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-2 rounded-lg">
            <FileText className="h-5 w-5 text-blue-900" />
          </div>
          <h2 className="text-2xl font-bold text-white">Registrar Nova Infração</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="text-blue-300 hover:text-white hover:bg-red-600/20"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guarnição - agora dinâmica do banco */}
          <div className="space-y-2">
            <Label htmlFor="garrison" className="text-blue-200 font-medium flex items-center space-x-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <span>Guarnição</span>
            </Label>
            <Select value={formData.garrison} onValueChange={(value) => setFormData({...formData, garrison: value})}>
              <SelectTrigger className="bg-slate-700/50 border-blue-600/30 text-white focus:border-amber-400">
                <SelectValue placeholder="Selecione a guarnição" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-blue-600/30">
                {garrisons.map(garrison => (
                  <SelectItem key={garrison.id} value={garrison.name} className="text-white hover:bg-blue-700/50">
                    {garrison.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ID do Policial */}
          <div className="space-y-2">
            <Label htmlFor="officerId" className="text-blue-200 font-medium flex items-center space-x-2">
              <User className="h-4 w-4 text-amber-400" />
              <span>ID do Policial</span>
            </Label>
            <Input
              id="officerId"
              value={formData.officerId}
              onChange={(e) => setFormData({...formData, officerId: e.target.value})}
              placeholder="Ex: 1234"
              className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 focus:ring-amber-400/30"
              required
            />
          </div>
        </div>

        {/* Nome do Policial */}
        <div className="space-y-2">
          <Label htmlFor="officerName" className="text-blue-200 font-medium">
            Nome do Policial
          </Label>
          <Input
            id="officerName"
            value={formData.officerName}
            onChange={(e) => setFormData({...formData, officerName: e.target.value})}
            placeholder="Ex: João Silva"
            className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 focus:ring-amber-400/30"
            required
          />
        </div>

        {/* Registrado Por */}
        <div className="space-y-2">
          <Label htmlFor="registeredBy" className="text-blue-200 font-medium flex items-center space-x-2">
            <UserCheck className="h-4 w-4 text-amber-400" />
            <span>Registrado Por</span>
          </Label>
          <Input
            id="registeredBy"
            value={formData.registeredBy}
            onChange={(e) => setFormData({...formData, registeredBy: e.target.value})}
            placeholder="Ex: Inspetor Maria Santos"
            className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 focus:ring-amber-400/30"
            required
          />
        </div>

        {/* Tipo de Punição */}
        <div className="space-y-2">
          <Label htmlFor="punishmentType" className="text-blue-200 font-medium">
            Tipo de Punição
          </Label>
          <Select value={formData.punishmentType} onValueChange={(value) => setFormData({...formData, punishmentType: value})}>
            <SelectTrigger className="bg-slate-700/50 border-blue-600/30 text-white focus:border-amber-400">
              <SelectValue placeholder="Selecione o tipo de punição" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-blue-600/30">
              {punishmentTypes.map(type => (
                <SelectItem key={type} value={type} className="text-white hover:bg-blue-700/50">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Gravidade */}
        <div className="space-y-3">
          <Label className="text-blue-200 font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Gravidade da Infração</span>
          </Label>
          <RadioGroup 
            value={formData.severity} 
            onValueChange={(value: 'Leve' | 'Média' | 'Grave') => setFormData({...formData, severity: value})}
            className="flex space-x-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Leve" id="leve" className="border-green-400 text-green-400" />
              <Label htmlFor="leve" className="text-green-300">Leve</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Média" id="media" className="border-yellow-400 text-yellow-400" />
              <Label htmlFor="media" className="text-yellow-300">Média</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Grave" id="grave" className="border-red-400 text-red-400" />
              <Label htmlFor="grave" className="text-red-300">Grave</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Prova */}
        <div className="space-y-2">
          <Label htmlFor="evidence" className="text-blue-200 font-medium">
            Prova da Infração
          </Label>
          <Textarea
            id="evidence"
            value={formData.evidence}
            onChange={(e) => setFormData({...formData, evidence: e.target.value})}
            placeholder="Descreva as evidências da infração (prints, vídeos, testemunhas, etc.)"
            rows={4}
            className="bg-slate-700/50 border-blue-600/30 text-white placeholder-blue-300 focus:border-amber-400 focus:ring-amber-400/30 resize-none"
            required
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-4 pt-4 border-t border-blue-700/30">
          <Button 
            type="submit"
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold shadow-lg transition-all duration-300"
          >
            Registrar Infração
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 border-blue-600/30 text-blue-200 hover:bg-blue-700/20 hover:text-white"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InfractionForm;
