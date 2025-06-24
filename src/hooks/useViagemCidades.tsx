import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ViagemCidade {
  viagem_id: string;
  cidade_id: string;
}

export const useViagemCidades = () => {
  const [viagemCidades, setViagemCidades] = useState<ViagemCidade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViagemCidades = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('viagem_cidade').select('*');
    if (!error) setViagemCidades((data || []) as ViagemCidade[]);
    setLoading(false);
  };

  const addCidadeToViagem = async (viagem_id: string, cidade_id: string) => {
    await supabase.from('viagem_cidade').insert({ viagem_id, cidade_id });
    await fetchViagemCidades();
  };

  const removeCidadeFromViagem = async (viagem_id: string, cidade_id: string) => {
    await supabase.from('viagem_cidade').delete().eq('viagem_id', viagem_id).eq('cidade_id', cidade_id);
    await fetchViagemCidades();
  };

  const getCidadesByViagem = (viagem_id: string) => viagemCidades.filter(vc => vc.viagem_id === viagem_id).map(vc => vc.cidade_id);

  useEffect(() => { fetchViagemCidades(); }, []);

  return {
    viagemCidades,
    loading,
    fetchViagemCidades,
    addCidadeToViagem,
    removeCidadeFromViagem,
    getCidadesByViagem,
  };
}; 