
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Roteiro {
  viagem_id: string;
  ponto_turistico_id: string;
  ordem: number;
  ponto_turistico?: {
    nome: string;
    descricao: string | null;
  };
}

export const useRoteiros = () => {
  const [roteiros, setRoteiros] = useState<Roteiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoteiros = async (viagemId?: string) => {
    try {
      let query = supabase
        .from('roteiro')
        .select(`
          *,
          ponto_turistico:ponto_turistico_id (nome, descricao)
        `)
        .order('ordem');
      
      if (viagemId) {
        query = query.eq('viagem_id', viagemId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setRoteiros(data || []);
    } catch (error) {
      console.error('Erro ao buscar roteiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRoteiro = async (roteiro: Omit<Roteiro, 'ponto_turistico'>) => {
    try {
      const { data, error } = await supabase
        .from('roteiro')
        .insert([roteiro])
        .select()
        .single();
      
      if (error) throw error;
      await fetchRoteiros();
      return data;
    } catch (error) {
      console.error('Erro ao criar roteiro:', error);
      throw error;
    }
  };

  const deleteRoteiro = async (viagemId: string, pontoTuristicoId: string) => {
    try {
      const { error } = await supabase
        .from('roteiro')
        .delete()
        .eq('viagem_id', viagemId)
        .eq('ponto_turistico_id', pontoTuristicoId);
      
      if (error) throw error;
      await fetchRoteiros();
    } catch (error) {
      console.error('Erro ao deletar roteiro:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchRoteiros();
  }, []);

  return { roteiros, loading, createRoteiro, deleteRoteiro, refetch: fetchRoteiros };
};
