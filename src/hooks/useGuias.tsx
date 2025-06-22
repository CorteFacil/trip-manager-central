
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface GuiaTuristico {
  id: string;
  nome: string;
  email: string;
  contratado_em: string | null;
  criado_em: string;
}

export const useGuias = () => {
  const [guias, setGuias] = useState<GuiaTuristico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGuias = async () => {
    try {
      const { data, error } = await supabase
        .from('guia_turistico')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setGuias(data || []);
    } catch (error) {
      console.error('Erro ao buscar guias:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGuia = async (guia: Omit<GuiaTuristico, 'id' | 'criado_em'>) => {
    try {
      const { data, error } = await supabase
        .from('guia_turistico')
        .insert([guia])
        .select()
        .single();
      
      if (error) throw error;
      setGuias(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar guia:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGuias();
  }, []);

  return { guias, loading, createGuia, refetch: fetchGuias };
};
