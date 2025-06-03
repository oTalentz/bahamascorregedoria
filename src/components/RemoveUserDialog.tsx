
import React, { useState } from 'react';
import { User, AlertTriangle, UserX } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RemoveUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
  userEmail: string;
  isLoading?: boolean;
}

const RemoveUserDialog: React.FC<RemoveUserDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
  isLoading = false
}) => {
  const [confirmationText, setConfirmationText] = useState('');
  const expectedText = 'REMOVER USUÁRIO';

  const handleConfirm = () => {
    if (confirmationText === expectedText) {
      onConfirm();
      setConfirmationText('');
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-gradient-to-br from-slate-800 to-slate-900 border-red-600/50 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-red-500/20 p-2 rounded-full">
              <UserX className="h-6 w-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl text-white">
              Remover Usuário
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 space-y-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="font-medium text-red-200">Ação Irreversível</span>
              </div>
              <p className="text-sm text-red-300">
                Esta ação não pode ser desfeita. O usuário será permanentemente removido do sistema.
              </p>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-blue-400" />
                <span className="font-medium text-white">Usuário a ser removido:</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-white font-medium">{userName}</p>
                <p className="text-slate-400 text-sm">{userEmail}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation" className="text-slate-200 font-medium">
                Para confirmar, digite: <span className="text-red-400 font-bold">{expectedText}</span>
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Digite a confirmação..."
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                disabled={isLoading}
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="space-x-2">
          <AlertDialogCancel 
            onClick={handleClose}
            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
            disabled={isLoading}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={confirmationText !== expectedText || isLoading}
            className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Removendo...</span>
              </div>
            ) : (
              'Remover Usuário'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveUserDialog;
