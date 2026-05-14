import api from './api';

export interface CreateReportData {
  image: string;
  latitude: number;
  longitude: number;
  waste_type: string;
  smell: boolean;
  severity: string;
  note?: string;
}

export interface CompleteReportData {
  image: string;
  latitude: number;
  longitude: number;
}

export const reportService = {
  // Student API
  createReport: async (data: CreateReportData) => {
    const response = await api.post('/reports/create', data);
    return response.data;
  },
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },
  getReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  revokeReport: async (id: string) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  // Supervisor API
  getSupervisorPendingReports: async () => {
    const response = await api.get('/supervisor/reports/pending');
    return response.data;
  },
  getSupervisorCompletedReports: async () => {
    const response = await api.get('/supervisor/reports/completed');
    return response.data;
  },
  validateLocation: async (reportId: string, latitude: number, longitude: number) => {
    const response = await api.post(`/supervisor/completion/${reportId}/validate-location`, { latitude, longitude });
    return response.data;
  },
  completeReport: async (reportId: string, data: CompleteReportData) => {
    const response = await api.post(`/supervisor/completion/${reportId}`, data);
    return response.data;
  },

  // Public API
  getAllReports: async () => {
    const response = await api.get('/reports/all');
    return response.data;
  },
  getPendingReports: async () => {
    const response = await api.get('/reports/pending');
    return response.data;
  }
};
