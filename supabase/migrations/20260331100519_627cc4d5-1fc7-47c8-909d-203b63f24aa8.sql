-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Admin can view all user_roles
CREATE POLICY "Admins can view roles" ON public.user_roles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for service_orders: view all, update all
CREATE POLICY "Admins can view all orders" ON public.service_orders
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders" ON public.service_orders
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for appointments: view all, update all
CREATE POLICY "Admins can view all appointments" ON public.appointments
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all appointments" ON public.appointments
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for profiles: view all
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));