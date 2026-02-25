
-- 1. Fix handle_new_user to respect the role passed during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id, 
    (COALESCE(NEW.raw_user_meta_data->>'role', 'user'))::public.app_role
  );
  
  RETURN NEW;
END;
$$;

-- 2. Fix infinite recursion in RLS policies
-- We use a SECURITY DEFINER function to check classroom ownership 
-- This bypasses RLS and prevents recursive policy evaluation

CREATE OR REPLACE FUNCTION public.is_classroom_teacher(cid uuid)
RETURNS boolean 
LANGUAGE sql 
STABLE 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.classrooms
    WHERE id = cid AND teacher_id = auth.uid()
  );
$$;

-- Allow students to find a classroom by its code before they enroll
DROP POLICY IF EXISTS "Anyone can find a classroom by code" ON public.classrooms;
CREATE POLICY "Anyone can find a classroom by code"
  ON public.classrooms FOR SELECT
  TO authenticated
  USING (true);

-- Update classrooms policies
DROP POLICY IF EXISTS "Students can view enrolled classrooms" ON public.classrooms;
CREATE POLICY "Students can view enrolled classrooms"
  ON public.classrooms FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_enrollments
      WHERE classroom_enrollments.classroom_id = classrooms.id
        AND classroom_enrollments.student_id = auth.uid()
    )
  );

-- Update classroom_enrollments policies to use the non-recursive check
DROP POLICY IF EXISTS "Teachers can view enrollments for own classrooms" ON public.classroom_enrollments;
CREATE POLICY "Teachers can view enrollments for own classrooms"
  ON public.classroom_enrollments FOR SELECT
  TO authenticated
  USING (
    public.is_classroom_teacher(classroom_id)
  );

-- 3. Allow teachers to see profiles of students in their classrooms
DROP POLICY IF EXISTS "Teachers can view profiles of enrolled students" ON public.profiles;
CREATE POLICY "Teachers can view profiles of enrolled students"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_enrollments
      JOIN public.classrooms ON classrooms.id = classroom_enrollments.classroom_id
      WHERE classroom_enrollments.student_id = profiles.user_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- 4. Add explicit FK from classroom_enrollments to profiles to help PostgREST joins
-- We ignore error if it already exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'classroom_enrollments_profiles_fkey') THEN
    ALTER TABLE public.classroom_enrollments
    ADD CONSTRAINT classroom_enrollments_profiles_fkey
    FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Ensure teachers can view all submissions in their classrooms
DROP POLICY IF EXISTS "Teachers can view submissions in own classrooms" ON public.assignment_submissions;
CREATE POLICY "Teachers can view submissions in own classrooms"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments
      JOIN public.classrooms ON classrooms.id = assignments.classroom_id
      WHERE assignments.id = assignment_submissions.assignment_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Teachers can view quiz submissions" ON public.quiz_submissions;
CREATE POLICY "Teachers can view quiz submissions"
  ON public.quiz_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.classrooms ON classrooms.id = quizzes.classroom_id
      WHERE quizzes.id = quiz_submissions.quiz_id
        AND classrooms.teacher_id = auth.uid()
    )
  );
