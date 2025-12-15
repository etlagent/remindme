// ============================================
// DECIDE TO DO - TypeScript Types
// ============================================

// ============================================
// HABIT TYPES
// ============================================

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCheck {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD' format
  checked: boolean;
  checked_at?: string;
}

export interface HabitStreak {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckedDate: string;
}

export interface HabitStats {
  habitId: string;
  totalChecks: number;
  weekChecks: number;
  monthChecks: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

// ============================================
// PROJECT TYPES
// ============================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// WORKSPACE TYPES
// ============================================

export interface WorkspaceTodo {
  id: string;
  user_id: string;
  text: string;
  status: 'draft' | 'ready' | 'converted';
  order_index: number;
  ai_generated: boolean;
  is_breakdown: boolean;
  parent_id?: string;
  project_id?: string;
  estimated_minutes?: number;
  scheduled_for?: string; // Date string for calendar scheduling
  completed?: boolean; // Track completion status
  created_at: string;
  subtasks?: WorkspaceTodo[];
  source_id?: string;
}

export interface AIExtractionResult {
  todos: string[];
  priority?: 'high' | 'medium' | 'low';
  category?: 'personal' | 'business' | 'both';
  estimatedMinutes?: number[];
}

export interface AIBreakdownResult {
  subtasks: {
    text: string;
    estimatedMinutes?: number;
    order: number;
  }[];
  totalEstimatedMinutes: number;
  suggestion?: string;
}

// ============================================
// TASK TYPES
// ============================================

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  
  // Priority & Category
  priority: 'high' | 'medium' | 'low';
  category: 'personal' | 'business' | 'both' | 'habit';
  
  // Hierarchy
  parent_id?: string;
  order_index: number;
  subtasks?: Task[];
  
  // Status
  status: 'todo' | 'in_progress' | 'done' | 'carried_over';
  is_top_three: boolean;
  
  // Dates
  scheduled_for?: string;
  completed_at?: string;
  carried_from?: string;
  
  // Time
  estimated_minutes?: number;
  actual_minutes?: number;
  
  // Context
  source_type?: 'manual' | 'workspace' | 'meeting' | 'conversation' | 'habit';
  source_id?: string;
  business_id?: string;
  
  // Recurrence
  recurring?: RecurringConfig;
  
  // AI
  ai_breakdown?: {
    subtasks: Task[];
    estimatedTime: string;
  };
  
  tags: string[];
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  endsOn?: string;
}

export interface DailyPlan {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  
  top_three: string[]; // Task IDs
  scheduled: string[]; // Task IDs
  carried_over: string[]; // Task IDs
  
  day_review?: DayReview;
  
  created_at: string;
  updated_at: string;
}

export interface DayReview {
  completedCount: number;
  notes?: string;
  timestamp: string;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface HabitAnalytics {
  totalHabits: number;
  activeHabits: number;
  todayCompletion: number;
  weekCompletion: number;
  monthCompletion: number;
  topStreaks: {
    habitId: string;
    habitName: string;
    streak: number;
  }[];
}

export interface TaskAnalytics {
  totalTasks: number;
  completedToday: number;
  completedWeek: number;
  completedMonth: number;
  pendingTasks: number;
  carriedOverTasks: number;
  avgCompletionTime: number;
  completionRate: number;
  topCategories: {
    category: string;
    count: number;
  }[];
}

// ============================================
// UI STATE TYPES
// ============================================

export interface HabitTrackerState {
  currentMonth: Date;
  habits: Habit[];
  checks: Map<string, HabitCheck>; // key: `${habitId}_${date}`
  loading: boolean;
  error?: string;
}

export interface WorkspaceState {
  todos: WorkspaceTodo[];
  activeTab: 'quick' | 'paste' | 'brainstorm';
  loading: boolean;
  error?: string;
}

export interface TasksState {
  tasks: Task[];
  dailyPlan?: DailyPlan;
  filters: TaskFilters;
  loading: boolean;
  error?: string;
}

export interface TaskFilters {
  categories: ('personal' | 'business' | 'both' | 'habit')[];
  priorities: ('high' | 'medium' | 'low')[];
  status: ('todo' | 'in_progress' | 'done' | 'carried_over')[];
  showHabits: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
