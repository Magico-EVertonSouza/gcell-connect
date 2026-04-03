
DROP TRIGGER IF EXISTS set_order_number ON public.service_orders;
ALTER TABLE public.service_orders ALTER COLUMN order_number SET DEFAULT 'PENDING';
