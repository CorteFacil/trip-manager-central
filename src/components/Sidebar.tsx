
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  Calendar,
  Settings,
  LogOut 
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ currentPage, setCurrentPage, isOpen }: SidebarProps) => {
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
      label: 'Reservas',
      icon: Calendar,
    },
  ];

  return (
    <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-10 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          {isOpen && (
            <div>
              <h2 className="font-bold text-lg">TravelAdmin</h2>
              <p className="text-blue-200 text-sm">Gestão de Turismo</p>
            </div>
          )}
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-white/10 ${
                  currentPage === item.id ? 'bg-white/20 shadow-lg' : ''
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-4 left-0 right-0 px-4">
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-white/10">
            <Settings className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Configurações</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-red-500/20 text-red-200">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
