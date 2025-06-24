-- Add cidade_id to viagem table
ALTER TABLE public.viagem
ADD COLUMN cidade_id UUID;

-- Add foreign key constraint for cidade_id
ALTER TABLE public.viagem
ADD CONSTRAINT fk_cidade
FOREIGN KEY (cidade_id)
REFERENCES public.cidades(id);

-- Make participantes_id and guia_turistico_id columns non-nullable
ALTER TABLE public.viagem
ALTER COLUMN participantes_id SET NOT NULL,
ALTER COLUMN guia_turistico_id SET NOT NULL;
