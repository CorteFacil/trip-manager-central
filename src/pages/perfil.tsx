import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PerfilPage = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setError('Erro ao carregar usuário.');
        setLoading(false);
        return;
      }
      setNome(data.user.user_metadata?.nome || '');
      setEmail(data.user.email || '');
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    // Atualiza nome no user_metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: { nome }
    });
    // Atualiza email se mudou
    let emailError = null;
    if (email) {
      const { error: emailUpdateError } = await supabase.auth.updateUser({ email });
      if (emailUpdateError) emailError = emailUpdateError;
    }
    setLoading(false);
    if (metaError || emailError) {
      setError('Erro ao atualizar perfil.');
    } else {
      setSuccess('Perfil atualizado com sucesso!');
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md mx-auto">
        <button
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg shadow hover:bg-blue-200 transition-colors"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Editar Perfil</h1>
        <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 w-full space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default PerfilPage; 