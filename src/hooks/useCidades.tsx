
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Cidade {
  id: string;
  nome: string;
  estado: string;
  criado_em: string;
}

export const useCidades = () => {
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCidades = async () => {
    try {
      const { data, error } = await supabase
        .from('cidade')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setCidades(data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCidade = async (cidade: Omit<Cidade, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('cidade')
        .insert([cidade])
        .select()
        .single();
      
      if (error) throw error;
      setCidades(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar cidade:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCidades();
  }, []);

  return { cidades, loading, createCidade, refetch: fetchCidades };
};
