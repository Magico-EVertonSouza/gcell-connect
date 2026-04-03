
ALTER TABLE public.service_orders DROP CONSTRAINT IF EXISTS service_orders_user_id_fkey;
ALTER TABLE public.service_orders ADD CONSTRAINT service_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_user_id_fkey;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
