
-- ============================================
-- CLASSROOMS (no student policy yet)
-- ============================================
CREATE TABLE public.classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  subject text,
  class_code text NOT NULL UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own classrooms"
  ON public.classrooms FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE TRIGGER update_classrooms_updated_at
  BEFORE UPDATE ON public.classrooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- CLASSROOM ENROLLMENTS
-- ============================================
CREATE TABLE public.classroom_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

ALTER TABLE public.classroom_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view enrollments for own classrooms"
  ON public.classroom_enrollments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE classrooms.id = classroom_enrollments.classroom_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own enrollments"
  ON public.classroom_enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can enroll themselves"
  ON public.classroom_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Teachers can remove students"
  ON public.classroom_enrollments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classrooms
      WHERE classrooms.id = classroom_enrollments.classroom_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- Now add the student view policy on classrooms
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

-- ============================================
-- CLASSROOM NOTES
-- ============================================
CREATE TABLE public.classroom_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  file_url text,
  file_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.classroom_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage notes in own classrooms"
  ON public.classroom_notes FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Enrolled students can view notes"
  ON public.classroom_notes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_enrollments
      WHERE classroom_enrollments.classroom_id = classroom_notes.classroom_id
        AND classroom_enrollments.student_id = auth.uid()
    )
  );

CREATE TRIGGER update_classroom_notes_updated_at
  BEFORE UPDATE ON public.classroom_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ASSIGNMENTS
-- ============================================
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  max_score int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own assignments"
  ON public.assignments FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Enrolled students can view assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_enrollments
      WHERE classroom_enrollments.classroom_id = assignments.classroom_id
        AND classroom_enrollments.student_id = auth.uid()
    )
  );

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- ASSIGNMENT SUBMISSIONS
-- ============================================
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  file_url text,
  file_name text,
  score int,
  feedback text,
  is_late boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit own work"
  ON public.assignment_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own submissions"
  ON public.assignment_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

CREATE POLICY "Students can update own ungraded submissions"
  ON public.assignment_submissions FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id AND graded_at IS NULL);

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

CREATE POLICY "Teachers can grade submissions"
  ON public.assignment_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assignments
      JOIN public.classrooms ON classrooms.id = assignments.classroom_id
      WHERE assignments.id = assignment_submissions.assignment_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- ============================================
-- QUIZZES
-- ============================================
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  time_limit_minutes int,
  max_score int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own quizzes"
  ON public.quizzes FOR ALL
  TO authenticated
  USING (auth.uid() = teacher_id);

CREATE POLICY "Enrolled students can view quizzes"
  ON public.quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.classroom_enrollments
      WHERE classroom_enrollments.classroom_id = quizzes.classroom_id
        AND classroom_enrollments.student_id = auth.uid()
    )
  );

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- QUIZ QUESTIONS
-- ============================================
CREATE TYPE public.question_type AS ENUM ('mcq', 'short_answer', 'file_upload');

CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type public.question_type NOT NULL DEFAULT 'mcq',
  options jsonb,
  correct_answer text,
  points int NOT NULL DEFAULT 10,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage questions in own quizzes"
  ON public.quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = quiz_questions.quiz_id
        AND quizzes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled students can view questions"
  ON public.quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.classroom_enrollments ON classroom_enrollments.classroom_id = quizzes.classroom_id
      WHERE quizzes.id = quiz_questions.quiz_id
        AND classroom_enrollments.student_id = auth.uid()
    )
  );

-- ============================================
-- QUIZ SUBMISSIONS
-- ============================================
CREATE TABLE public.quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_score int,
  is_late boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(quiz_id, student_id)
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit own quizzes"
  ON public.quiz_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view own quiz submissions"
  ON public.quiz_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = student_id);

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

CREATE POLICY "Teachers can grade quiz submissions"
  ON public.quiz_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      JOIN public.classrooms ON classrooms.id = quizzes.classroom_id
      WHERE quizzes.id = quiz_submissions.quiz_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- ============================================
-- QUIZ ANSWERS
-- ============================================
CREATE TABLE public.quiz_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.quiz_submissions(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  answer_text text,
  file_url text,
  file_name text,
  is_correct boolean,
  score int,
  feedback text,
  UNIQUE(submission_id, question_id)
);

ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can submit own answers"
  ON public.quiz_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      WHERE quiz_submissions.id = quiz_answers.submission_id
        AND quiz_submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Students can view own answers"
  ON public.quiz_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      WHERE quiz_submissions.id = quiz_answers.submission_id
        AND quiz_submissions.student_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can view and grade answers"
  ON public.quiz_answers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.quiz_submissions
      JOIN public.quizzes ON quizzes.id = quiz_submissions.quiz_id
      JOIN public.classrooms ON classrooms.id = quizzes.classroom_id
      WHERE quiz_submissions.id = quiz_answers.submission_id
        AND classrooms.teacher_id = auth.uid()
    )
  );

-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('classroom-files', 'classroom-files', true);

CREATE POLICY "Authenticated users can upload classroom files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'classroom-files');

CREATE POLICY "Anyone can view classroom files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'classroom-files');

CREATE POLICY "Users can update own classroom files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'classroom-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own classroom files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'classroom-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- Add teacher role
-- ============================================
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
