
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { SupabaseService } from '@/services/supabaseService';

interface DeleteInfractionDialogProps {
  infractionId: string;
  officerName: string;
  onClose: () => void;
  onConfirm: (infractionId: string, deletedBy: string, reason: string) => void;
}

const DeleteInfractionDialog: React.FC<DeleteInfractionDialogProps> = ({
  infractionId,
  officerName,
  onClose,
  onConfirm
}) => {
  const [deletedBy, setDeletedBy] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState<number | null>(null);

  const checkDailyLimit = async () => {
    if (deletedBy.trim()) {
      try {
        const count = await SupabaseService.getDailyDeletionCount(deletedBy.trim());
        setDailyCount(count);
      } catch (error) {
        console.error('Erro ao verificar limite diário:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deletedBy.trim() || !reason.trim()) {
      return;
    }

    if (dailyCount !== null && dailyCount >= 3) {
      return;
    }

    setIsLoading(true);
    
    try {
      onConfirm(infractionId, deletedBy.trim(), reason.trim());
    } catch (error) {
      console.error('Erro ao remover infração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canDelete = deletedBy.trim() && reason.trim() && (dailyCount === null || dailyCount < 3);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50">
      <div className="bg-gradient-to-br from-slate-800/95 to-red-900/95 rounded-xl shadow-2xl max-w-md w-full border border-red-700/40">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-red-700/30">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-red-400 to-red-500 p-2 rounded-lg">
                <Trash2 className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Remover Infração</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-red-300 hover:text-white hover:bg-red-600/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Aviso */}
          <div className="bg-red-900/50 border border-red-600/50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-red-200 font-medium mb-1">Atenção</h3>
                <p className="text-red-300 text-sm">
                  Você está prestes a remover a infração do policial <strong>{officerName}</strong>. 
                  Esta ação não pode ser desfeita e será registrada no sistema de auditoria.
                </p>
                <p className="text-red-300 text-sm mt-2">
                  <strong>Limite:</strong> Máximo 3 remoções por dia por usuário.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome do responsável */}
            <div className="space-y-2">
              <Label htmlFor="deletedBy" className="text-red-200 font-medium">
                Removido por (seu nome)
              </Label>
              <Input
                id="deletedBy"
                value={deletedBy}
                onChange={(e) => setDeletedBy(e.target.value)}
                onBlur={checkDailyLimit}
                placeholder="Ex: Inspetor João Silva"
                className="bg-slate-700/50 border-red-600/30 text-white placeholder-red-300 focus:border-red-400"
                required
              />
              {dailyCount !== null && (
                <p className={`text-sm ${dailyCount >= 3 ? 'text-red-400' : 'text-red-300'}`}>
                  Remoções hoje: {dailyCount}/3
                  {dailyCount >= 3 && ' - Limite atingido!'}
                </p>
              )}
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-red-200 font-medium">
                Motivo da remoção
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Descreva o motivo para a remoção desta infração..."
                rows={3}
                className="bg-slate-700/50 border-red-600/30 text-white placeholder-red-300 focus:border-red-400 resize-none"
                required
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-3 pt-4 border-t border-red-700/30">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1 border-red-600/30 text-red-200 hover:bg-red-700/20 hover:text-white"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!canDelete || isLoading}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold shadow-lg transition-all duration-300"
              >
                {isLoading ? 'Removendo...' : 'Confirmar Remoção'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteInfractionDialog;
