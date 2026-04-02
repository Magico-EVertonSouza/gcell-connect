
-- Drop the recursive admin policy on user_roles
DROP POLICY IF EXISTS "Admins full access" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view roles" ON public.user_roles;

-- Users can always read their own roles (needed for has_role to work)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all roles (uses has_role which works because of the self-read policy above)
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
