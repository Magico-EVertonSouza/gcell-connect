
-- Recreate triggers using DROP IF EXISTS first
DROP TRIGGER IF EXISTS generate_order_number_trigger ON public.service_orders;
CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_orders_updated_at ON public.service_orders;
CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON public.appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
