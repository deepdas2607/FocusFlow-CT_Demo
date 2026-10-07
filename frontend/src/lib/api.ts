/**
 * API client - handles all HTTP communication between the frontend and backend.
 *
 * HOW THIS WORKS:
 * - All API calls go through the apiRequest() helper function.
 * - The function reads the JWT token from localStorage and attaches it to every request.
 * - If a request returns 401 (Unauthorized), the user is redirected to login.
 *
 * BASE URL:
 * The backend runs on http://localhost:4000 during development.
 * In production, set NEXT_PUBLIC_API_URL to your deployed backend URL.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Key used to store the JWT in localStorage
export const TOKEN_KEY = 'focusflow_token';

// ─── Core request helper ──────────────────────────────────────────────────────

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, any>;
}

/**
 * Makes an HTTP request to the backend API.
 * Automatically attaches the JWT token if available.
 * Throws an error with a user-friendly message if the request fails.
 */
async function apiRequest<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  // Build request headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Attach the JWT token from localStorage if it exists
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the HTTP request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse the JSON response
  const data = await response.json();

  // If the server returned an error status code, throw an error
  if (!response.ok) {
    throw new Error(data.error || 'An unexpected error occurred.');
  }

  return data as T;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authApi = {
  register: (data: RegisterData) =>
    apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),

  login: (data: LoginData) =>
    apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: data }),

  getMe: () =>
    apiRequest<{ user: User }>('/api/auth/me'),
};

// ─── Tasks API ────────────────────────────────────────────────────────────────

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  category?: string;
  priority?: string;
}

export interface TaskResponse {
  message: string;
  task: Task;
}

export interface CompleteTaskResponse {
  message: string;
  task: Task;
  totalTasksCompleted: number;
  isFirstCompletion: boolean;
}

export const tasksApi = {
  getAll: () =>
    apiRequest<{ tasks: Task[] }>('/api/tasks'),

  create: (data: CreateTaskData) =>
    apiRequest<TaskResponse>('/api/tasks', { method: 'POST', body: data }),

  update: (id: number, data: Partial<CreateTaskData>) =>
    apiRequest<TaskResponse>(`/api/tasks/${id}`, { method: 'PUT', body: data }),

  delete: (id: number) =>
    apiRequest<{ message: string }>(`/api/tasks/${id}`, { method: 'DELETE' }),

  complete: (id: number) =>
    apiRequest<CompleteTaskResponse>(`/api/tasks/${id}/complete`, { method: 'POST' }),
};

// ─── Focus Sessions API ───────────────────────────────────────────────────────

export interface FocusSession {
  id: number;
  userId: number;
  taskId: number | null;
  duration: number;
  startedAt: string;
  completedAt: string | null;
  status: 'STARTED' | 'COMPLETED' | 'ABANDONED';
  task: Task | null;
}

export interface StartSessionResponse {
  message: string;
  session: FocusSession;
  isFirstSession: boolean;
}

export interface CompleteSessionResponse {
  message: string;
  session: FocusSession;
  elapsedMinutes: number;
  completedOnTime: boolean;
  totalCompletedSessions: number;
}

export interface AbandonSessionResponse {
  message: string;
  session: FocusSession;
  elapsedMinutes: number;
}

export const focusApi = {
  start: (data: { taskId?: number; duration: number }) =>
    apiRequest<StartSessionResponse>('/api/focus/start', { method: 'POST', body: data }),

  complete: (id: number) =>
    apiRequest<CompleteSessionResponse>(`/api/focus/${id}/complete`, { method: 'POST' }),

  abandon: (id: number) =>
    apiRequest<AbandonSessionResponse>(`/api/focus/${id}/abandon`, { method: 'POST' }),

  getHistory: () =>
    apiRequest<{ sessions: FocusSession[] }>('/api/focus/history'),
};

// ─── Profile API ──────────────────────────────────────────────────────────────

export interface UserPreferences {
  id: number;
  userId: number;
  notificationsEnabled: boolean;
  productivityReminders: boolean;
  sessionReminders: boolean;
  weeklySummary: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  occupation: string | null;
  interests: string | null;
  preferredFocusDuration: number;
  createdAt: string;
  preferences: UserPreferences | null;
}

export interface UpdateProfileData {
  name?: string;
  occupation?: string;
  interests?: string;
  preferredFocusDuration?: number;
  notificationsEnabled?: boolean;
  productivityReminders?: boolean;
  sessionReminders?: boolean;
  weeklySummary?: boolean;
}

export const profileApi = {
  get: () =>
    apiRequest<{ user: User }>('/api/profile'),

  update: (data: UpdateProfileData) =>
    apiRequest<{ message: string; user: User }>('/api/profile', { method: 'PUT', body: data }),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export interface DashboardData {
  todaysTasks: Task[];
  totalTasksCompleted: number;
  totalFocusSessionsCompleted: number;
  totalFocusMinutes: number;
  tasksCompletedToday: number;
  currentStreak: number;
}

export const dashboardApi = {
  getData: () =>
    apiRequest<DashboardData>('/api/dashboard'),
};

