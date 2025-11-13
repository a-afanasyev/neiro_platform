/**
 * Общие типы
 */

/**
 * Utility типы
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string; // UUID

/**
 * Временные метки
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft delete
 */
export interface SoftDeletable {
  archivedAt?: Date | null;
}

/**
 * Статусы маршрута
 */
export type RouteStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

/**
 * Статусы фазы
 */
export type PhaseStatus = 'planned' | 'active' | 'on_hold' | 'completed';

/**
 * Статусы назначения
 */
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

/**
 * Статусы отчета
 */
export type ReportStatus = 'completed' | 'partial' | 'failed';

/**
 * Статусы проверки отчета
 */
export type ReviewStatus = 'not_reviewed' | 'approved' | 'needs_attention' | 'rejected';

/**
 * Каналы выполнения
 */
export type DeliveryChannel = 'in_person' | 'home' | 'telepractice';

/**
 * Приоритеты
 */
export type Priority = 'high' | 'medium' | 'low';

/**
 * Настроение ребенка
 */
export type ChildMood = 'good' | 'neutral' | 'difficult';

/**
 * Категории упражнений
 */
export type ExerciseCategory = 
  | 'cognitive'
  | 'speech'
  | 'motor'
  | 'sensory'
  | 'social'
  | 'daily'
  | 'academic';

/**
 * Сложность упражнения
 */
export type ExerciseDifficulty = 'beginner' | 'intermediate' | 'advanced';

