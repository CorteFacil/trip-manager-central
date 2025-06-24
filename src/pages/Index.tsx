import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import TravelManagement from '@/components/TravelManagement';
import ClientManagement from '@/components/ClientManagement';
import BookingManagement from '@/components/BookingManagement';
import { Button } from '@/components/ui/button';
import { Menu, LogOut } from 'lucide-react';

const Index = () => {
  const { signOut, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        <Sidebar 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage}
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
        />
        {/* Botão de alternância fixo para desktop */}
        <button
          onClick={handleSidebarToggle}
          className={`hidden md:inline-flex fixed top-6 transition-all duration-300 z-40
            ${sidebarOpen ? 'left-64' : 'left-20'}
            w-14 h-14 items-center justify-center ml-6
          `}
          aria-label="Alternar sidebar"
        >
          <Menu className="w-8 h-8 text-blue-700 bg-white rounded-xl shadow p-2" />
        </button>
        <div className={`flex-1 min-h-screen transition-all duration-300 overflow-y-auto ${sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
          <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 mt-8">
                  Admin Turismo & Viagens
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Bem-vindo, {user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </header>
          <main className="p-6">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index; 