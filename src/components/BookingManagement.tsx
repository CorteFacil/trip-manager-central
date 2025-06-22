
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, User, MapPin, DollarSign } from 'lucide-react';

const BookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const bookings = [
    {
      id: 1,
      client: 'Maria Silva',
      travel: 'Fernando de Noronha',
      date: '2024-01-15',
      endDate: '2024-01-22',
      status: 'Confirmada',
      value: 'R$ 3.500',
      participants: 2,
      paymentStatus: 'Pago',
    },
    {
      id: 2,
      client: 'João Santos',
      travel: 'Gramado',
      date: '2024-01-20',
      endDate: '2024-01-24',
      status: 'Pendente',
      value: 'R$ 1.800',
      participants: 1,
      paymentStatus: 'Pendente',
    },
    {
      id: 3,
      client: 'Ana Costa',
      travel: 'Bonito',
      date: '2024-01-25',
      endDate: '2024-01-30',
      status: 'Confirmada',
      value: 'R$ 2.200',
      participants: 3,
      paymentStatus: 'Pago',
    },
    {
      id: 4,
      client: 'Pedro Oliveira',
      travel: 'Fernando de Noronha',
      date: '2024-02-01',
      endDate: '2024-02-08',
      status: 'Cancelada',
      value: 'R$ 3.500',
      participants: 2,
      paymentStatus: 'Reembolsado',
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.travel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Reembolsado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestão de Reservas</h2>
          <p className="text-gray-600 mt-1">Gerencie todas as reservas de viagens</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Nova Reserva
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente ou destino..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="confirmada">Confirmada</option>
            <option value="pendente">Pendente</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Bookings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{booking.client}</h3>
                  <p className="text-sm text-gray-600">ID: #{booking.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-3" />
                <span className="font-medium">{booking.travel}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="w-4 h-4 mr-3" />
                <span>{booking.date} até {booking.endDate}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <User className="w-4 h-4 mr-3" />
                <span>{booking.participants} participantes</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="w-4 h-4 mr-3" />
                <span className="font-semibold text-gray-800">{booking.value}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                <Trash2 className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingManagement;
