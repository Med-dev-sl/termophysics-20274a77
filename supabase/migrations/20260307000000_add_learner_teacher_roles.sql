-- Update app_role enum to include learner and teacher roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'learner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';

-- Update handle_new_user to handle role mapping more safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );

  -- Safely handle role assignment
  BEGIN
    user_role := CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'learner' THEN 'learner'::app_role
      WHEN NEW.raw_user_meta_data->>'role' = 'teacher' THEN 'teacher'::app_role
      ELSE 'user'::app_role
    END;
  EXCEPTION
    WHEN invalid_text_representation THEN
      user_role := 'user'::app_role;
  END;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);

  RETURN NEW;
END;
$$;