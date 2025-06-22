
import { useState } from 'react';
import { useCidades } from '@/hooks/useCidades';
import { usePontosTuristicos } from '@/hooks/usePontosTuristicos';
import { useGuias } from '@/hooks/useGuias';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, MapPin, Users, Building } from 'lucide-react';

const BookingManagement = () => {
  const { cidades, loading: cidadesLoading, createCidade } = useCidades();
  const { pontos, loading: pontosLoading, createPonto } = usePontosTuristicos();
  const { guias, loading: guiasLoading, createGuia } = useGuias();
  
  const [isCidadeDialogOpen, setIsCidadeDialogOpen] = useState(false);
  const [isPontoDialogOpen, setIsPontoDialogOpen] = useState(false);
  const [isGuiaDialogOpen, setIsGuiaDialogOpen] = useState(false);
  
  const [cidadeForm, setCidadeForm] = useState({
    nome: '',
    estado: ''
  });

  const [pontoForm, setPontoForm] = useState({
    nome: '',
    descricao: '',
    cidade_id: ''
  });

  const [guiaForm, setGuiaForm] = useState({
    nome: '',
    email: '',
    contratado_em: ''
  });

  const handleCreateCidade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createCidade(cidadeForm);
      toast.success('Cidade criada com sucesso!');
      setCidadeForm({ nome: '', estado: '' });
      setIsCidadeDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar cidade');
    }
  };

  const handleCreatePonto = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createPonto({
        nome: pontoForm.nome,
        descricao: pontoForm.descricao || null,
        cidade_id: pontoForm.cidade_id || null
      });
      toast.success('Ponto turístico criado com sucesso!');
      setPontoForm({ nome: '', descricao: '', cidade_id: '' });
      setIsPontoDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar ponto turístico');
    }
  };

  const handleCreateGuia = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createGuia({
        nome: guiaForm.nome,
        email: guiaForm.email,
        contratado_em: guiaForm.contratado_em || null
      });
      toast.success('Guia turístico criado com sucesso!');
      setGuiaForm({ nome: '', email: '', contratado_em: '' });
      setIsGuiaDialogOpen(false);
    } catch (error) {
      toast.error('Erro ao criar guia turístico');
    }
  };

  if (cidadesLoading || pontosLoading || guiasLoading) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestão de Recursos</h1>
        <p className="text-gray-600">Gerencie cidades, pontos turísticos e guias</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cidades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Cidades
                </CardTitle>
                <CardDescription>
                  {cidades.length} cidades cadastradas
                </CardDescription>
              </div>
              <Dialog open={isCi deDialogOpen} onOpenChange={setIsCidadeDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Cidade</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCidade} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome da Cidade</label>
                      <Input
                        value={cidadeForm.nome}
                        onChange={(e) => setCidadeForm({...cidadeForm, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Estado</label>
                      <Input
                        value={cidadeForm.estado}
                        onChange={(e) => setCidadeForm({...cidadeForm, estado: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">Criar Cidade</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cidades.map((cidade) => (
                <div key={cidade.id} className="p-2 border rounded">
                  <p className="font-medium">{cidade.nome}</p>
                  <p className="text-sm text-gray-600">{cidade.estado}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pontos Turísticos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Pontos Turísticos
                </CardTitle>
                <CardDescription>
                  {pontos.length} pontos cadastrados
                </CardDescription>
              </div>
              <Dialog open={isPontoDialogOpen} onOpenChange={setIsPontoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Ponto Turístico</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePonto} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Ponto</label>
                      <Input
                        value={pontoForm.nome}
                        onChange={(e) => setPontoForm({...pontoForm, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição</label>
                      <Textarea
                        value={pontoForm.descricao}
                        onChange={(e) => setPontoForm({...pontoForm, descricao: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cidade</label>
                      <Select value={pontoForm.cidade_id} onValueChange={(value) => setPontoForm({...pontoForm, cidade_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cidades.map((cidade) => (
                            <SelectItem key={cidade.id} value={cidade.id}>
                              {cidade.nome}, {cidade.estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Criar Ponto</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {pontos.map((ponto) => (
                <div key={ponto.id} className="p-2 border rounded">
                  <p className="font-medium">{ponto.nome}</p>
                  {ponto.cidade && (
                    <Badge variant="secondary" className="text-xs">
                      {ponto.cidade.nome}, {ponto.cidade.estado}
                    </Badge>
                  )}
                  {ponto.descricao && (
                    <p className="text-sm text-gray-600 mt-1">{ponto.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Guias Turísticos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Guias Turísticos
                </CardTitle>
                <CardDescription>
                  {guias.length} guias cadastrados
                </CardDescription>
              </div>
              <Dialog open={isGuiaDialogOpen} onOpenChange={setIsGuiaDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Guia Turístico</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateGuia} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Guia</label>
                      <Input
                        value={guiaForm.nome}
                        onChange={(e) => setGuiaForm({...guiaForm, nome: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        type="email"
                        value={guiaForm.email}
                        onChange={(e) => setGuiaForm({...guiaForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Contratação</label>
                      <Input
                        type="date"
                        value={guiaForm.contratado_em}
                        onChange={(e) => setGuiaForm({...guiaForm, contratado_em: e.target.value})}
                      />
                    </div>
                    <Button type="submit" className="w-full">Criar Guia</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {guias.map((guia) => (
                <div key={guia.id} className="p-2 border rounded">
                  <p className="font-medium">{guia.nome}</p>
                  <p className="text-sm text-gray-600">{guia.email}</p>
                  {guia.contratado_em && (
                    <Badge variant="outline" className="text-xs mt-1">
                      Contratado em {new Date(guia.contratado_em).toLocaleDateString('pt-BR')}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingManagement;
