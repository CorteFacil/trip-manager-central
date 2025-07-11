import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { User, Camera } from 'lucide-react';
import { useParticipantes } from '@/hooks/useParticipantes';
import { supabase } from '@/integrations/supabase/client';

export function ClienteForm({ open, onOpenChange, onSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onSuccess?: () => void }) {
  const { createParticipante, refetch } = useParticipantes();
  const [formData, setFormData] = useState({ nome: '', email: '', pago: false, avatar: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadAvatar(file: File, pathPrefix = 'participantes'): Promise<string> {
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
      let avatarUrl = formData.avatar;
      if (avatarFile) avatarUrl = await uploadAvatar(avatarFile);
      await createParticipante({ ...formData, avatar: avatarUrl });
      await refetch?.();
      setFormData({ nome: '', email: '', pago: false, avatar: '' });
      setAvatarFile(null);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError('Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
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
                ref={fileInputRef}
                onChange={e => setAvatarFile(e.target.files?.[0] || null)}
              />
            </div>
            <span className="text-xs text-gray-500 mt-1">Clique para adicionar foto</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <Input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="rounded-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-none"
            />
          </div>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="pago"
                checked={formData.pago}
                onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                className="peer appearance-none h-5 w-5 border border-gray-300 mr-2 align-middle checked:bg-[#95c11f] checked:border-[#95c11f] focus:outline-none focus:ring-2 focus:ring-[#95c11f] rounded-none"
              />
              <svg className="absolute w-5 h-5 pointer-events-none select-none fill-none stroke-white stroke-2 hidden peer-checked:block" viewBox="0 0 24 24">
                <polyline points="20 6 10 18 4 12" />
              </svg>
              <span className="ml-2 block text-sm text-gray-900">Pagamento realizado</span>
            </label>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={() => onOpenChange(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none bg-white">
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-900 rounded-none" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 