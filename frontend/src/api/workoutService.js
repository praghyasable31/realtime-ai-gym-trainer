import api from './axios';

export const workoutService = {
  // Auth
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/profile', data);
    return res.data;
  },

  // Workouts
  saveWorkout: async (workoutData) => {
    const res = await api.post('/workouts', workoutData);
    return res.data;
  },

  getWorkouts: async (params = {}) => {
    const res = await api.get('/workouts', { params });
    return res.data;
  },

  getWorkoutById: async (id) => {
    const res = await api.get(`/workouts/${id}`);
    return res.data;
  },

  deleteWorkout: async (id) => {
    const res = await api.delete(`/workouts/${id}`);
    return res.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
