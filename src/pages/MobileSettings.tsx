import React, { useEffect } from 'react';
import { ArrowLeft, User, Users, Settings } from 'lucide-react';

const MobileSettings = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <div className="flex items-center mb-6">
        <button
          onClick={() => window.history.back()}
          className="p-2 rounded-full bg-white shadow hover:bg-blue-100 transition mr-2"
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-blue-700" />
        </button>
        <h2 className="text-xl font-bold text-blue-900">Configurações</h2>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={() => window.location.href = '/perfil'}
          className="flex items-center gap-3 p-4 bg-white/90 rounded-xl shadow-lg border border-blue-100 hover:bg-blue-50 transition justify-center"
        >
          <User className="w-6 h-6 text-blue-700" />
          <span className="text-base font-semibold text-blue-900 text-center">Perfil</span>
        </button>
        <button
          onClick={() => window.location.href = '/administradores'}
          className="flex items-center gap-3 p-4 bg-white/90 rounded-xl shadow-lg border border-blue-100 hover:bg-blue-50 transition justify-center"
        >
          <Users className="w-6 h-6 text-blue-700" />
          <span className="text-base font-semibold text-blue-900 text-center">Gerenciar administradores</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSettings; 