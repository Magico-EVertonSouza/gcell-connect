
-- Allow anyone to look up a service order by order_number (for tracking page)
CREATE POLICY "Anyone can view orders by order_number" ON public.service_orders
  FOR SELECT
  TO anon
  USING (true);
