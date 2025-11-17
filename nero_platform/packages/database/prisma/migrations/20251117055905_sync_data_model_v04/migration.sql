/*
  Warnings:

  - You are about to alter the column `target_metric` on the `route_goals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(128)` to `VarChar(100)`.
  - The `baseline_value` column on the `route_goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `target_value` column on the `route_goals` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `status` on the `route_goals` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - You are about to drop the column `age_max` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `age_min` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `archived_at` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `duration_weeks` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `goals` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `phases` on the `route_templates` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `route_templates` table. All the data in the column will be lost.
  - Added the required column `title` to the `route_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "route_templates_slug_key";

-- AlterTable
ALTER TABLE "route_goals" ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "target_metric" SET DATA TYPE VARCHAR(100),
DROP COLUMN "baseline_value",
ADD COLUMN     "baseline_value" DECIMAL(10,2),
DROP COLUMN "target_value",
ADD COLUMN     "target_value" DECIMAL(10,2),
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "route_phases" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "description" SET DATA TYPE TEXT,
ALTER COLUMN "duration_weeks" DROP NOT NULL,
ALTER COLUMN "expected_outcomes" DROP NOT NULL,
ALTER COLUMN "expected_outcomes" SET DATA TYPE TEXT,
ALTER COLUMN "notes" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "route_templates" DROP COLUMN "age_max",
DROP COLUMN "age_min",
DROP COLUMN "archived_at",
DROP COLUMN "created_by_id",
DROP COLUMN "duration_weeks",
DROP COLUMN "goals",
DROP COLUMN "name",
DROP COLUMN "phases",
DROP COLUMN "slug",
ADD COLUMN     "severity_level" VARCHAR(50),
ADD COLUMN     "target_age_range" VARCHAR(50),
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "template_phases" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order_index" INTEGER NOT NULL,
    "duration_weeks" INTEGER,
    "specialty_hint" VARCHAR(100),
    "notes" TEXT,

    CONSTRAINT "template_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_goals" (
    "id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "template_phase_id" UUID,
    "category" VARCHAR(100),
    "goal_type" VARCHAR(50),
    "description" TEXT NOT NULL,
    "target_metric" VARCHAR(100),
    "measurement_unit" VARCHAR(50),
    "baseline_guideline" TEXT,
    "target_guideline" TEXT,
    "priority" VARCHAR(20),
    "notes" TEXT,

    CONSTRAINT "template_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_milestones" (
    "id" UUID NOT NULL,
    "template_phase_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "checkpoint_type" VARCHAR(50),
    "due_week" INTEGER,
    "success_criteria" TEXT,

    CONSTRAINT "template_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_exercises" (
    "id" UUID NOT NULL,
    "template_phase_id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "template_goal_id" UUID,
    "order_index" INTEGER,
    "frequency_per_week" INTEGER,
    "duration_minutes" INTEGER,
    "notes" TEXT,

    CONSTRAINT "template_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_revision_history" (
    "id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change_reason" TEXT,

    CONSTRAINT "route_revision_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_phase_milestones" (
    "id" UUID NOT NULL,
    "phase_id" UUID NOT NULL,
    "goal_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "checkpoint_type" VARCHAR(50),
    "due_week" INTEGER,
    "success_criteria" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'planned',
    "completed_at" TIMESTAMPTZ(6),
    "evidence_links" JSONB,

    CONSTRAINT "route_phase_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_history" (
    "id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "changed_by" UUID NOT NULL,
    "event_type" VARCHAR(50) NOT NULL,
    "from_status" VARCHAR(20),
    "to_status" VARCHAR(20),
    "changed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "assignment_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_recommendations" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "goal_stub" JSONB NOT NULL,
    "confidence" DECIMAL(3,2),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_reviews" (
    "id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "review_status" VARCHAR(20),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL,
    "owner_type" VARCHAR(50) NOT NULL,
    "owner_id" UUID NOT NULL,
    "media_type" VARCHAR(50),
    "path" VARCHAR(500) NOT NULL,
    "checksum" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "channel" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "template_phases_template_id_order_index_key" ON "template_phases"("template_id", "order_index");

-- CreateIndex
CREATE INDEX "route_revision_history_route_id_idx" ON "route_revision_history"("route_id");

-- CreateIndex
CREATE INDEX "route_revision_history_changed_at_idx" ON "route_revision_history"("changed_at");

-- CreateIndex
CREATE UNIQUE INDEX "route_revision_history_route_id_version_key" ON "route_revision_history"("route_id", "version");

-- AddForeignKey
ALTER TABLE "template_phases" ADD CONSTRAINT "template_phases_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "route_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_goals" ADD CONSTRAINT "template_goals_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "route_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_goals" ADD CONSTRAINT "template_goals_template_phase_id_fkey" FOREIGN KEY ("template_phase_id") REFERENCES "template_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_milestones" ADD CONSTRAINT "template_milestones_template_phase_id_fkey" FOREIGN KEY ("template_phase_id") REFERENCES "template_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_phase_id_fkey" FOREIGN KEY ("template_phase_id") REFERENCES "template_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_exercises" ADD CONSTRAINT "template_exercises_template_goal_id_fkey" FOREIGN KEY ("template_goal_id") REFERENCES "template_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "route_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_phases" ADD CONSTRAINT "route_phases_responsible_specialist_id_fkey" FOREIGN KEY ("responsible_specialist_id") REFERENCES "specialist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_revision_history" ADD CONSTRAINT "route_revision_history_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_revision_history" ADD CONSTRAINT "route_revision_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "specialist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_phase_milestones" ADD CONSTRAINT "route_phase_milestones_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "route_phases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_phase_milestones" ADD CONSTRAINT "route_phase_milestones_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "route_goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_history" ADD CONSTRAINT "assignment_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_recommendations" ADD CONSTRAINT "route_recommendations_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "diagnostic_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_reviews" ADD CONSTRAINT "report_reviews_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_reviews" ADD CONSTRAINT "report_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "specialist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
