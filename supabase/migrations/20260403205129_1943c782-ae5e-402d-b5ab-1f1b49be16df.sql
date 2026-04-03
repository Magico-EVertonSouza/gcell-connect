
CREATE OR REPLACE FUNCTION public.generate_order_number()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
DECLARE
  year_str TEXT;
  seq_num INTEGER;
BEGIN
  year_str := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'OS-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.service_orders
  WHERE order_number LIKE 'OS-' || year_str || '-%';
  NEW.order_number := 'OS-' || year_str || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;
