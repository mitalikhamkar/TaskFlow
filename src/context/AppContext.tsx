//AppContext.ts
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TeamMember, User, AppContextType } from '../types';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [team, setTeam] = useState<TeamMember[]>(() => {
    const local = localStorage.getItem('taskflow_team');
    return local ? JSON.parse(local) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync team locally (as it is client-side workspace helpers)
  useEffect(() => {
    localStorage.setItem('taskflow_team', JSON.stringify(team));
  }, [team]);

  // Fetch with Authorization token helper
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('taskflow_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  };

  // Load User profile & Tasks on startup if token exists
  useEffect(() => {
    const initApp = async () => {
      const token = localStorage.getItem('taskflow_token');
      if (token) {
        try {
          // Fetch real user data from MongoDB
          const userData = await apiCall('/api/auth/profile');
          setCurrentUser(userData);
          setIsAuthenticated(true);

          // Fetch user's actual tasks
          const tasksData = await apiCall('/api/tasks');
          setTasks(tasksData);
        } catch (error: any) {
          const errMsg = error?.message || '';
          console.warn('Session initialization note (clearing expired session):', errMsg);
          logout();
        }
      }
      setLoading(false);
    };

    initApp();
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem('taskflow_token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);

      // Fetch user's actual tasks
      const tasksData = await apiCall('/api/tasks');
      setTasks(tasksData);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name: string, email: string, password?: string, confirmPassword?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = await apiCall('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      localStorage.setItem('taskflow_token', data.token);
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      setTasks([]); // Brand new user gets 0 preloaded tasks!

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('taskflow_token');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setTasks([]);
  };

  const addTask = async (taskInput: Omit<Task, 'id' | 'status'>) => {
    try {
      const newTask = await apiCall('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(taskInput),
      });
      setTasks((prev) => [newTask, ...prev]);
    } catch (err: any) {
      console.error('Add task failed:', err.message);
      alert(`Failed to add task: ${err.message}`);
    }
  };

  const updateTask = async (id: string, updatedFields: Partial<Task>) => {
    try {
      const updated = await apiCall(`/api/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedFields),
      });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err: any) {
      console.error('Update task failed:', err.message);
      alert(`Failed to update task: ${err.message}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await apiCall(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error('Delete task failed:', err.message);
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const addTeamMember = (memberInput: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberInput,
      id: `tm-${Date.now()}`,
    };
    setTeam((prev) => [...prev, newMember]);
  };

  const updateProfile = async (profileFields: Partial<User>) => {
    try {
      const updatedUser = await apiCall('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileFields),
      });
      setCurrentUser(updatedUser);
    } catch (err: any) {
      console.error('Update profile failed:', err.message);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-400">Loading your productivity workspace...</p>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        tasks,
        team,
        currentUser,
        isAuthenticated,
        login,
        logout,
        register,
        addTask,
        updateTask,
        deleteTask,
        addTeamMember,
        updateProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
