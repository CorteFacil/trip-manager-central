
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Viagem {
  id: string;
  participantes_id: string | null;
  guia_turistico_id: string | null;
  data_inicio: string;
  data_fim: string;
  criado_em: string;
  participante?: {
    nome: string;
    email: string;
  };
  guia_turistico?: {
    nome: string;
    email: string;
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
          participante:participantes_id (nome, email),
          guia_turistico:guia_turistico_id (nome, email)
        `)
        .order('data_inicio', { ascending: false });
      
      if (error) throw error;
      setViagens(data || []);
    } catch (error) {
      console.error('Erro ao buscar viagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const createViagem = async (viagem: Omit<Viagem, 'id' | 'criado_em' | 'participante' | 'guia_turistico'>) => {
    try {
      const { data, error } = await supabase
        .from('viagem')
        .insert([viagem])
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

  useEffect(() => {
    fetchViagens();
  }, []);

  return { viagens, loading, createViagem, refetch: fetchViagens };
};
