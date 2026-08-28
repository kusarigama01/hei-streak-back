BEGIN;

-- Drop inbound FK constraints so parent tables (courses, users) can be
-- rebuilt. Each rebuilt child table recreates its own FK below.
ALTER TABLE exams DROP CONSTRAINT exams_course_id_fkey;
ALTER TABLE questions DROP CONSTRAINT questions_exam_id_fkey;
ALTER TABLE choices DROP CONSTRAINT choices_question_id_fkey;
ALTER TABLE attempts DROP CONSTRAINT attempts_student_id_fkey;
ALTER TABLE attempts DROP CONSTRAINT attempts_exam_id_fkey;
ALTER TABLE answers DROP CONSTRAINT answers_choice_id_fkey;
ALTER TABLE answers DROP CONSTRAINT answers_attempt_id_fkey;
ALTER TABLE answers DROP CONSTRAINT answers_question_id_fkey;
-- Drop unique constraints that are recreated with the same names on the
-- temp tables, to avoid name collisions with the still-existing originals.
ALTER TABLE attempts DROP CONSTRAINT unique_attempt_per_student_exam;
ALTER TABLE answers DROP CONSTRAINT unique_answer_per_attempt_question;

CREATE TABLE _map_courses AS
SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY created_at, id)::int AS new_id FROM courses;

CREATE TABLE _map_users AS
SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY created_at, id)::int AS new_id FROM users;

CREATE TABLE courses_temp (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(50) UNIQUE NOT NULL,
  name         VARCHAR(255) NOT NULL,
  description TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO courses_temp (id, code, name, description, created_at)
SELECT m.new_id, c.code, c.name, c.description, c.created_at
FROM courses c JOIN _map_courses m ON m.old_id = c.id;

SELECT setval(pg_get_serial_sequence('courses_temp','id'), (SELECT MAX(id) FROM courses_temp));

DROP TABLE courses; ALTER TABLE courses_temp RENAME TO courses;

CREATE TABLE users_temp (
  id             SERIAL PRIMARY KEY,
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role           user_role NOT NULL,
  name           VARCHAR(255) NOT NULL,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO users_temp (id, email, password_hash, role, name, is_active, created_at)
SELECT m.new_id, u.email, u.password_hash, u.role, u.name, u.is_active, u.created_at
FROM users u JOIN _map_users m ON m.old_id = u.id;

SELECT setval(pg_get_serial_sequence('users_temp','id'), (SELECT MAX(id) FROM users_temp));

DROP TABLE users; ALTER TABLE users_temp RENAME TO users;

CREATE TABLE _map_exams AS
SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY created_at, id)::int AS new_id FROM exams;

CREATE TABLE exams_temp (
  id           SERIAL PRIMARY KEY,
  course_id    INTEGER NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  title        VARCHAR(255) NOT NULL,
  description TEXT,
  start_at     TIMESTAMPTZ NOT NULL,
  end_at       TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exam_window_valid CHECK (end_at > start_at)
);

INSERT INTO exams_temp (id, course_id, title, description, start_at, end_at, created_at)
SELECT m.new_id, mc.new_id, e.title, e.description, e.start_at, e.end_at, e.created_at
FROM exams e
JOIN _map_exams m ON m.old_id = e.id
JOIN _map_courses mc ON mc.old_id = e.course_id;

SELECT setval(pg_get_serial_sequence('exams_temp','id'), (SELECT MAX(id) FROM exams_temp));

DROP TABLE exams; ALTER TABLE exams_temp RENAME TO exams;

CREATE INDEX idx_exams_course_id ON exams(course_id);

CREATE TABLE _map_questions AS
SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY created_at, id)::int AS new_id FROM questions;

CREATE TABLE questions_temp (
  id           SERIAL PRIMARY KEY,
  exam_id      INTEGER NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  statement    TEXT NOT NULL,
  points       INTEGER NOT NULL CHECK (points > 0),
  position     INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO questions_temp (id, exam_id, statement, points, position, created_at)
SELECT m.new_id, me.new_id, q.statement, q.points, 1, q.created_at
FROM questions q
JOIN _map_questions m ON m.old_id = q.id
JOIN _map_exams me ON me.old_id = q.exam_id;

SELECT setval(pg_get_serial_sequence('questions_temp','id'), (SELECT MAX(id) FROM questions_temp));

DROP TABLE questions; ALTER TABLE questions_temp RENAME TO questions;

CREATE INDEX idx_questions_exam_id ON questions(exam_id);

CREATE TABLE _map_choices AS
SELECT c.id AS old_id, ROW_NUMBER() OVER (ORDER BY c.id)::int AS new_id FROM choices c;

CREATE TABLE choices_temp (
  id           SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  text         VARCHAR(500) NOT NULL,
  is_correct   BOOLEAN NOT NULL DEFAULT FALSE
);

INSERT INTO choices_temp (id, question_id, text, is_correct)
SELECT mc.new_id, mq.new_id, c.text, c.is_correct
FROM choices c
JOIN _map_choices mc ON mc.old_id = c.id
JOIN _map_questions mq ON mq.old_id = c.question_id;

SELECT setval(pg_get_serial_sequence('choices_temp','id'), (SELECT MAX(id) FROM choices_temp));

DROP TABLE choices; ALTER TABLE choices_temp RENAME TO choices;

CREATE INDEX idx_choices_question_id ON choices(question_id);

CREATE TABLE _map_attempts AS
SELECT id AS old_id, ROW_NUMBER() OVER (ORDER BY submitted_at, id)::int AS new_id FROM attempts;

CREATE TABLE attempts_temp (
  id              SERIAL PRIMARY KEY,
  exam_id         INTEGER NOT NULL REFERENCES exams(id) ON DELETE RESTRICT,
  student_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  score           INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT unique_attempt_per_student_exam UNIQUE (student_id, exam_id)
);

INSERT INTO attempts_temp (id, exam_id, student_id, submitted_at, score)
SELECT ma.new_id, me.new_id, mu.new_id, a.submitted_at, a.score
FROM attempts a
JOIN _map_attempts ma ON ma.old_id = a.id
JOIN _map_exams me ON me.old_id = a.exam_id
JOIN _map_users mu ON mu.old_id = a.student_id;

SELECT setval(pg_get_serial_sequence('attempts_temp','id'), (SELECT MAX(id) FROM attempts_temp));

DROP TABLE attempts; ALTER TABLE attempts_temp RENAME TO attempts;

CREATE INDEX idx_attempts_exam_id ON attempts(exam_id);
CREATE INDEX idx_attempts_student_id ON attempts(student_id);

CREATE TABLE answers_temp (
  id            SERIAL PRIMARY KEY,
  attempt_id    INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  choice_id     INTEGER REFERENCES choices(id) ON DELETE RESTRICT,
  CONSTRAINT unique_answer_per_attempt_question UNIQUE (attempt_id, question_id)
);

INSERT INTO answers_temp (id, attempt_id, question_id, choice_id)
SELECT ROW_NUMBER() OVER (ORDER BY a.id)::int, mat.new_id, mq.new_id, mc.new_id
FROM answers a
JOIN _map_attempts mat ON mat.old_id = a.attempt_id
JOIN _map_questions mq ON mq.old_id = a.question_id
LEFT JOIN _map_choices mc ON mc.old_id = a.choice_id;

SELECT setval(pg_get_serial_sequence('answers_temp','id'), (SELECT MAX(id) FROM answers_temp));

DROP TABLE answers; ALTER TABLE answers_temp RENAME TO answers;

CREATE INDEX idx_answers_attempt_id ON answers(attempt_id);

CREATE OR REPLACE FUNCTION check_single_correct_choice()
RETURNS TRIGGER AS $$
DECLARE
  correct_count INTEGER;
  qid INTEGER;
BEGIN
  IF TG_OP = 'DELETE' THEN qid := OLD.question_id; ELSE qid := NEW.question_id; END IF;
  SELECT COUNT(*) INTO correct_count FROM choices WHERE question_id = qid AND is_correct = TRUE;
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

DROP TABLE _map_courses, _map_users, _map_exams, _map_questions, _map_choices, _map_attempts;

COMMIT;
