
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Participante {
  id: string;
  nome: string;
  email: string;
  pago: boolean;
  criado_em: string;
}

export const useParticipantes = () => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParticipantes = async () => {
    try {
      const { data, error } = await supabase
        .from('participante')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setParticipantes(data || []);
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createParticipante = async (participante: Omit<Participante, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('participante')
        .insert([participante])
        .select()
        .single();
      
      if (error) throw error;
      setParticipantes(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar participante:', error);
      throw error;
    }
  };

  const updateParticipante = async (id: string, updates: Partial<Participante>) => {
    try {
      const { data, error } = await supabase
        .from('participante')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      setParticipantes(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar participante:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchParticipantes();
  }, []);

  return { participantes, loading, createParticipante, updateParticipante, refetch: fetchParticipantes };
};
