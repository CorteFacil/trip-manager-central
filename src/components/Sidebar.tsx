import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Calendar,
  Settings,
  LogOut 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

const Sidebar = ({ currentPage, setCurrentPage, isOpen, isMobileOpen, onMobileToggle }: SidebarProps) => {
  const [showConfig, setShowConfig] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [user, setUser] = useState<any>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showText, setShowText] = useState(isOpen);

  useEffect(() => {
    async function fetchAdmins() {
      const { data } = await supabase.from('administrador').select('*');
      setAdmins(data || []);
    }
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    }
    if (showConfig) {
      fetchAdmins();
      fetchUser();
    }
  }, [showConfig]);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowConfig(false);
      }
    }
    if (showConfig) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showConfig]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isOpen) {
      timeout = setTimeout(() => setShowText(true), 300);
    } else {
      timeout = setTimeout(() => setShowText(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [isOpen]);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'travels',
      label: 'Viagens',
      icon: MapPin,
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
    },
    {
      id: 'bookings',
      label: 'Recursos',
      icon: Calendar,
    },
  ];

  return (
    <div className={`fixed top-0 h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 text-white shadow-xl z-50 transition-all duration-300
      w-64 md:w-20
      ${isOpen ? 'md:w-64' : 'md:w-20'}
      ${isMobileOpen ? 'left-0' : '-left-64'} md:left-0
    `}>
      <div className="p-4 flex flex-col h-full">
        {/* Botão de fechar no mobile */}
        {onMobileToggle && (
          <button onClick={onMobileToggle} className="md:hidden absolute top-4 right-4 bg-white text-blue-700 rounded-full p-2 shadow z-50" aria-label="Fechar menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <MapPin className="w-7 h-7 text-white drop-shadow" />
          </div>
          {showText && (
            <div className={`transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
              <h2 className="font-extrabold text-xl tracking-tight">TravelAdmin</h2>
              <p className="text-blue-200 text-xs font-medium">Gestão de Turismo</p>
            </div>
          )}
        </div>
        <div className="border-b border-blue-600 mb-4 opacity-40" />
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-semibold transition-all duration-200
                  ${active ? 'bg-blue-100/20 text-blue-900 shadow-lg' : 'hover:bg-blue-600/40 text-blue-100 hover:text-white'}
                  ${isOpen ? 'justify-start' : 'justify-center'}
                `}
              >
                <Icon className={`w-6 h-6 flex-shrink-0 ${active ? 'text-blue-300' : 'text-blue-200'}`} />
                {showText && <span className={`font-medium text-base tracking-tight transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-blue-600 opacity-40" />
        <div className="space-y-2 mt-4">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 bg-blue-800/60 hover:bg-blue-700/80 text-blue-100 hover:text-white"
            onClick={() => setShowConfig((v) => !v)}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {showText && <span className={`font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Configurações</span>}
          </button>
          {/* Popover de configurações */}
          {showConfig && (
            <div ref={popoverRef} className="absolute bottom-20 left-4 w-56 bg-white text-gray-800 rounded-lg shadow-lg border z-50 animate-fade-in flex flex-col">
              <div className="px-4 py-3 border-b font-semibold text-blue-700 text-center cursor-default">
                {user ? (user.user_metadata?.nome ? user.user_metadata.nome : user.email) : 'Carregando...'}
              </div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b"
                onClick={() => { setShowConfig(false); window.location.href = '/perfil'; }}
              >
                Perfil
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-blue-50"
                onClick={() => { setShowConfig(false); window.location.href = '/administradores'; }}
              >
                Gerenciar administradores
              </button>
            </div>
          )}
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white"
            onClick={async () => {
              if (window.confirm('Tem certeza que deseja sair?')) {
                await supabase.auth.signOut();
                window.location.reload();
              }
            }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {showText && <span className={`font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
