import { useState, useEffect, useRef } from 'react';
import { useViagens } from '@/hooks/useViagens';
import { useParticipantes } from '@/hooks/useParticipantes';
import { useGuias } from '@/hooks/useGuias';
import { usePontosTuristicos } from '@/hooks/usePontosTuristicos';
import { useRoteiros } from '@/hooks/useRoteiros';
import { useCidades } from '@/hooks/useCidades';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, MapPin, Calendar, Users, Trash2, X, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog as Modal, DialogContent as ModalContent, DialogHeader as ModalHeader, DialogTitle as ModalTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useViagemParticipantes } from '@/hooks/useViagemParticipantes';
import { useViagemCidades } from '@/hooks/useViagemCidades';
import { useIsMobile } from '@/hooks/use-mobile';

const TravelManagement = () => {
  const { viagens, loading: viagensLoading, createViagem, deleteViagem, updateViagem, refetch } = useViagens();
  const { participantes } = useParticipantes();
  const { guias } = useGuias();
  const { pontos } = usePontosTuristicos();
  const { roteiros, createRoteiro, deleteRoteiro } = useRoteiros();
  const { cidades } = useCidades();
  const { viagemParticipantes, addParticipanteToViagem, removeParticipanteFromViagem, getParticipantesByViagem, fetchViagemParticipantes } = useViagemParticipantes();
  const { viagemCidades, addCidadeToViagem, removeCidadeFromViagem, getCidadesByViagem, fetchViagemCidades } = useViagemCidades();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    participantes_id: [] as string[],
    cidades_id: [] as string[],
    guia_turistico_id: '',
    data_inicio: '',
    data_fim: '',
    imagem: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [cidadeAddError, setCidadeAddError] = useState('');
  const [editViagem, setEditViagem] = useState(null);
  const [isParticipantesModalOpen, setIsParticipantesModalOpen] = useState(false);
  const [participantesModalViagem, setParticipantesModalViagem] = useState(null);
  const [showOutrosPontosId, setShowOutrosPontosId] = useState(null);
  const [outrosPontosSearch, setOutrosPontosSearch] = useState('');
  const [outrosPontosCidadeSearch, setOutrosPontosCidadeSearch] = useState('');
  const [outrosPontosEstadoSearch, setOutrosPontosEstadoSearch] = useState('');
  const [imagemFile, setImagemFile] = useState(null);
  const [refreshParticipantesModal, setRefreshParticipantesModal] = useState(0);
  const [expandedCards, setExpandedCards] = useState<{ [id: string]: boolean }>({});
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const popoverRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const popoverButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setCidadeAddError('');
    if (!formData.guia_turistico_id) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    try {
      let imagemUrl = formData.imagem;
      if (imagemFile) {
        try {
          imagemUrl = await uploadImage(imagemFile);
        } catch (uploadError) {
          toast.error('Erro ao fazer upload da imagem.');
          console.error('Erro ao fazer upload da imagem:', uploadError);
          return;
        }
      }

      let viagemId = '';
      if (editViagem) {
        await updateViagem(editViagem.id, {
          guia_turistico_id: formData.guia_turistico_id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          imagem: imagemUrl
        });
        viagemId = editViagem.id;
        setEditViagem(null);
        setIsDialogOpen(false);
        await refetch();
      } else {
        const novaViagemResult = await createViagem({
          guia_turistico_id: formData.guia_turistico_id,
          data_inicio: formData.data_inicio,
          data_fim: formData.data_fim,
          imagem: imagemUrl
        } as any);
        viagemId = (novaViagemResult as any).id || (novaViagemResult as any).data?.id;
        await refetch();
      }

      // --- RELAÇÕES PARTICIPANTES ---
      await supabase.from('viagem_participante').delete().eq('viagem_id', viagemId);
      if (formData.participantes_id.length > 0) {
        const participantesToInsert = formData.participantes_id.map((participante_id: string) => ({
          viagem_id: viagemId,
          participante_id,
        }));
        await supabase.from('viagem_participante').insert(participantesToInsert);
      }

      // --- RELAÇÕES CIDADES ---
      await supabase.from('viagem_cidade').delete().eq('viagem_id', viagemId);
      if (formData.cidades_id.length > 0) {
        const cidadesToInsert = formData.cidades_id.map((cidade_id: string) => ({
          viagem_id: viagemId,
          cidade_id,
        }));
        await supabase.from('viagem_cidade').insert(cidadesToInsert);
      }

      // Atualiza os hooks de relação para refletir na tela
      await fetchViagemParticipantes();
      await fetchViagemCidades();

      toast.success(editViagem ? 'Viagem atualizada com sucesso!' : 'Viagem criada com sucesso!');
      setFormData({
        participantes_id: [],
        cidades_id: [],
        guia_turistico_id: '',
        data_inicio: '',
        data_fim: '',
        imagem: ''
      });
      setSelectedParticipante('');
      setSelectedCidade('');
      setImagemFile(null);
    } catch (error) {
      toast.error(editViagem ? 'Erro ao atualizar viagem' : 'Erro ao criar viagem');
      console.error(error);
    }
  };

  const handleAddPontoToRoteiro = async (viagemId: string, pontoId: string) => {
    try {
      const viagemRoteiros = roteiros.filter(r => r.viagem_id === viagemId);
      const nextOrdem = viagemRoteiros.length + 1;
      
      await createRoteiro({
        viagem_id: viagemId,
        ponto_turistico_id: pontoId,
        ordem: nextOrdem
      });
      
      toast.success('Ponto adicionado ao roteiro!');
    } catch (error) {
      toast.error('Erro ao adicionar ponto ao roteiro');
    }
  };

  const handleRemovePontoFromRoteiro = async (viagemId: string, pontoId: string) => {
    try {
      await deleteRoteiro(viagemId, pontoId);
      toast.success('Ponto removido do roteiro!');
    } catch (error) {
      toast.error('Erro ao remover ponto do roteiro');
    }
  };

  const getViagemRoteiros = (viagemId: string) => {
    return roteiros.filter(r => r.viagem_id === viagemId).sort((a, b) => a.ordem - b.ordem);
  };

  const handleEditViagem = (viagem: any) => {
    setEditViagem(viagem);
    setFormData({
      participantes_id: getParticipantesByViagem(viagem.id),
      cidades_id: getCidadesByViagem(viagem.id),
      guia_turistico_id: viagem.guia_turistico_id || '',
      data_inicio: viagem.data_inicio || '',
      data_fim: viagem.data_fim || '',
      imagem: viagem.imagem || ''
    });
    setSelectedParticipante('');
    setSelectedCidade('');
    setIsDialogOpen(true);
  };

  const handleDeleteViagem = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta viagem?')) {
      try {
        // Exclui relações antes de excluir a viagem
        await supabase.from('viagem_participante').delete().eq('viagem_id', id);
        await supabase.from('viagem_cidade').delete().eq('viagem_id', id);
        await deleteViagem(id);
        await refetch();
        await fetchViagemParticipantes();
        await fetchViagemCidades();
        toast.success('Viagem excluída com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir viagem');
      }
    }
  };

  const handleOpenParticipantesModal = (viagem) => {
    setParticipantesModalViagem(viagem);
    setIsParticipantesModalOpen(true);
  };

  async function uploadImage(file: File, pathPrefix = 'viagens'): Promise<string> {
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!openPopoverId) return;
      const popover = popoverRefs.current[openPopoverId];
      const button = popoverButtonRefs.current[openPopoverId];
      if (
        (popover && popover.contains(event.target as Node)) ||
        (button && button.contains(event.target as Node))
      ) {
        return;
      }
      setOpenPopoverId(null);
    }
    if (openPopoverId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPopoverId]);

  if (viagensLoading) {
    return <div>Carregando viagens...</div>;
  }

  return (
    <div className="space-y-6 mx-8 lg:ml-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <h2 className="text-3xl font-poppins font-semibold text-gray-800">Gestão de Viagens</h2>
          <p className="text-[#95c11f] font-poppins italic">Gerencie viagens, participantes e cidades</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setEditViagem(null); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {editViagem ? 'Editar Viagem' : 'Nova Viagem'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[70vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editViagem ? 'Editar Viagem' : 'Criar Nova Viagem'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Participante</label>
                <div className="flex gap-2 items-center mb-2">
                  <select
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-base rounded-none"
                    value={selectedParticipante}
                    onChange={e => setSelectedParticipante(e.target.value)}
                  >
                    <option value="">Selecione um participante</option>
                    {participantes.length === 0 ? (
                      <option disabled>Carregando participantes...</option>
                    ) : participantes.map(participante => (
                      <option key={participante.id} value={participante.id}>
                        {participante.nome} - {participante.email}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="bg-[#95c11f] text-white px-3 py-2 text-sm rounded-none"
                    onClick={() => {
                      if (selectedParticipante && !formData.participantes_id.includes(selectedParticipante)) {
                        setFormData(prev => ({
                          ...prev,
                          participantes_id: [...prev.participantes_id, selectedParticipante]
                        }));
                        setSelectedParticipante('');
                      }
                    }}
                    disabled={!selectedParticipante || formData.participantes_id.includes(selectedParticipante)}
                  >Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.participantes_id.map(pid => {
                    const p = participantes.find(x => x.id === pid);
                    if (!p) return null;
                    return (
                      <span key={pid} className="bg-gray-200 rounded-none px-2 py-1 flex items-center gap-1">
                        {p.nome}
                        <button
                          type="button"
                          className="ml-1 text-red-500"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            participantes_id: prev.participantes_id.filter(id => id !== pid)
                          }))}
                        >x</button>
                      </span>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Guia Turístico</label>
                <select
                  className="flex h-10 w-full border border-input bg-background px-3 py-2 text-base rounded-none"
                  value={formData.guia_turistico_id}
                  onChange={e => setFormData({ ...formData, guia_turistico_id: e.target.value })}
                  required
                >
                  <option value="">Selecione um guia</option>
                  {guias.map(guia => (
                    <option key={guia.id} value={guia.id}>
                      {guia.nome} - {guia.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <div className="flex gap-2 items-center mb-2">
                  <select
                    className="flex h-10 w-full border border-input bg-background px-3 py-2 text-base rounded-none"
                    value={selectedCidade}
                    onChange={e => setSelectedCidade(e.target.value)}
                    required={!formData.cidades_id.length}
                  >
                    <option value="">Selecione uma cidade</option>
                    {cidades.length === 0 ? (
                      <option disabled>Carregando cidades...</option>
                    ) : cidades.map(cidade => (
                      <option key={cidade.id} value={cidade.id}>
                        {cidade.nome} - {cidade.estado}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="bg-[#95c11f] text-white px-3 py-2 text-sm rounded-none"
                    onClick={() => {
                      if (selectedCidade && !formData.cidades_id.includes(selectedCidade)) {
                        setFormData({
                          ...formData,
                          cidades_id: [...formData.cidades_id, selectedCidade]
                        });
                        setSelectedCidade('');
                      }
                    }}
                    disabled={!selectedCidade || formData.cidades_id.includes(selectedCidade)}
                  >Adicionar</button>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.cidades_id.map(cid => {
                    const c = cidades.find(x => x.id === cid);
                    if (!c) return null;
                    return (
                      <span key={cid} className="bg-gray-200 rounded-none px-2 py-1 flex items-center gap-1">
                        {c.nome}
                        <button
                          type="button"
                          className="ml-1 text-red-500"
                          onClick={() => setFormData({
                            ...formData,
                            cidades_id: formData.cidades_id.filter(id => id !== cid)
                          })}
                        >x</button>
                      </span>
                    );
                  })}
                </div>
                {cidadeAddError && !formData.cidades_id.length && (
                  <span className="text-red-500 text-xs">{cidadeAddError}</span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data de Início</label>
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data de Fim</label>
                <Input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Imagem da Viagem</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImagemFile(e.target.files[0])}
                />
                {formData.imagem && (
                  <img src={formData.imagem} alt="Imagem da viagem" className="w-full h-32 object-cover rounded mt-2" />
                )}
              </div>
              <Button type="submit" className="w-full">{editViagem ? 'Salvar Alterações' : 'Criar Viagem'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-stretch px-0">
        {viagens.map((viagem) => {
          const cidadesViagem = getCidadesByViagem(viagem.id);
          const isExpanded = !!expandedCards[viagem.id];
          const cidadesToShow = isExpanded ? cidadesViagem : cidadesViagem.slice(0, 1);
          return (
            <Card key={viagem.id} className="w-full flex flex-col shadow-2xl border border-gray-100 p-0 rounded-none transition-all duration-3000 ease-in-out hover:shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:-translate-y-2 hover:opacity-90 bg-white">
              {/* Imagem da viagem */}
              <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
                {viagem.imagem ? (
                  <img src={viagem.imagem} alt="Imagem da viagem" className="object-cover w-full h-full" />
                ) : (
                  <span className="text-gray-400">Sem imagem</span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                {/* Data */}
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(viagem.data_inicio), 'dd/MM/yyyy')} - {format(new Date(viagem.data_fim), 'dd/MM/yyyy')}
                </div>
                {/* Cidades */}
                <div className="flex flex-wrap gap-1 items-center min-h-[32px] relative">
                  {cidadesToShow.map(cid => {
                    const c = cidades.find(x => x.id === cid);
                    return c ? (
                      <Badge key={cid} variant="outline">{c.nome}</Badge>
                    ) : null;
                  })}
                  {cidadesViagem.length > 1 && (
                    <div className="relative inline-block">
                      <button
                        ref={el => (popoverButtonRefs.current[viagem.id] = el)}
                        className="peer text-xs font-bold text-[#38bdf8] ml-2 rounded-none px-2 py-1 transition"
                        style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', outline: 'none', border: 'none' }}
                        onClick={e => {
                          e.stopPropagation();
                          setOpenPopoverId(openPopoverId === viagem.id ? null : viagem.id);
                        }}
                      >
                        Mostrar mais
                      </button>
                      {openPopoverId === viagem.id && (
                        <div
                          ref={el => (popoverRefs.current[viagem.id] = el)}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-white border border-gray-200 shadow-lg rounded-none p-2 min-w-[160px] flex flex-col items-start animate-fade-in transition-all duration-700 ease-in-out"
                        >
                          <div className="absolute left-1/2 translate-x-[-50%] bottom-[-8px] w-4 h-4 overflow-hidden">
                            <div className="w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45 mx-auto"></div>
                          </div>
                          {cidadesViagem.map(cid => {
                            const c = cidades.find(x => x.id === cid);
                            return c ? (
                              <span key={cid} className="block px-2 py-1 text-sm text-gray-700 w-full text-left">{c.nome}</span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Botões em coluna */}
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <Button
                    className="w-full bg-gray-200/70 text-black hover:bg-gray-300 rounded-none flex items-center justify-center gap-2"
                    onClick={() => handleOpenParticipantesModal(viagem)}
                  >
                    <Users className="w-4 h-4" />
                    Visualizar Participantes
                  </Button>
                  <Button
                    className="w-full bg-black text-white hover:bg-gray-900 rounded-none flex items-center justify-center gap-2"
                    onClick={() => setSelectedViagem(viagem.id)}
                  >
                    <MapPin className="w-4 h-4" />
                    Gerenciar Roteiro
                  </Button>
                  <div className="flex gap-2 w-full">
                    <Button
                      className="w-1/2 bg-[#95c11f]/30 text-[#95c11f] hover:bg-[#95c11f]/50 rounded-none flex items-center justify-center gap-2"
                      onClick={() => handleEditViagem(viagem)}
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                    <Button
                      className="w-1/2 bg-red-500/20 text-red-600 hover:bg-red-500/40 rounded-none flex items-center justify-center gap-2"
                      onClick={() => handleDeleteViagem(viagem.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {viagens.length === 0 && (
          <Card className="p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma viagem encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando sua primeira viagem</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira viagem
            </Button>
          </Card>
        )}
      </div>

      <Modal open={isParticipantesModalOpen} onOpenChange={setIsParticipantesModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Gerenciar Participantes</ModalTitle>
          </ModalHeader>
          {participantesModalViagem && (
            <>
              <div className="mb-4">
                <div className="font-semibold mb-2">Participantes da viagem:</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {getParticipantesByViagem(participantesModalViagem.id).map(pid => {
                    const p = participantes.find(x => x.id === pid);
                    if (!p) return null;
                    return (
                      <span key={pid} className="bg-gray-200 rounded px-2 py-1 flex items-center gap-1">
                        {p.nome}
                        <button
                          type="button"
                          className="ml-1 text-red-500"
                          onClick={async () => {
                            await removeParticipanteFromViagem(participantesModalViagem.id, pid);
                            await fetchViagemParticipantes();
                          }}
                        >-</button>
                      </span>
                    );
                  })}
                  {getParticipantesByViagem(participantesModalViagem.id).length === 0 && (
                    <span className="text-gray-500">Nenhum participante na viagem.</span>
                  )}
                </div>
              </div>
              <div>
                <div className="font-semibold mb-2">Participantes cadastrados:</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {participantes.filter(p => !getParticipantesByViagem(participantesModalViagem.id).includes(p.id)).map(p => (
                    <span key={p.id} className="bg-gray-100 rounded px-2 py-1 flex items-center gap-1">
                      {p.nome}
                      <button
                        type="button"
                        className="ml-1 text-green-600 font-bold"
                        onClick={async () => {
                          await addParticipanteToViagem(participantesModalViagem.id, p.id);
                          await fetchViagemParticipantes();
                        }}
                      >+</button>
                    </span>
                  ))}
                  {participantes.length === 0 && (
                    <span className="text-gray-500">Carregando participantes...</span>
                  )}
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de Gerenciamento de Roteiro */}
      {selectedViagem && (
        <Modal open={!!selectedViagem} onOpenChange={(open) => { if (!open) setSelectedViagem(null); }}>
          <ModalContent className="max-w-2xl">
            <ModalHeader className="flex flex-row items-center justify-between">
              <ModalTitle>Gerenciar Roteiro</ModalTitle>
            </ModalHeader>
            {/* Filtros */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Cidade</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1"
                  placeholder="Buscar cidade..."
                  value={outrosPontosCidadeSearch}
                  onChange={e => setOutrosPontosCidadeSearch(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Estado</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1"
                  placeholder="Buscar estado..."
                  value={outrosPontosEstadoSearch}
                  onChange={e => setOutrosPontosEstadoSearch(e.target.value)}
                />
              </div>
            </div>
            {/* Pontos turísticos relacionados */}
            <div>
              <div className="font-semibold mb-2">Pontos turísticos das cidades da viagem</div>
              <div className="flex flex-wrap gap-2 mb-2 max-h-64 overflow-y-auto pr-2">
                {(() => {
                  const cidadesViagem = getCidadesByViagem(selectedViagem);
                  const pontosRelacionados = pontos.filter(p => cidadesViagem.includes(p.cidade_id));
                  if (pontosRelacionados.length === 0) return <span className="text-gray-500">Nenhum ponto turístico relacionado.</span>;
                  return pontosRelacionados.map(p => {
                    const jaNoRoteiro = getViagemRoteiros(selectedViagem).some(r => r.ponto_turistico_id === p.id);
                    const cidade = cidades.find(c => c.id === p.cidade_id);
                    // Filtro de escrita
                    if (outrosPontosCidadeSearch && cidade && !cidade.nome.toLowerCase().includes(outrosPontosCidadeSearch.toLowerCase())) return null;
                    if (outrosPontosEstadoSearch && cidade && !cidade.estado.toLowerCase().includes(outrosPontosEstadoSearch.toLowerCase())) return null;
                    return (
                      <span key={p.id} className="bg-gray-100 rounded px-2 py-1 flex items-center gap-1">
                        {p.nome}
                        {jaNoRoteiro ? (
                          <button className="ml-1 text-red-500" onClick={() => handleRemovePontoFromRoteiro(selectedViagem, p.id)}>-</button>
                        ) : (
                          <button className="ml-1 text-green-600 font-bold" onClick={() => handleAddPontoToRoteiro(selectedViagem, p.id)}>+</button>
                        )}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
            {/* Mostrar mais pontos turísticos */}
            <div className="mt-4">
              <button
                className="text-blue-600 underline mb-2"
                onClick={() => setShowOutrosPontosId(selectedViagem)}
                disabled={showOutrosPontosId === selectedViagem}
              >
                Mostrar mais pontos turísticos
              </button>
              {showOutrosPontosId === selectedViagem && (
                <div>
                  <div className="font-semibold mb-2">Outros pontos turísticos</div>
                  <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2">
                    {(() => {
                      let outros = pontos.filter(p => {
                        const cidade = cidades.find(c => c.id === p.cidade_id);
                        // Filtro de escrita
                        if (outrosPontosCidadeSearch && cidade && !cidade.nome.toLowerCase().includes(outrosPontosCidadeSearch.toLowerCase())) return false;
                        if (outrosPontosEstadoSearch && cidade && !cidade.estado.toLowerCase().includes(outrosPontosEstadoSearch.toLowerCase())) return false;
                        // Não mostrar os já relacionados
                        const cidadesViagem = getCidadesByViagem(selectedViagem);
                        if (cidadesViagem.includes(p.cidade_id)) return false;
                        return true;
                      });
                      if (outros.length === 0) return <span className="text-gray-500">Nenhum ponto turístico encontrado.</span>;
                      return outros.map(p => {
                        const jaNoRoteiro = getViagemRoteiros(selectedViagem).some(r => r.ponto_turistico_id === p.id);
                        return (
                          <span key={p.id} className="bg-gray-100 rounded px-2 py-1 flex items-center gap-1">
                            {p.nome}
                            {jaNoRoteiro ? (
                              <button className="ml-1 text-red-500" onClick={() => handleRemovePontoFromRoteiro(selectedViagem, p.id)}>-</button>
                            ) : (
                              <button className="ml-1 text-green-600 font-bold" onClick={() => handleAddPontoToRoteiro(selectedViagem, p.id)}>+</button>
                            )}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default TravelManagement;
