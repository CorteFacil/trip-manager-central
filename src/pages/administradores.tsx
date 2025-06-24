import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AdministradoresPage = () => {
  const [admins, setAdmins] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchAdmins();
    fetchCurrentUser();
  }, []);

  async function fetchAdmins() {
    const { data, error } = await supabase.from('administrador').select('*');
    if (!error) setAdmins(data || []);
    if (error) setError('Erro ao buscar administradores: ' + error.message);
  }

  async function fetchCurrentUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) setUserId(data.user.id);
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(''); setError(''); setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: { data: { nome } }
    });
    if (!signUpError && data?.user) {
      await supabase.from('administrador').insert([
        { id: data.user.id, nome, email }
      ]);
    }
    setLoading(false);
    if (signUpError) {
      setError('Erro ao criar administrador: ' + signUpError.message);
    } else {
      setSuccess('Administrador criado!');
      setNome(''); setEmail(''); setSenha('');
      fetchAdmins();
    }
  }

  async function handleRemoveAdmin(id: string) {
    if (id === userId) {
      setError('Você não pode remover a si mesmo.');
      return;
    }
    if (!window.confirm('Tem certeza que deseja remover este administrador?')) {
      return;
    }
    setSuccess(''); setError(''); setLoading(true);
    // Remove do Auth e da tabela via função RPC
    // @ts-ignore
    const { error } = await supabase.rpc('delete_user_and_admin', { uid: id });
    setLoading(false);
    if (error) {
      setError('Erro ao remover administrador: ' + error.message);
    } else {
      setSuccess('Administrador removido!');
      fetchAdmins();
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md mx-auto">
        <button
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg shadow hover:bg-blue-200 transition-colors"
          onClick={() => window.location.href = '/'}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Voltar</span>
        </button>
        <h1 className="text-3xl font-bold mb-4 text-center">Administradores</h1>
        <form onSubmit={handleAddAdmin} className="bg-white rounded-lg shadow p-6 w-full space-y-4 mb-8">
          <div className="font-semibold mb-2">Adicionar novo administrador</div>
          <div>
            <label className="block text-sm font-medium mb-1">Nome</label>
            <input type="text" className="w-full border rounded px-3 py-2" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" className="w-full border rounded px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input type="password" className="w-full border rounded px-3 py-2" value={senha} onChange={e => setSenha(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Adicionando...' : 'Adicionar'}</Button>
          {success && <div className="text-green-600 text-sm text-center">{success}</div>}
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        </form>
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <div className="font-semibold mb-2">Lista de administradores</div>
          <div className="space-y-2">
            {admins.map((admin: any) => (
              <div key={admin.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
                <div>
                  <div className="font-medium">{admin.nome}</div>
                  <div className="text-xs text-gray-600">{admin.email}</div>
                </div>
                {admin.id !== userId && (
                  <Button variant="destructive" size="sm" onClick={() => handleRemoveAdmin(admin.id)}>
                    Remover
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministradoresPage; 