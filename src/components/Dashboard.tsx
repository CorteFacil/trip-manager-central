
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Globe
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      title: 'Total de Clientes',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Viagens Ativas',
      value: '56',
      change: '+8%',
      icon: MapPin,
      color: 'bg-green-500',
    },
    {
      title: 'Reservas do Mês',
      value: '89',
      change: '+23%',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Receita Total',
      value: 'R$ 485,200',
      change: '+15%',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  const recentBookings = [
    {
      client: 'Maria Silva',
      destination: 'Fernando de Noronha',
      date: '2024-01-15',
      status: 'Confirmada',
      value: 'R$ 3,500',
    },
    {
      client: 'João Santos',
      destination: 'Gramado',
      date: '2024-01-20',
      status: 'Pendente',
      value: 'R$ 1,800',
    },
    {
      client: 'Ana Costa',
      destination: 'Bonito',
      date: '2024-01-25',
      status: 'Confirmada',
      value: 'R$ 2,200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu negócio de turismo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Reservas Recentes</h3>
          <div className="space-y-4">
            {recentBookings.map((booking, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{booking.client}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Globe className="w-4 h-4 mr-1" />
                    {booking.destination}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{booking.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{booking.value}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    booking.status === 'Confirmada' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              Nova Viagem
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Novo Cliente
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Nova Reserva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
