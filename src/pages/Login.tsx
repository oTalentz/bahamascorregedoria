
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const { user, signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Se já está logado, redirecionar baseado na role
  if (user) {
    // Se tem role, redirecionar para área apropriada
    if (user.role) {
      return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;
    }
    // Se não tem role, será tratado pelo ProtectedRoute (mostra PendingApproval)
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Login realizado",
        description: "Verificando seus privilégios...",
      });
    }

    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name);

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Cadastro realizado",
        description: "Sua solicitação de acesso foi enviada para aprovação. Verifique seu email para confirmar a conta.",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 shadow-2xl border-b border-blue-800/30">
        <div className="container mx-auto px-8 py-10">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-amber-400 to-yellow-500 p-4 rounded-xl shadow-lg">
                <Shield className="h-10 w-10 text-blue-900" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl font-bold text-white">
                  CORREGEDORIA POLICIAL
                </h1>
                <p className="text-blue-200 mt-2 text-lg">
                  Sistema de Acompanhamento de Infrações
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-8 py-16 flex items-center justify-center">
        <Card className="w-full max-w-md bg-gradient-to-br from-blue-800/95 to-slate-800/95 border-blue-600/70 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Acesso ao Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-700/95">
                <TabsTrigger value="login" className="text-blue-100 data-[state=active]:bg-amber-500/60 data-[state=active]:text-white">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="text-blue-100 data-[state=active]:bg-amber-500/60 data-[state=active]:text-white">
                  Solicitar Acesso
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-blue-900 font-semibold"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      placeholder="Nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200"
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200"
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Motivo da solicitação (opcional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="bg-slate-700/95 border-blue-500/70 text-white placeholder-blue-200 min-h-[80px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold flex items-center justify-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>{loading ? 'Enviando...' : 'Solicitar Acesso'}</span>
                  </Button>

                  <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-4">
                    <p className="text-blue-200 text-sm text-center">
                      <strong>Importante:</strong> Sua solicitação será analisada pelos administradores. 
                      Você receberá uma confirmação por email quando sua conta for aprovada.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
