export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  completed: boolean;
  createdAt: string;
  userId: string;
}

export interface DailyReport {
  date: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  percentage: number;
}

export interface WeeklyDayData {
  date: string;
  day: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
}

export interface WeeklyReport {
  weeklyData: WeeklyDayData[];
  totalCompleted: number;
  totalTasks: number;
  avgProductivity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
}

export interface Habit {
  _id: string;
  name: string;
  userId: string;
  createdAt: string;
}

export interface HabitEntry {
  _id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface MonthlyHabitData {
  habits: Habit[];
  entries: HabitEntry[];
  month: string; // YYYY-MM
}

