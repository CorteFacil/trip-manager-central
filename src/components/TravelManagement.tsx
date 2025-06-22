
import { useState } from 'react';
import { Plus, Search, Edit, Trash2, MapPin, Calendar, DollarSign } from 'lucide-react';

const TravelManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const travels = [
    {
      id: 1,
      title: 'Fernando de Noronha - Paraíso Natural',
      destination: 'Fernando de Noronha, PE',
      duration: '7 dias / 6 noites',
      price: 'R$ 3.500',
      status: 'Ativo',
      image: '/placeholder.svg',
      availableSpots: 15,
    },
    {
      id: 2,
      title: 'Gramado e Canela - Serra Gaúcha',
      destination: 'Gramado, RS',
      duration: '4 dias / 3 noites',
      price: 'R$ 1.800',
      status: 'Ativo',
      image: '/placeholder.svg',
      availableSpots: 8,
    },
    {
      id: 3,
      title: 'Bonito - Ecoturismo',
      destination: 'Bonito, MS',
      duration: '5 dias / 4 noites',
      price: 'R$ 2.200',
      status: 'Inativo',
      image: '/placeholder.svg',
      availableSpots: 0,
    },
  ];

  const filteredTravels = travels.filter(travel =>
    travel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    travel.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gestão de Viagens</h2>
          <p className="text-gray-600 mt-1">Gerencie pacotes e destinos turísticos</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" />
          Nova Viagem
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar viagens por título ou destino..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Travel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTravels.map((travel) => (
          <div key={travel.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-gradient-to-r from-blue-400 to-green-400 flex items-center justify-center">
              <MapPin className="w-12 h-12 text-white" />
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{travel.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  travel.status === 'Ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {travel.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  {travel.destination}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  {travel.duration}
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {travel.price}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  {travel.availableSpots} vagas disponíveis
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(travel.availableSpots / 20) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TravelManagement;
