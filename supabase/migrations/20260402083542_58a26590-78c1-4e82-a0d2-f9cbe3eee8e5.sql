
-- Drop all recursive policies that query user_roles directly

-- user_roles table
DROP POLICY IF EXISTS "Admins full access" ON public.user_roles;

-- profiles table
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;

-- appointments table
DROP POLICY IF EXISTS "Admin full access appointments" ON public.appointments;

-- service_orders table
DROP POLICY IF EXISTS "Admin full access service_orders" ON public.service_orders;

-- Recreate user_roles policy using has_role function
CREATE POLICY "Admins full access" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate profiles admin policy using has_role function
CREATE POLICY "Admin full access profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate appointments admin policy using has_role function
CREATE POLICY "Admin full access appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate service_orders admin policy using has_role function
CREATE POLICY "Admin full access service_orders" ON public.service_orders
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate missing triggers
CREATE OR REPLACE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();

CREATE OR REPLACE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
