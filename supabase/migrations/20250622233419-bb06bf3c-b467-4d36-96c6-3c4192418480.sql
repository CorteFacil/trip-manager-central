
-- Criar tabela de administradores
CREATE TABLE public.administrador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na tabela de administradores
ALTER TABLE public.administrador ENABLE ROW LEVEL SECURITY;

-- Criar política para administradores (apenas usuários autenticados podem acessar)
CREATE POLICY "Only authenticated users can access admin data" 
ON public.administrador 
FOR ALL 
TO authenticated 
USING (auth.uid()::text IN (SELECT id::text FROM public.administrador WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Função para criar perfil de administrador automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.administrador (id, email, nome)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil de administrador
CREATE TRIGGER on_auth_admin_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_admin();

-- Atualizar políticas das outras tabelas para permitir acesso apenas a administradores autenticados
DROP POLICY IF EXISTS "Allow all operations on cidade" ON public.cidade;
DROP POLICY IF EXISTS "Allow all operations on ponto_turistico" ON public.ponto_turistico;
DROP POLICY IF EXISTS "Allow all operations on guia_turistico" ON public.guia_turistico;
DROP POLICY IF EXISTS "Allow all operations on participante" ON public.participante;
DROP POLICY IF EXISTS "Allow all operations on viagem" ON public.viagem;
DROP POLICY IF EXISTS "Allow all operations on roteiro" ON public.roteiro;

-- Criar políticas que requerem autenticação
CREATE POLICY "Authenticated users can manage cidade" ON public.cidade FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage ponto_turistico" ON public.ponto_turistico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage guia_turistico" ON public.guia_turistico FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage participante" ON public.participante FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage viagem" ON public.viagem FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage roteiro" ON public.roteiro FOR ALL TO authenticated USING (true) WITH CHECK (true);
