import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCidades } from '@/hooks/useCidades';

export function CidadeForm({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess?: () => void }) {
  const { createCidade, refetch } = useCidades();
  const [formData, setFormData] = useState({ nome: '', estado: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createCidade(formData);
      await refetch();
      setFormData({ nome: '', estado: '' });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Erro ao criar cidade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Cidade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nome da Cidade</label>
            <Input
              value={formData.nome}
              onChange={e => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <Input
              value={formData.estado}
              onChange={e => setFormData({ ...formData, estado: e.target.value })}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Salvando...' : 'Criar Cidade'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 