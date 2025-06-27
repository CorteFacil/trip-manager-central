import React, { useEffect } from 'react';
import { ArrowLeft, User, Users, Settings } from 'lucide-react';

const MobileSettings = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <div className="flex items-center mb-6">
        <h2 className="font-serif-display font-normal text-xl text-[#000000]">Configurações</h2>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <button
          onClick={() => window.location.href = '/perfil'}
          className="flex items-center gap-3 p-4 bg-white/90 shadow-lg border border-[#95c11f]/20 hover:bg-[#95c11f]/10 transition justify-center font-poppins rounded-none"
        >
          <User className="w-6 h-6 text-[#95c11f]" />
          <span className="text-base font-semibold text-[#000000] text-center">Perfil</span>
        </button>
        <button
          onClick={() => window.location.href = '/administradores'}
          className="flex items-center gap-3 p-4 bg-white/90 shadow-lg border border-[#95c11f]/20 hover:bg-[#95c11f]/10 transition justify-center font-poppins rounded-none"
        >
          <Users className="w-6 h-6 text-[#95c11f]" />
          <span className="text-base font-semibold text-[#000000] text-center">Gerenciar administradores</span>
        </button>
      </div>
      <div className="flex justify-end mt-8">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-4 py-2 bg-[#95c11f] text-black rounded-none shadow hover:bg-[#bfff2c] transition-colors font-semibold border border-[#95c11f] focus:outline-none focus:ring-2 focus:ring-[#95c11f]"
          style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)' }}
          aria-label="Voltar"
        >
          <ArrowLeft className="w-5 h-5 text-black" />
          <span className="font-medium text-black">Voltar</span>
        </button>
      </div>
    </div>
  );
};

export default MobileSettings; 