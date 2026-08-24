-- Extension required to generate UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('admin', 'student');

-- USERS
-- A user has exactly one role (admin or student), never both.
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role NOT NULL,
  name          VARCHAR(255) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,   -- BR-10: deactivation only, never a hard delete
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COURSES
CREATE TABLE courses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EXAMS
-- ON DELETE RESTRICT: a course with existing exams cannot be deleted (BR-09).
CREATE TABLE exams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exam_window_valid CHECK (end_at > start_at)
);

-- QUESTIONS
CREATE TABLE questions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  statement  TEXT NOT NULL,
  points     INTEGER NOT NULL CHECK (points > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CHOICES
-- Between 2 and 6 choices per question, exactly one correct (BR-04).
-- The 2..6 count is enforced at the Service layer; the "only one
-- correct choice" rule is additionally enforced in DB via trigger below.
CREATE TABLE choices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text        VARCHAR(500) NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE
);

-- ATTEMPTS
-- UNIQUE(student_id, exam_id) enforces BR-02: one attempt per student per exam.
CREATE TABLE attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      UUID NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  student_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score        INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT unique_attempt_per_student_exam UNIQUE (student_id, exam_id)
);

-- ANSWERS
-- choice_id is nullable: a question can be left unanswered (BR-05).
CREATE TABLE answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id  UUID NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  choice_id   UUID REFERENCES choices(id) ON DELETE RESTRICT,
  CONSTRAINT unique_answer_per_attempt_question UNIQUE (attempt_id, question_id)
);

-- Indexes for frequent joins
CREATE INDEX idx_exams_course_id ON exams(course_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_choices_question_id ON choices(question_id);
CREATE INDEX idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON attempts(student_id);
CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);

-- ============================================================
-- Trigger: prevents more than ONE correct choice per question.
-- Note: this only enforces "at most one". The full BR-04 rule
-- ("exactly one, and between 2 and 6 choices total") must also
-- be re-checked at the Service layer when an exam is created or
-- edited, as explicitly required by the subject.
-- ============================================================
CREATE OR REPLACE FUNCTION check_single_correct_choice()
RETURNS TRIGGER AS $$
DECLARE
  correct_count INTEGER;
  qid UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    qid := OLD.question_id;
  ELSE
    qid := NEW.question_id;
  END IF;

  SELECT COUNT(*) INTO correct_count
  FROM choices
  WHERE question_id = qid AND is_correct = TRUE;

  IF correct_count > 1 THEN
    RAISE EXCEPTION 'A question cannot have more than one correct choice (question_id=%)', qid;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER trg_single_correct_choice
AFTER INSERT OR UPDATE OR DELETE ON choices
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION check_single_correct_choice();