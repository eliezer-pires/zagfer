import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import Logo from '../components/Logo';

const Login = () => {
  const [matricula, setMatricula] = useState('');
  const [error, setError] = useState('');
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(matricula);
    if (success) {
      navigate('/');
    } else {
      setError('Matrícula inválida ou usuário inativo.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-zagfer-500/5 rounded-full blur-3xl" />
         <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 transition-colors duration-300 relative z-10 border border-slate-100 dark:border-slate-700/50">
        <div className="flex flex-col items-center mb-10">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
             <Logo size="xl" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">ZAGFER</h1>
          <div className="h-1 w-12 bg-gradient-to-r from-zagfer-400 to-zagfer-600 rounded-full my-3"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão Inteligente de Ferramentas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="matricula" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">
              Número da Matrícula
            </label>
            <div className="relative group">
              <input
                id="matricula"
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="w-full px-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-lg placeholder-slate-400 focus:ring-2 focus:ring-zagfer-500 focus:border-transparent outline-none transition-all shadow-inner group-hover:bg-white dark:group-hover:bg-slate-800"
                placeholder="Digite sua matrícula..."
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-zagfer-500 to-zagfer-700 hover:from-zagfer-600 hover:to-zagfer-800 text-white font-bold py-4 rounded-2xl transition-all duration-200 shadow-lg shadow-zagfer-500/30 hover:shadow-zagfer-500/50 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Acessar Sistema
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-xs text-slate-400 dark:text-slate-600">
             Sistema de Controle Interno v1.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;