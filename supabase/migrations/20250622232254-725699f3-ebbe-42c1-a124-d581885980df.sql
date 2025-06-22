
-- Criar tabela de cidades
CREATE TABLE public.cidade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    estado TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de pontos turísticos
CREATE TABLE public.ponto_turistico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    cidade_id UUID REFERENCES public.cidade(id) ON DELETE CASCADE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de guias turísticos
CREATE TABLE public.guia_turistico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    contratado_em DATE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de participantes
CREATE TABLE public.participante (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de viagens
CREATE TABLE public.viagem (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participantes_id UUID REFERENCES public.participante(id) ON DELETE SET NULL,
    guia_turistico_id UUID REFERENCES public.guia_turistico(id) ON DELETE SET NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de roteiro
CREATE TABLE public.roteiro (
    viagem_id UUID REFERENCES public.viagem(id) ON DELETE CASCADE,
    ponto_turistico_id UUID REFERENCES public.ponto_turistico(id) ON DELETE CASCADE,
    ordem INT4 NOT NULL,
    PRIMARY KEY (viagem_id, ponto_turistico_id)
);

-- Habilitar Row Level Security nas tabelas
ALTER TABLE public.cidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ponto_turistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guia_turistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participante ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roteiro ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para permitir acesso público (já que é um sistema administrativo)
CREATE POLICY "Allow all operations on cidade" ON public.cidade FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ponto_turistico" ON public.ponto_turistico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on guia_turistico" ON public.guia_turistico FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on participante" ON public.participante FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on viagem" ON public.viagem FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on roteiro" ON public.roteiro FOR ALL USING (true) WITH CHECK (true);
