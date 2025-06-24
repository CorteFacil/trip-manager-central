import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Viagem {
  id: string;
  participantes_id: string | null;
  guia_turistico_id: string | null;
  cidade_id?: string | null;
  data_inicio: string;
  data_fim: string;
  criado_em: string;
  imagem?: string | null;
  participante?: {
    nome: string;
    email: string;
  };
  guia_turistico?: {
    nome: string;
    email: string;
  };
  cidade?: {
    nome: string;
    estado: string;
  };
}

export const useViagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViagens = async () => {
    try {
      const { data, error } = await supabase
        .from('viagem')
        .select(`
          *,
          guia_turistico:guia_turistico_id (id, nome, email)
        `)
        .order('data_inicio', { ascending: false });
      if (error) throw error;
      setViagens(data as any[] as Viagem[] || []);
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const createViagem = async (viagem: Omit<Viagem, 'id' | 'criado_em' | 'participante' | 'guia_turistico' | 'cidade'>) => {
    try {
      const { data, error } = await supabase
        .from('viagem')
        .insert([viagem as any])
        .select()
        .single();
      
      if (error) throw error;
      await fetchViagens(); // Refetch to get the related data
      return data;
    } catch (error) {
      console.error('Erro ao criar viagem:', error);
      throw error;
    }
  };

  const deleteViagem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('viagem')
        .delete()
        .eq('id', id);
      if (error) throw error;
      await fetchViagens();
    } catch (error) {
      console.error('Erro ao deletar viagem:', error);
      throw error;
    }
  };

  const updateViagem = async (id: string, updates: Partial<Viagem>) => {
    try {
      const { data, error } = await supabase
        .from('viagem')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      await fetchViagens();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar viagem:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchViagens();
  }, []);

  return { viagens, loading, createViagem, deleteViagem, updateViagem, refetch: fetchViagens };
};
