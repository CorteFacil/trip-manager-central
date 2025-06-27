import { useState, useRef } from 'react';
import { Plus, Search, Edit, Trash2, User, Mail, CheckCircle, XCircle, Camera } from 'lucide-react';
import { useParticipantes } from '@/hooks/useParticipantes';
import { supabase } from '@/integrations/supabase/client';
import { useViagens } from '@/hooks/useViagens';
import { useViagemParticipantes } from '@/hooks/useViagemParticipantes';

const ClientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { participantes, loading, createParticipante, updateParticipante, deleteParticipante } = useParticipantes();
  const { viagens } = useViagens();
  const { getViagensByParticipante } = useViagemParticipantes();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    pago: false,
    avatar: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [editIndex, setEditIndex] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [menuParticipante, setMenuParticipante] = useState<any | null>(null);
  const [editAvatarId, setEditAvatarId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const filteredParticipantes = participantes.filter(participante =>
    participante.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    participante.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let avatarUrl = formData.avatar;
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(avatarFile);
        } catch (uploadError) {
          console.error('Erro ao fazer upload do avatar:', uploadError);
          return;
        }
      }
      if (editIndex) {
        await updateParticipante(editIndex, { ...formData, avatar: avatarUrl });
        setEditIndex(null);
      } else {
        await createParticipante({ ...formData, avatar: avatarUrl });
      }
      setFormData({ nome: '', email: '', pago: false, avatar: '' });
      setShowForm(false);
      setAvatarFile(null);
    } catch (error) {
      console.error('Erro ao salvar participante:', error);
    }
  };

  const togglePagamento = async (id: string, pago: boolean) => {
    try {
      await updateParticipante(id, { pago: !pago });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
    }
  };

  async function uploadAvatar(file: File, pathPrefix = 'participantes'): Promise<string> {
    if (!file) {
      throw new Error('Nenhum arquivo selecionado para upload.');
    }
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError);
      throw uploadError;
    }
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    if (!urlData) {
      throw new Error('Erro ao buscar URL pública');
    }
    return urlData.publicUrl;
  }

  // Handler para alteração de avatar diretamente pelo card
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file && editAvatarId) {
      try {
        const avatarUrl = await uploadAvatar(file);
        await updateParticipante(editAvatarId, { avatar: avatarUrl });
      } catch (error) {
        console.error('Erro ao atualizar avatar:', error);
      } finally {
        setEditAvatarId(null);
        // Limpa o input para permitir novo upload do mesmo arquivo se necessário
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-poppins font-semibold text-gray-800">Gestão de Clientes</h2>
          <p className="text-[#95c11f] font-poppins italic mt-1">Gerencie participantes e seus pagamentos</p>
        </div>
        <button 
          onClick={() => {
            setShowForm(true);
            setFormData({ nome: '', email: '', pago: false, avatar: '' });
            setAvatarFile(null);
            setEditIndex(null);
          }}
          className="bg-black hover:bg-gray-900 text-white px-6 py-3 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar clientes por nome ou email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Input global para alteração de avatar pelo card */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        style={{ display: 'none' }}
        onChange={editAvatarId ? handleAvatarChange : undefined}
        ref={fileInputRef}
      />

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Novo Cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-4">
                <div className="relative">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
                      {avatarFile ? (
                        <img src={URL.createObjectURL(avatarFile)} alt="Prévia do avatar" className="w-full h-full object-cover" />
                      ) : formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      <span className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow cursor-pointer border border-gray-200">
                        <Camera className="w-5 h-5 text-gray-500" />
                      </span>
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => setAvatarFile(e.target.files[0])}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">Clique para adicionar foto</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="pago"
                    checked={formData.pago}
                    onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                    className="peer appearance-none h-5 w-5 border border-gray-300 mr-2 align-middle checked:bg-[#95c11f] checked:border-[#95c11f] focus:outline-none focus:ring-2 focus:ring-[#95c11f]"
                  />
                  <svg className="absolute w-5 h-5 pointer-events-none select-none fill-none stroke-white stroke-2 hidden peer-checked:block" viewBox="0 0 24 24">
                    <polyline points="20 6 10 18 4 12" />
                  </svg>
                  <span className="ml-2 block text-sm text-gray-900">Pagamento realizado</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-900"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredParticipantes.map((participante) => {
          return (
            <div key={participante.id} className="bg-white shadow-sm border border-gray-100 p-4 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center" style={{ width: 48, height: 48 }}>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {participante.avatar ? (
                        <img
                          src={participante.avatar}
                          alt={participante.nome}
                          className="w-full h-full object-cover rounded-full cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            setShowMenu(participante.id);
                            setMenuParticipante(participante);
                          }}
                        />
                      ) : (
                        <User className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    {participante.avatar && (
                      <span className="absolute bottom-[-4px] right-[-4px] bg-white rounded-full p-0.5 shadow border border-gray-200 z-20">
                        <Camera className="w-3.5 h-3.5 text-gray-500" />
                      </span>
                    )}
                    {/* Popover de opções de foto, ancorado ao avatar, sobrepondo o card */}
                    {showMenu === participante.id && menuParticipante && (
                      <>
                        {/* Backdrop transparente para fechar o popover ao clicar fora */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => { setShowMenu(null); setMenuParticipante(null); }}
                          style={{ background: 'transparent' }}
                        />
                        <div
                          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-white border rounded shadow-lg py-1 w-40 flex flex-col text-sm z-50"
                          style={{ minWidth: '150px' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            className="w-full px-4 py-2 rounded text-blue-600 hover:bg-blue-50 text-left"
                            onClick={() => {
                              window.open(menuParticipante.avatar, '_blank');
                              setShowMenu(null); setMenuParticipante(null);
                            }}
                          >Visualizar foto</button>
                          <button
                            className="w-full px-4 py-2 rounded text-gray-700 hover:bg-gray-100 text-left"
                            onClick={() => {
                              setShowMenu(null); setEditAvatarId(menuParticipante.id); setMenuParticipante(null);
                              fileInputRef.current?.click();
                            }}
                          >Alterar foto</button>
                          <button
                            className="w-full px-4 py-2 rounded text-red-600 hover:bg-red-50 text-left"
                            onClick={() => { setShowMenu(null); setMenuParticipante(null); }}
                          >Cancelar</button>
                        </div>
                      </>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{participante.nome}</h3>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <Mail className="w-4 h-4 mr-1" />
                      {participante.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => togglePagamento(participante.id, participante.pago)}
                  className={`p-2 rounded-full transition-colors ${
                    participante.pago 
                      ? 'bg-[#95c11f]/20 text-[#95c11f] hover:bg-[#95c11f]/30' 
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                >
                  {participante.pago ? (
                    <CheckCircle className="w-5 h-5 text-[#95c11f]" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </button>
              </div>

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  participante.pago 
                    ? 'bg-[#95c11f]/20 text-[#95c11f]' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {participante.pago ? 'Pago' : 'Pendente'}
                </span>
              </div>

              {/* Viagens do participante */}
              <div className="mt-2 min-h-[60px] flex flex-col justify-center">
                {(() => {
                  const viagensDoParticipante = viagens.filter(v => getViagensByParticipante(participante.id).includes(v.id));
                  const viagensOrdenadas = viagensDoParticipante.sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime());
                  const mostrarTodas = expandedCard === participante.id;
                  const viagensVisiveis = mostrarTodas ? viagensOrdenadas : viagensOrdenadas.slice(0, 3);
                  const viagensOcultas = viagensOrdenadas.length - viagensVisiveis.length;
                  return viagensOrdenadas.length > 0 ? (
                    <>
                      <div className="text-xs text-gray-500 mb-1">Viagens:</div>
                      <ul className="flex flex-wrap gap-2">
                        {viagensVisiveis.map(v => (
                          <li key={v.id} className="bg-gray-100 px-2 py-1 text-xs">
                            {v.cidade?.nome ? `${v.cidade.nome}` : 'Viagem'}
                            {v.data_inicio ? ` (${new Date(v.data_inicio).toLocaleDateString('pt-BR')}` : ''}
                            {v.data_fim ? ` - ${new Date(v.data_fim).toLocaleDateString('pt-BR')})` : v.data_inicio ? ')' : ''}
                          </li>
                        ))}
                        {!mostrarTodas && viagensOcultas > 0 && (
                          <li>
                            <button
                              className="bg-gray-200 rounded px-2 py-1 text-xs text-blue-600 hover:bg-gray-300"
                              onClick={() => setExpandedCard(participante.id)}
                            >
                              +{viagensOcultas} viagem{viagensOcultas > 1 ? 's' : ''}
                            </button>
                          </li>
                        )}
                        {mostrarTodas && viagensOcultas > 0 && (
                          <li>
                            <button
                              className="bg-gray-200 rounded px-2 py-1 text-xs text-blue-600 hover:bg-gray-300"
                              onClick={() => setExpandedCard(null)}
                            >
                              Mostrar menos
                            </button>
                          </li>
                        )}
                      </ul>
                    </>
                  ) : (
                    <div className="text-xs text-gray-400">Nenhuma viagem cadastrada</div>
                  );
                })()}
              </div>

              <div className="flex gap-2 mt-auto pt-4">
                <button
                  className="flex-1 bg-[#95c11f]/20 hover:bg-[#95c11f]/30 text-black px-4 py-2 flex items-center justify-center gap-2 transition-colors"
                  onClick={() => {
                    setShowForm(true);
                    setFormData({
                      nome: participante.nome,
                      email: participante.email,
                      pago: participante.pago,
                      avatar: participante.avatar || ''
                    });
                    setAvatarFile(null);
                    setEditIndex(participante.id);
                  }}
                >
                  <Edit className="w-4 h-4 text-black" />
                  Editar
                </button>
                <button
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 flex items-center justify-center gap-2 transition-colors"
                  onClick={async () => {
                    if (window.confirm('Tem certeza que deseja excluir este participante?')) {
                      try {
                        await deleteParticipante(participante.id);
                      } catch (error) {
                        console.error('Erro ao excluir participante:', error);
                      }
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClientManagement;
