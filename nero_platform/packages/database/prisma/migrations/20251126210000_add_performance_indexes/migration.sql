-- Performance Optimization Indexes
-- Created: 2025-11-26
-- Purpose: Add indexes for frequently queried columns to improve performance

-- Assignment indexes (most queried model)
-- Query: Get assignments by child
CREATE INDEX IF NOT EXISTS "idx_assignments_child_id" ON "assignments"("child_id");

-- Query: Get assignments by status (for filtering overdue, completed, etc.)
CREATE INDEX IF NOT EXISTS "idx_assignments_status" ON "assignments"("status");

-- Query: Get assignments by specialist
CREATE INDEX IF NOT EXISTS "idx_assignments_specialist_id" ON "assignments"("specialist_id");

-- Query: Get assignments by due date (for SLA tracking and notifications)
CREATE INDEX IF NOT EXISTS "idx_assignments_due_date" ON "assignments"("due_date");

-- Query: Combined query - child assignments by status
CREATE INDEX IF NOT EXISTS "idx_assignments_child_status" ON "assignments"("child_id", "status");

-- Query: Combined query - specialist assignments by status and due date
CREATE INDEX IF NOT EXISTS "idx_assignments_specialist_status_due" ON "assignments"("specialist_id", "status", "due_date");

-- Report indexes
-- Query: Get reports by assignment
CREATE INDEX IF NOT EXISTS "idx_reports_assignment_id" ON "reports"("assignment_id");

-- Query: Get reports by parent
CREATE INDEX IF NOT EXISTS "idx_reports_parent_id" ON "reports"("parent_id");

-- Query: Get reports by review status (for specialist review queue)
CREATE INDEX IF NOT EXISTS "idx_reports_review_status" ON "reports"("review_status");

-- Query: Combined - unreviewed reports ordered by submission time
CREATE INDEX IF NOT EXISTS "idx_reports_review_submitted" ON "reports"("review_status", "submitted_at");

-- Route indexes
-- Query: Get routes by child
CREATE INDEX IF NOT EXISTS "idx_routes_child_id" ON "route"("child_id");

-- Query: Get routes by status (active, draft, etc.)
CREATE INDEX IF NOT EXISTS "idx_routes_status" ON "route"("status");

-- Query: Get active route for child (most common query)
CREATE INDEX IF NOT EXISTS "idx_routes_child_status" ON "route"("child_id", "status");

-- Query: Get routes by lead specialist
CREATE INDEX IF NOT EXISTS "idx_routes_lead_specialist" ON "route"("lead_specialist_id");

-- Child indexes
-- Query: Get non-archived children
CREATE INDEX IF NOT EXISTS "idx_child_archived" ON "child"("archived_at") WHERE "archived_at" IS NULL;

-- Query: Get children by birth date (for age-based queries)
CREATE INDEX IF NOT EXISTS "idx_child_birth_date" ON "child"("birth_date");

-- ChildParent indexes
-- Query: Get children by parent
CREATE INDEX IF NOT EXISTS "idx_children_parents_parent_id" ON "children_parents"("parent_user_id");

-- Query: Get parents by child
CREATE INDEX IF NOT EXISTS "idx_children_parents_child_id" ON "children_parents"("child_id");

-- ChildSpecialist indexes
-- Query: Get children by specialist
CREATE INDEX IF NOT EXISTS "idx_children_specialists_specialist_id" ON "children_specialists"("specialist_id");

-- Query: Get specialists by child
CREATE INDEX IF NOT EXISTS "idx_children_specialists_child_id" ON "children_specialists"("child_id");

-- Query: Get active assignments (not released)
CREATE INDEX IF NOT EXISTS "idx_children_specialists_active" ON "children_specialists"("child_id", "specialist_id") WHERE "released_at" IS NULL;

-- DiagnosticSession indexes
-- Query: Get diagnostics by child
CREATE INDEX IF NOT EXISTS "idx_diagnostic_sessions_child_id" ON "diagnostic_sessions"("child_id");

-- Query: Get diagnostics by status
CREATE INDEX IF NOT EXISTS "idx_diagnostic_sessions_status" ON "diagnostic_sessions"("status");

-- Query: Combined - child diagnostics by status
CREATE INDEX IF NOT EXISTS "idx_diagnostic_sessions_child_status" ON "diagnostic_sessions"("child_id", "status");

-- RouteGoal indexes
-- Query: Get goals by route
CREATE INDEX IF NOT EXISTS "idx_route_goals_route_id" ON "route_goals"("route_id");

-- Query: Get goals by status
CREATE INDEX IF NOT EXISTS "idx_route_goals_status" ON "route_goals"("status");

-- RoutePhase indexes
-- Query: Get phases by route
CREATE INDEX IF NOT EXISTS "idx_route_phases_route_id" ON "route_phases"("route_id");

-- Query: Get phases by status
CREATE INDEX IF NOT EXISTS "idx_route_phases_status" ON "route_phases"("status");

-- Exercise indexes
-- Query: Search exercises by category
CREATE INDEX IF NOT EXISTS "idx_exercises_category" ON "exercise"("category");

-- Query: Filter exercises by difficulty
CREATE INDEX IF NOT EXISTS "idx_exercises_difficulty" ON "exercise"("difficulty");

-- Query: Combined - category and difficulty for filtering
CREATE INDEX IF NOT EXISTS "idx_exercises_category_difficulty" ON "exercise"("category", "difficulty");

-- Specialist indexes
-- Query: Get specialists by user (already have unique on user_id, but adding explicit index)
CREATE INDEX IF NOT EXISTS "idx_specialist_user_id" ON "specialist"("user_id");

-- Query: Get specialists by specialty
CREATE INDEX IF NOT EXISTS "idx_specialist_specialty" ON "specialist"("specialty");
