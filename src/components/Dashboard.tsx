import { 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Globe,
  UserCheck,
  Plus
} from 'lucide-react';
import { useParticipantes } from '@/hooks/useParticipantes';
import { useViagens } from '@/hooks/useViagens';
import { useGuias } from '@/hooks/useGuias';
import { useCidades } from '@/hooks/useCidades';
import { useState } from 'react';
import { ViagemForm } from './ViagemForm';
import { ClienteForm } from './ClienteForm';
import { CidadeForm } from './CidadeForm';
import { useViagemParticipantes } from '@/hooks/useViagemParticipantes';
import { useViagemCidades } from '@/hooks/useViagemCidades';
import { endOfMonth, startOfMonth, subMonths, subDays, isAfter, isBefore } from 'date-fns';

const Dashboard = () => {
  const { participantes } = useParticipantes();
  const { viagens } = useViagens();
  const { guias } = useGuias();
  const { cidades } = useCidades();
  const { getParticipantesByViagem } = useViagemParticipantes();
  const { getCidadesByViagem } = useViagemCidades();

  // Estados para modais de ações rápidas
  const [showNovaViagem, setShowNovaViagem] = useState(false);
  const [showNovoCliente, setShowNovoCliente] = useState(false);
  const [showNovaCidade, setShowNovaCidade] = useState(false);

  const participantesPagos = participantes.filter(p => p.pago).length;
  const viagensAtivas = viagens.length;

  // --- Cálculo para os cards ---
  // 1. Guias: guia que mais participou de viagens no último mês
  const now = new Date();
  const startLastMonth = startOfMonth(subMonths(now, 1));
  const endLastMonth = endOfMonth(subMonths(now, 1));
  const startThisMonth = startOfMonth(now);
  const endThisMonth = endOfMonth(now);

  // Viagens do mês atual e anterior
  const viagensThisMonth = viagens.filter(v => {
    const d = new Date(v.data_inicio);
    return isAfter(d, startThisMonth) && isBefore(d, endThisMonth);
  });
  const viagensLastMonth = viagens.filter(v => {
    const d = new Date(v.data_inicio);
    return isAfter(d, startLastMonth) && isBefore(d, endLastMonth);
  });

  // Guias que participaram de viagens no último mês
  const guiasViagensCount: Record<string, number> = {};
  viagensThisMonth.forEach(v => {
    if (v.guia_turistico_id) {
      guiasViagensCount[v.guia_turistico_id] = (guiasViagensCount[v.guia_turistico_id] || 0) + 1;
    }
  });
  let guiaMaisViagens = null;
  let guiaMaisViagensCount = 0;
  Object.entries(guiasViagensCount).forEach(([id, count]) => {
    if (count > guiaMaisViagensCount) {
      guiaMaisViagens = guias.find(g => g.id === id);
      guiaMaisViagensCount = count;
    }
  });
  const guiaPercent = viagensThisMonth.length > 0 ? Math.round((guiaMaisViagensCount / viagensThisMonth.length) * 100) : 0;

  // 2. Clientes: crescimento na última semana
  const sevenDaysAgo = subDays(now, 7);
  const clientesAntes = participantes.filter(p => new Date(p.criado_em) < sevenDaysAgo).length;
  const clientesUltimaSemana = participantes.filter(p => new Date(p.criado_em) >= sevenDaysAgo).length;
  let clientesCrescimento;
  let clientesCrescimentoTexto = '';
  if (clientesAntes === 0 && clientesUltimaSemana > 0) {
    clientesCrescimento = 100;
    clientesCrescimentoTexto = `Novo recorde de clientes esta semana! (${clientesUltimaSemana} cliente${clientesUltimaSemana > 1 ? 's' : ''})`;
  } else if (clientesAntes === 0 && clientesUltimaSemana === 0) {
    clientesCrescimento = null;
    clientesCrescimentoTexto = 'Sem clientes cadastrados';
  } else {
    clientesCrescimento = Math.round((clientesUltimaSemana / clientesAntes) * 100);
    clientesCrescimentoTexto = `+${clientesUltimaSemana} clientes na última semana (${clientesCrescimento}% de crescimento)`;
  }

  // 3. Viagens: crescimento mês a mês
  let viagensCrescimento;
  let viagensCrescimentoTexto = '';
  if (viagensLastMonth.length === 0 && viagensThisMonth.length > 0) {
    viagensCrescimento = 100;
    viagensCrescimentoTexto = `Novo recorde de viagens este mês! (${viagensThisMonth.length} ${viagensThisMonth.length === 1 ? 'viagem' : 'viagens'})`;
  } else if (viagensLastMonth.length === 0 && viagensThisMonth.length === 0) {
    viagensCrescimento = null;
    viagensCrescimentoTexto = 'Sem viagens cadastradas';
  } else {
    viagensCrescimento = Math.round(((viagensThisMonth.length - viagensLastMonth.length) / viagensLastMonth.length) * 100);
    viagensCrescimentoTexto = `Crescimento de ${viagensCrescimento}% em relação ao mês anterior (${viagensThisMonth.length} ${viagensThisMonth.length === 1 ? 'viagem' : 'viagens'})`;
  }

  // Ajustar stats para usar os valores dinâmicos e textos
  const stats = [
    {
      title: 'Total de Clientes',
      value: participantes.length.toString(),
      percent: clientesCrescimento,
      icon: Users,
      color: 'bg-blue-500',
      text: clientesCrescimentoTexto
    },
    {
      title: 'Guias Cadastrados',
      value: guias.length.toString(),
      percent: guiaPercent,
      icon: UserCheck,
      color: 'bg-green-500',
      text: guiaMaisViagens ? `${guiaMaisViagens.nome} participou de ${guiaMaisViagensCount} viagens este mês (${guiaPercent}%)` : 'Nenhum guia participou de viagens este mês'
    },
    {
      title: 'Viagens Cadastradas',
      value: viagens.length.toString(),
      percent: viagensCrescimento,
      icon: Calendar,
      color: 'bg-purple-500',
      text: viagensCrescimentoTexto
    },
  ];

  // Preencher viagens recentes com dados reais
  const recentViagens = viagens
    .sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())
    .slice(0, 5)
    .map(viagem => {
      const participantesIds = getParticipantesByViagem(viagem.id);
      const participantesCount = participantesIds.length;
      const participantesLabel = participantesCount === 1 ? '1 participante' : `${participantesCount} participantes`;
      const cidadesIds = getCidadesByViagem(viagem.id);
      const cidadesNomes = cidadesIds.map(cid => {
        const c = cidades.find(x => x.id === cid);
        return c ? c.nome : '';
      }).filter(Boolean).join(', ');
      return {
        participantesLabel,
        cidadesNomes: cidadesNomes || 'Sem cidades',
        data: `${new Date(viagem.data_inicio).toLocaleDateString('pt-BR')} - ${new Date(viagem.data_fim).toLocaleDateString('pt-BR')}`,
        status: new Date(viagem.data_inicio) > new Date() ? 'Agendada' : 'Concluída',
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral do seu negócio de turismo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full overflow-x-auto">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow min-w-[220px] w-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  {/* Barrinha de porcentagem */}
                  <div className="w-full h-2 bg-gray-200 rounded mt-2 mb-1">
                    <div
                      className="h-2 rounded bg-gradient-to-r from-green-400 to-green-600"
                      style={{ width: `${Math.min(Math.abs(stat.percent), 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-green-500 text-sm font-medium">
                      {stat.percent === null ? '—' : (stat.percent > 0 ? '+' : '') + stat.percent + '%'}
                    </span>
                  </div>
                  {/* Texto explicativo */}
                  <div className="text-xs text-gray-500 mt-1">{stat.text}</div>
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
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 w-full">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Viagens Recentes</h3>
          <div className="space-y-4">
            {recentViagens.length > 0 ? recentViagens.map((viagem, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{viagem.participantesLabel}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Globe className="w-4 h-4 mr-1" />
                    {viagem.cidadesNomes}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{viagem.data}</p>
                </div>
                <div className="text-right">
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
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 w-full">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => setShowNovaViagem(true)}>
              <Calendar className="w-5 h-5" />
              Nova Viagem
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => setShowNovoCliente(true)}>
              <Users className="w-5 h-5" />
              Novo Cliente
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
              onClick={() => setShowNovaCidade(true)}>
              <MapPin className="w-5 h-5" />
              Nova Cidade
            </button>
          </div>
          {/* Modais completos para cada ação rápida */}
          <ViagemForm open={showNovaViagem} onOpenChange={setShowNovaViagem} />
          <ClienteForm open={showNovoCliente} onOpenChange={setShowNovoCliente} />
          <CidadeForm open={showNovaCidade} onOpenChange={setShowNovaCidade} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
