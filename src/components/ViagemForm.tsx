import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useViagens } from '@/hooks/useViagens';
import { useParticipantes } from '@/hooks/useParticipantes';
import { useGuias } from '@/hooks/useGuias';
import { useCidades } from '@/hooks/useCidades';
import { supabase } from '@/integrations/supabase/client';

export function ViagemForm({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess?: () => void }) {
  const { createViagem, refetch } = useViagens();
  const { participantes } = useParticipantes();
  const { guias } = useGuias();
  const { cidades } = useCidades();
  const [formData, setFormData] = useState({
    participantes_id: [] as string[],
    cidades_id: [] as string[],
    guia_turistico_id: '',
    data_inicio: '',
    data_fim: '',
    imagem: ''
  });
  const [selectedParticipante, setSelectedParticipante] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function uploadImage(file: File, pathPrefix = 'viagens'): Promise<string> {
    if (!file) throw new Error('Nenhum arquivo selecionado para upload.');
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
    if (!urlData) throw new Error('Erro ao buscar URL pública');
    return urlData.publicUrl;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let imagemUrl = formData.imagem;
      if (imagemFile) imagemUrl = await uploadImage(imagemFile);
      await createViagem({
        guia_turistico_id: formData.guia_turistico_id,
        data_inicio: formData.data_inicio,
        data_fim: formData.data_fim,
        imagem: imagemUrl
      } as any);
      await refetch();
      setFormData({ participantes_id: [], cidades_id: [], guia_turistico_id: '', data_inicio: '', data_fim: '', imagem: '' });
      setSelectedParticipante('');
      setSelectedCidade('');
      setImagemFile(null);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Erro ao criar viagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Viagem</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Participante</label>
            <div className="flex gap-2 items-center mb-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
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
                className="bg-blue-600 text-white rounded px-3 py-2 text-sm"
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
                  <span key={pid} className="bg-gray-200 rounded px-2 py-1 flex items-center gap-1">
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
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base"
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
                className="bg-blue-600 text-white rounded px-3 py-2 text-sm"
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
                  <span key={cid} className="bg-gray-200 rounded px-2 py-1 flex items-center gap-1">
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
              onChange={e => setImagemFile(e.target.files?.[0] || null)}
            />
            {formData.imagem && (
              <img src={formData.imagem} alt="Imagem da viagem" className="w-full h-32 object-cover rounded mt-2" />
            )}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Salvando...' : 'Criar Viagem'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 