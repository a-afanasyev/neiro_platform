-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "external_id" VARCHAR(100),
    "role" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'invited',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "specialty" VARCHAR(50) NOT NULL,
    "license_number" VARCHAR(100),
    "license_valid_until" DATE,
    "experience_years" INTEGER,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "specialist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" VARCHAR(20),
    "diagnosis_summary" TEXT,
    "notes" TEXT,
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children_parents" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "parent_user_id" UUID NOT NULL,
    "legal_guardian" BOOLEAN NOT NULL DEFAULT false,
    "relationship" VARCHAR(50) NOT NULL,
    "guardianship_type" VARCHAR(50),
    "invited_at" TIMESTAMPTZ(6),
    "linked_at" TIMESTAMPTZ(6),

    CONSTRAINT "children_parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children_specialists" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "specialist_id" UUID NOT NULL,
    "specialization" VARCHAR(50) NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "released_at" TIMESTAMPTZ(6),
    "role_description" TEXT,

    CONSTRAINT "children_specialists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_sessions" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "performed_by" UUID NOT NULL,
    "questionnaire_code" VARCHAR(100) NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "score_total" DECIMAL(10,2),
    "score_raw" JSONB,
    "interpretation_level" VARCHAR(50),
    "notes" TEXT,

    CONSTRAINT "diagnostic_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_session_results" (
    "session_id" UUID NOT NULL,
    "answers" JSONB NOT NULL,
    "scoring" JSONB,
    "risk_flags" JSONB,

    CONSTRAINT "diagnostic_session_results_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "exercise" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "age_min" INTEGER,
    "age_max" INTEGER,
    "difficulty" VARCHAR(20),
    "duration_minutes" INTEGER,
    "materials" JSONB,
    "instructions" JSONB,
    "success_criteria" JSONB,
    "media_assets" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "lead_specialist_id" UUID NOT NULL,
    "template_id" UUID,
    "active_version_id" UUID,
    "baseline_snapshot_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "plan_horizon_weeks" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_goals" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "phase_id" UUID,
    "category" VARCHAR(100) NOT NULL,
    "goal_type" VARCHAR(50) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "target_metric" VARCHAR(128) NOT NULL,
    "measurement_unit" VARCHAR(50) NOT NULL,
    "baseline_value" VARCHAR(64),
    "target_value" VARCHAR(64),
    "review_period_weeks" INTEGER NOT NULL,
    "priority" VARCHAR(20) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "route_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_phases" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "responsible_specialist_id" UUID NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "description" VARCHAR(512) NOT NULL,
    "order_index" INTEGER NOT NULL,
    "parallel_group" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "start_date" DATE,
    "end_date" DATE,
    "duration_weeks" INTEGER NOT NULL,
    "expected_outcomes" VARCHAR(1024) NOT NULL,
    "notes" VARCHAR(512),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "route_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phase_exercises" (
    "id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "order_index" INTEGER NOT NULL,
    "frequency_per_week" INTEGER NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "notes" TEXT,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "phase_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_exercises" (
    "id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "contribution_level" VARCHAR(50) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "goal_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "assigned_by_id" UUID NOT NULL,
    "specialist_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "target_goal_id" UUID,
    "assigned_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "planned_start_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'assigned',
    "delivery_channel" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "frequency_per_week" INTEGER NOT NULL,
    "expected_duration_minutes" INTEGER NOT NULL,
    "reminder_policy" JSONB,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "parent_id" UUID NOT NULL,
    "reviewed_by" UUID,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "child_mood" VARCHAR(20) NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "media" JSONB,
    "auto_score" DECIMAL(5,2),
    "reviewed_at" TIMESTAMPTZ(6),
    "review_status" VARCHAR(50) NOT NULL DEFAULT 'not_reviewed',

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outbox" (
    "id" UUID NOT NULL,
    "event_name" VARCHAR(255) NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',

    CONSTRAINT "event_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_outbox_failures" (
    "id" UUID NOT NULL,
    "original_outbox_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "error_summary" TEXT NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "failed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reprocessed_at" TIMESTAMPTZ(6),

    CONSTRAINT "event_outbox_failures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_external_id_key" ON "users"("external_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "specialist_user_id_key" ON "specialist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "children_parents_child_id_parent_user_id_key" ON "children_parents"("child_id", "parent_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "children_specialists_child_id_specialist_id_specialization_key" ON "children_specialists"("child_id", "specialist_id", "specialization");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_slug_key" ON "exercise"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "route_phases_route_id_order_index_key" ON "route_phases"("route_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "phase_exercises_phase_id_order_index_key" ON "phase_exercises"("phase_id", "order_index");

-- CreateIndex
CREATE INDEX "event_outbox_status_created_at_idx" ON "event_outbox"("status", "created_at");

-- AddForeignKey
ALTER TABLE "specialist" ADD CONSTRAINT "specialist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_parents" ADD CONSTRAINT "children_parents_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_parents" ADD CONSTRAINT "children_parents_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_specialists" ADD CONSTRAINT "children_specialists_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "children_specialists" ADD CONSTRAINT "children_specialists_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_sessions" ADD CONSTRAINT "diagnostic_sessions_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_session_results" ADD CONSTRAINT "diagnostic_session_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnostic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_lead_specialist_id_fkey" FOREIGN KEY ("lead_specialist_id") REFERENCES "specialist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_goals" ADD CONSTRAINT "route_goals_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_goals" ADD CONSTRAINT "route_goals_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "route_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_phases" ADD CONSTRAINT "route_phases_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_exercises" ADD CONSTRAINT "phase_exercises_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "route_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phase_exercises" ADD CONSTRAINT "phase_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_exercises" ADD CONSTRAINT "goal_exercises_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "route_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_exercises" ADD CONSTRAINT "goal_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialist"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "route_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
