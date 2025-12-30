
import React, { useState, useEffect } from 'react';
import { User, PlanType } from '../types';
import { DEFAULT_TEMPLATE } from '../constants';
import { supabase, db } from '../lib/supabase';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem('zapcobranca_remembered_email');
    const savedPassword = localStorage.getItem('zapcobranca_remembered_password');
    
    if (savedEmail) {
      setEmail(savedEmail);
      if (savedPassword) {
        setPassword(savedPassword);
      }
      setRememberMe(true);
    }
  }, []);

  const handleRecoverPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) throw error;

      setInfo('Se houver uma conta com este e-mail, enviamos um link de recuperação para você.');
      setIsRecovering(false); // Volta para o login para mostrar a mensagem
      setIsLogin(true);
    } catch (err: any) {
      // Por segurança, não confirmamos se o email existe ou não, mas logamos erro genérico
      console.error('Erro recuperação:', err);
      // Tratamento de limite de envio (Rate Limit)
      if (err.message.includes('rate limit')) {
        setError('Muitas tentativas. Aguarde alguns instantes antes de tentar novamente.');
      } else {
        setError('Erro ao enviar email de recuperação. Verifique o endereço digitado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    // Persistência de dados "Lembrar-me"
    if (rememberMe) {
      localStorage.setItem('zapcobranca_remembered_email', email);
      localStorage.setItem('zapcobranca_remembered_password', password);
    } else {
      localStorage.removeItem('zapcobranca_remembered_email');
      localStorage.removeItem('zapcobranca_remembered_password');
    }

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (authError) throw authError;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { full_name: name.trim() }
          }
        });
        
        if (authError) throw authError;

        if (data.user) {
          // Garante perfil imediato para evitar bugs de carregamento
          await db.ensureProfile(data.user.id, email.trim(), name.trim());
          
          if (data.session === null) {
            setInfo('Sucesso! Verifique seu e-mail para confirmar a conta e depois faça login.');
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      
      const errorMessage = err.message || String(err);
      
      if (errorMessage.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos. Verifique se você já criou uma conta ou se digitou os dados corretamente.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Por favor, confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
      } else if (errorMessage.toLowerCase().includes('fetch') || errorMessage.toLowerCase().includes('failed')) {
        setError('Erro de rede. DICA: Desative bloqueadores de anúncios (AdBlock) para este site.');
      } else if (errorMessage.includes('already registered')) {
        setError('Este e-mail já possui uma conta. Tente fazer login.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black mx-auto mb-4 shadow-xl shadow-indigo-100">
            Z
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ZapCobrança</h1>
          <p className="text-slate-500 mt-2">Sua gestão B2B simplificada.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isRecovering 
              ? 'Recuperar Senha' 
              : (isLogin ? 'Faça seu login' : 'Crie sua conta em 10 segundos')
            }
          </h2>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl leading-relaxed flex gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm rounded-2xl leading-relaxed flex gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{info}</span>
            </div>
          )}

          {isRecovering ? (
            <form onSubmit={handleRecoverPassword} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <p className="text-sm text-slate-500 mb-4 text-center leading-relaxed">
                Digite seu e-mail abaixo. Enviaremos um link mágico para você acessar sua conta e redefinir sua senha.
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Cadastrado</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="exemplo@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  setIsRecovering(false);
                  setError(null);
                  setInfo(null);
                }}
                className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors text-sm"
              >
                Voltar para o Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    placeholder="Seu nome"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="exemplo@email.com"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700">Senha</label>
                  {isLogin && (
                    <button 
                      type="button"
                      onClick={() => {
                        setIsRecovering(true);
                        setError(null);
                        setInfo(null);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center gap-2 px-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer select-none font-medium">
                  Lembrar meus dados
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-4 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>}
                {loading ? 'Entrando...' : isLogin ? 'Acessar Dashboard' : 'Criar minha conta'}
              </button>
            </form>
          )}

          {!isRecovering && (
            <div className="mt-8 text-center">
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setInfo(null);
                }}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                {isLogin ? 'Não tem conta? Cadastre-se grátis' : 'Já é usuário? Faça login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
