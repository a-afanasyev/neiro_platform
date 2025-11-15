-- ============================================
-- Neiro Platform - Database Initialization
-- Создание всех таблиц согласно Prisma schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Users and Authentication
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    external_id VARCHAR(100) UNIQUE,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'invited',
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);

-- ============================================
-- Specialists
-- ============================================

CREATE TABLE IF NOT EXISTS specialist (
    user_id UUID PRIMARY KEY,
    qualification TEXT,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    calendar_link VARCHAR(255),
    working_hours JSONB DEFAULT '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}, "wednesday": {"start": "09:00", "end": "18:00"}, "thursday": {"start": "09:00", "end": "18:00"}, "friday": {"start": "09:00", "end": "18:00"}}'::JSONB,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT specialist_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Children
-- ============================================

CREATE TABLE IF NOT EXISTS child (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    diagnosis TEXT,
    notes TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Child-Parent Relationships
-- ============================================

CREATE TABLE IF NOT EXISTS child_parent (
    child_id UUID NOT NULL,
    parent_id UUID NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (child_id, parent_id),
    CONSTRAINT child_parent_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT child_parent_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Assignments (Specialist-Child)
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL,
    specialist_id UUID NOT NULL,
    assigned_by_id UUID NOT NULL,
    assigned_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT assignments_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT assignments_specialist_id_fkey FOREIGN KEY (specialist_id) REFERENCES specialist(user_id) ON DELETE RESTRICT,
    CONSTRAINT assignments_assigned_by_id_fkey FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_assignments_child_id ON assignments(child_id);
CREATE INDEX idx_assignments_specialist_id ON assignments(specialist_id);
CREATE INDEX idx_assignments_status ON assignments(status);

-- ============================================
-- Diagnostic Sessions
-- ============================================

CREATE TABLE IF NOT EXISTS diagnostic_session (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL,
    performed_by UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMPTZ(6) NOT NULL,
    completed_at TIMESTAMPTZ(6),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    notes TEXT,
    results JSONB,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT diagnostic_session_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT diagnostic_session_performed_by_fkey FOREIGN KEY (performed_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_diagnostic_session_child_id ON diagnostic_session(child_id);
CREATE INDEX idx_diagnostic_session_status ON diagnostic_session(status);
CREATE INDEX idx_diagnostic_session_scheduled_at ON diagnostic_session(scheduled_at);

-- ============================================
-- IEP (Individual Education Plan)
-- ============================================

CREATE TABLE IF NOT EXISTS iep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL,
    created_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    goals TEXT NOT NULL,
    accommodations TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    document_url VARCHAR(500),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT iep_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT iep_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_iep_child_id ON iep(child_id);
CREATE INDEX idx_iep_status ON iep(status);

-- ============================================
-- Goals and Progress Tracking
-- ============================================

CREATE TABLE IF NOT EXISTS goal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iep_id UUID NOT NULL,
    child_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_value DECIMAL(10,2),
    current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    measurement_unit VARCHAR(50),
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT goal_iep_id_fkey FOREIGN KEY (iep_id) REFERENCES iep(id) ON DELETE CASCADE,
    CONSTRAINT goal_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE
);

CREATE INDEX idx_goal_iep_id ON goal(iep_id);
CREATE INDEX idx_goal_child_id ON goal(child_id);
CREATE INDEX idx_goal_status ON goal(status);

-- ============================================
-- Activities/Exercises
-- ============================================

CREATE TABLE IF NOT EXISTS activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID,
    created_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    media_urls TEXT[],
    estimated_duration INTEGER,
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'medium',
    tags TEXT[],
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT activity_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES goal(id) ON DELETE SET NULL,
    CONSTRAINT activity_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_activity_goal_id ON activity(goal_id);
CREATE INDEX idx_activity_created_by ON activity(created_by);
CREATE INDEX idx_activity_is_public ON activity(is_public);

-- ============================================
-- Activity Completions
-- ============================================

CREATE TABLE IF NOT EXISTS activity_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID NOT NULL,
    child_id UUID NOT NULL,
    completed_by UUID NOT NULL,
    completed_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    duration_minutes INTEGER,
    feedback TEXT,
    rating INTEGER,
    media_urls TEXT[],
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT activity_completion_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES activity(id) ON DELETE CASCADE,
    CONSTRAINT activity_completion_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT activity_completion_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_activity_completion_activity_id ON activity_completion(activity_id);
CREATE INDEX idx_activity_completion_child_id ON activity_completion(child_id);

-- ============================================
-- Reports
-- ============================================

CREATE TABLE IF NOT EXISTS report (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL,
    created_by UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    document_url VARCHAR(500),
    is_sent BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_child_id_fkey FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
    CONSTRAINT report_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX idx_report_child_id ON report(child_id);
CREATE INDEX idx_report_created_by ON report(created_by);
CREATE INDEX idx_report_type ON report(type);

-- ============================================
-- Messaging System
-- ============================================

CREATE TABLE IF NOT EXISTS conversation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255),
    type VARCHAR(20) NOT NULL DEFAULT 'direct',
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_participant (
    conversation_id UUID NOT NULL,
    user_id UUID NOT NULL,
    joined_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_read_at TIMESTAMPTZ(6),
    PRIMARY KEY (conversation_id, user_id),
    CONSTRAINT conversation_participant_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT conversation_participant_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    media_urls TEXT[],
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT message_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
    CONSTRAINT message_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_message_conversation_id ON message(conversation_id);
CREATE INDEX idx_message_sent_at ON message(sent_at);

-- ============================================
-- Notifications
-- ============================================

CREATE TABLE IF NOT EXISTS notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notification_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_is_read ON notification(is_read);

-- ============================================
-- Platform Settings
-- ============================================

CREATE TABLE IF NOT EXISTS platform_setting (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_by UUID,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT platform_setting_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================
-- Audit Log
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_entity_type_id ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ============================================
-- Outbox (Event-Driven Architecture)
-- ============================================

CREATE TABLE IF NOT EXISTS outbox (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    published BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ(6),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbox_published ON outbox(published);
CREATE INDEX idx_outbox_aggregate ON outbox(aggregate_type, aggregate_id);

-- ============================================
-- Success Message
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Database schema initialized successfully!';
END
$$;

