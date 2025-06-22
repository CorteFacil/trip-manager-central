
import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Globe,
  UserCheck
} from 'lucide-react';
import { useParticipantes } from '@/hooks/useParticipantes';
import { useViagens } from '@/hooks/useViagens';
import { useGuias } from '@/hooks/useGuias';
import { useCidades } from '@/hooks/useCidades';

const Dashboard = () => {
  const { participantes } = useParticipantes();
  const { viagens } = useViagens();
  const { guias } = useGuias();
  const { cidades } = useCidades();

  const participantesPagos = participantes.filter(p => p.pago).length;
  const viagensAtivas = viagens.length;
  const receitaTotal = participantesPagos * 2500; // Valor médio estimado

  const stats = [
    {
      title: 'Total de Clientes',
      value: participantes.length.toString(),
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Guias Cadastrados',
      value: guias.length.toString(),
      change: '+5%',
      icon: UserCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Viagens Cadastradas',
      value: viagensAtivas.toString(),
      change: '+23%',
      icon: Calendar,
      color: 'bg-purple-500',
    },
    {
      title: 'Receita Estimada',
      value: `R$ ${receitaTotal.toLocaleString('pt-BR')}`,
      change: '+15%',
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
  ];

  const recentViagens = viagens.slice(0, 3).map(viagem => ({
    client: viagem.participante?.nome || 'Sem participante',
    destination: 'Destino não informado',
    date: new Date(viagem.data_inicio).toLocaleDateString('pt-BR'),
    status: new Date(viagem.data_inicio) > new Date() ? 'Agendada' : 'Concluída',
    value: 'R$ 2,500',
  }));

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
        {/* Recent Viagens */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Viagens Recentes</h3>
          <div className="space-y-4">
            {recentViagens.length > 0 ? recentViagens.map((viagem, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{viagem.client}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Globe className="w-4 h-4 mr-1" />
                    {viagem.destination}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{viagem.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">{viagem.value}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    viagem.status === 'Concluída' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {viagem.status}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Nenhuma viagem cadastrada</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              Nova Viagem
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2">
              <Users className="w-5 h-5" />
              Novo Cliente
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" />
              Nova Cidade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
