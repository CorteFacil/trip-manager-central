
import { useState } from 'react';
import { useViagens } from '@/hooks/useViagens';
import { useParticipantes } from '@/hooks/useParticipantes';
import { useGuias } from '@/hooks/useGuias';
import { usePontosTuristicos } from '@/hooks/usePontosTuristicos';
import { useRoteiros } from '@/hooks/useRoteiros';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, MapPin, Calendar, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TravelManagement = () => {
  const { viagens, loading: viagensLoading, createViagem } = useViagens();
  const { participantes } = useParticipantes();
  const { guias } = useGuias();
  const { pontos } = usePontosTuristicos();
  const { roteiros, createRoteiro, deleteRoteiro } = useRoteiros();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    participantes_id: '',
    guia_turistico_id: '',
    data_inicio: '',
    data_fim: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createViagem({
        participantes_id: formData.participantes_id || null,
        guia_turistico_id: formData.guia_turistico_id || null,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim
      });
      
      toast.success('Viagem criada com sucesso!');
      setFormData({
        participantes_id: '',
        guia_turistico_id: '',
        data_inicio: '',
        data_fim: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar viagem');
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

  if (viagensLoading) {
    return <div>Carregando viagens...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Viagens</h1>
          <p className="text-gray-600">Gerencie viagens, roteiros e itinerários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Viagem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Viagem</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Participante</label>
                <Select value={formData.participantes_id} onValueChange={(value) => setFormData({...formData, participantes_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um participante" />
                  </SelectTrigger>
                  <SelectContent>
                    {participantes.map((participante) => (
                      <SelectItem key={participante.id} value={participante.id}>
                        {participante.nome} - {participante.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Guia Turístico</label>
                <Select value={formData.guia_turistico_id} onValueChange={(value) => setFormData({...formData, guia_turistico_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um guia" />
                  </SelectTrigger>
                  <SelectContent>
                    {guias.map((guia) => (
                      <SelectItem key={guia.id} value={guia.id}>
                        {guia.nome} - {guia.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="w-full">Criar Viagem</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {viagens.map((viagem) => {
          const viagemRoteiros = getViagemRoteiros(viagem.id);
          
          return (
            <Card key={viagem.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Viagem #{viagem.id.slice(0, 8)}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(viagem.data_inicio), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(viagem.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                    </div>
                    {viagem.participante && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {viagem.participante.nome}
                      </div>
                    )}
                    {viagem.guia_turistico && (
                      <Badge variant="secondary">
                        Guia: {viagem.guia_turistico.nome}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedViagem(selectedViagem === viagem.id ? null : viagem.id)}
                >
                  {selectedViagem === viagem.id ? 'Fechar Roteiro' : 'Gerenciar Roteiro'}
                </Button>
              </div>

              {selectedViagem === viagem.id && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Roteiro Atual</h4>
                    {viagemRoteiros.length > 0 ? (
                      <div className="space-y-2">
                        {viagemRoteiros.map((roteiro, index) => (
                          <div key={`${roteiro.viagem_id}-${roteiro.ponto_turistico_id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{index + 1}</Badge>
                              <div>
                                <p className="font-medium">{roteiro.ponto_turistico?.nome}</p>
                                {roteiro.ponto_turistico?.descricao && (
                                  <p className="text-sm text-gray-600">{roteiro.ponto_turistico.descricao}</p>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePontoFromRoteiro(viagem.id, roteiro.ponto_turistico_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Nenhum ponto no roteiro</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Adicionar Pontos Turísticos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {pontos
                        .filter(ponto => !viagemRoteiros.some(r => r.ponto_turistico_id === ponto.id))
                        .map((ponto) => (
                          <div key={ponto.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <p className="font-medium">{ponto.nome}</p>
                              {ponto.cidade && (
                                <p className="text-sm text-gray-600">{ponto.cidade.nome}, {ponto.cidade.estado}</p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddPontoToRoteiro(viagem.id, ponto.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
};

export default TravelManagement;
