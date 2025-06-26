import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TravelManagement from '@/components/TravelManagement';
import ClientManagement from '@/components/ClientManagement';
import BookingManagement from '@/components/BookingManagement';
import MobileSettings from './MobileSettings';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, MapPin, Users, Calendar, LayoutDashboard, Settings } from 'lucide-react';

const Index = () => {
  const { signOut, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
      // No desktop, não força nada, deixa o usuário alternar
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fecha o menu popover ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        fabRef.current &&
        !fabRef.current.contains(target)
      ) {
        setShowMobileMenu(false);
      }
    }
    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'travels':
        return <TravelManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'settings':
        return <MobileSettings />;
      default:
        return <Dashboard />;
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Função de alternância só ativa no desktop
  const handleSidebarToggle = () => {
    if (window.innerWidth >= 768) {
      setSidebarOpen((v) => !v);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar só em md+ */}
        <div className="hidden md:block">
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage}
            isOpen={sidebarOpen}
            onToggle={handleSidebarToggle}
          />
        </div>
        {/* Overlay para popover mobile */}
        {showMobileMenu && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" />
        )}
        {/* FAB para mobile */}
        <button
          ref={fabRef}
          onClick={() => setShowMobileMenu(v => !v)}
          className={`inline-flex md:hidden fixed bottom-4 right-4 z-50 w-14 h-14 items-center justify-center rounded-full shadow-lg transition-all duration-300
            ${showMobileMenu ? 'scale-110 bg-blue-600' : 'bg-blue-700'}
          `}
          aria-label="Abrir menu"
        >
          <Menu className={`w-7 h-7 text-white transition-transform duration-300 ${showMobileMenu ? 'rotate-90' : ''}`} />
        </button>
        {/* Popover menu mobile */}
        {showMobileMenu && (
          <div ref={mobileMenuRef} className="fixed bottom-20 right-4 z-50 bg-white rounded-xl shadow-lg p-2 flex flex-col gap-2 w-48 animate-fade-in">
            <button onClick={() => { setCurrentPage('dashboard'); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
              <span className="bg-blue-100 text-blue-700 rounded-full p-1"><LayoutDashboard size={20} /></span> <span className="text-sm text-gray-800">Dashboard</span>
            </button>
            <button onClick={() => { setCurrentPage('travels'); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
              <span className="bg-blue-100 text-blue-700 rounded-full p-1"><MapPin size={20} /></span> <span className="text-sm text-gray-800">Viagens</span>
            </button>
            <button onClick={() => { setCurrentPage('clients'); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
              <span className="bg-blue-100 text-blue-700 rounded-full p-1"><Users size={20} /></span> <span className="text-sm text-gray-800">Clientes</span>
            </button>
            <button onClick={() => { setCurrentPage('bookings'); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
              <span className="bg-blue-100 text-blue-700 rounded-full p-1"><Calendar size={20} /></span> <span className="text-sm text-gray-800">Recursos</span>
            </button>
            <button onClick={() => { setCurrentPage('settings'); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded">
              <span className="bg-blue-100 text-blue-700 rounded-full p-1"><Settings size={20} /></span> <span className="text-sm text-gray-800">Configurações</span>
            </button>
            <button onClick={() => { handleSignOut(); setShowMobileMenu(false); }} className="flex items-center gap-2 p-2 hover:bg-red-50 rounded">
              <span className="bg-red-100 text-red-700 rounded-full p-1"><LogOut size={20} /></span> <span className="text-sm text-gray-800">Sair</span>
            </button>
          </div>
        )}
        <div className={`flex-1 min-h-screen transition-all duration-300 overflow-y-auto ml-0 ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-lg md:text-2xl font-bold text-gray-800 ml-2 md:ml-12">
                  Admin Turismo & Viagens
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline text-sm text-gray-600 truncate max-w-[100px] md:max-w-xs">
                  Bem-vindo, {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut} className="px-2 md:px-4">
                  <LogOut className="w-4 h-4 mr-0 md:mr-2" />
                  <span className="hidden md:inline">Sair</span>
                </Button>
              </div>
            </div>
          </header>
          <main className="p-6">
            {renderPage()}
          </main>
        </div>
        {/* Botão de alternância fixo para desktop */}
        <button
          onClick={handleSidebarToggle}
          className={`hidden md:inline-flex fixed top-2 transition-left duration-300 ease-in-out z-50
            ${sidebarOpen ? 'left-64' : 'left-20'}
            w-14 h-14 items-center justify-center
          `}
          aria-label="Alternar sidebar"
        >
          <Menu className="w-8 h-8 text-blue-700 bg-white rounded-xl shadow p-2" />
        </button>
      </div>
    </div>
  );
};

export default Index; 