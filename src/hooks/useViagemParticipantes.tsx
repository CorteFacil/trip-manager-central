import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ViagemParticipante {
  viagem_id: string;
  participante_id: string;
}

export const useViagemParticipantes = () => {
  const [viagemParticipantes, setViagemParticipantes] = useState<ViagemParticipante[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViagemParticipantes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('viagem_participante').select('*');
    if (!error) setViagemParticipantes((data || []) as ViagemParticipante[]);
    setLoading(false);
  };

  const addParticipanteToViagem = async (viagem_id: string, participante_id: string) => {
    await supabase.from('viagem_participante').insert({ viagem_id, participante_id });
    await fetchViagemParticipantes();
  };

  const removeParticipanteFromViagem = async (viagem_id: string, participante_id: string) => {
    await supabase.from('viagem_participante').delete().eq('viagem_id', viagem_id).eq('participante_id', participante_id);
    await fetchViagemParticipantes();
  };

  // Utilitários para buscar viagens de um participante ou participantes de uma viagem
  const getParticipantesByViagem = (viagem_id: string) => viagemParticipantes.filter(vp => vp.viagem_id === viagem_id).map(vp => vp.participante_id);
  const getViagensByParticipante = (id_participante: string) => viagemParticipantes.filter(vp => vp.participante_id === id_participante).map(vp => vp.viagem_id);

  useEffect(() => {
    fetchViagemParticipantes();
  }, []);

  useEffect(() => {
    console.log('viagemParticipantes state:', viagemParticipantes);
  }, [viagemParticipantes]);

  return {
    viagemParticipantes,
    loading,
    fetchViagemParticipantes,
    addParticipanteToViagem,
    removeParticipanteFromViagem,
    getParticipantesByViagem,
    getViagensByParticipante,
  };
}; 