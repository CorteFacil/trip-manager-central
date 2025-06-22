
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PontoTuristico {
  id: string;
  nome: string;
  descricao: string | null;
  cidade_id: string | null;
  criado_em: string;
  cidade?: {
    nome: string;
    estado: string;
  };
}

export const usePontosTuristicos = () => {
  const [pontos, setPontos] = useState<PontoTuristico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPontos = async () => {
    try {
      const { data, error } = await supabase
        .from('ponto_turistico')
        .select(`
          *,
          cidade:cidade_id (nome, estado)
        `)
        .order('nome');
      
      if (error) throw error;
      setPontos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pontos turísticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPonto = async (ponto: Omit<PontoTuristico, 'id' | 'criado_em' | 'cidade'>) => {
    try {
      const { data, error } = await supabase
        .from('ponto_turistico')
        .insert([ponto])
        .select()
        .single();
      
      if (error) throw error;
      await fetchPontos();
      return data;
    } catch (error) {
      console.error('Erro ao criar ponto turístico:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPontos();
  }, []);

  return { pontos, loading, createPonto, refetch: fetchPontos };
};
