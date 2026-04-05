
-- Parts inventory table
CREATE TABLE public.parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  min_quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

-- Anyone can view parts
CREATE POLICY "Anyone can view parts" ON public.parts FOR SELECT USING (true);

-- Admins manage parts
CREATE POLICY "Admins manage parts" ON public.parts FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add model_id to service_orders so we can link to parts
ALTER TABLE public.service_orders ADD COLUMN model_id UUID REFERENCES public.models(id) ON DELETE SET NULL;
