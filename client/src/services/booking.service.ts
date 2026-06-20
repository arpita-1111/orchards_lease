import api from '@/lib/apiClient';
import type { ApiResponse, Booking } from '@/types';

export const bookingService = {
  async list(params: { role?: 'renter' | 'seller'; status?: string; page?: number } = {}) {
    const { data } = await api.get<ApiResponse<Booking[]>>('/bookings', { params });
    return data;
  },

  async get(id: string) {
    const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return data.data;
  },

  async create(body: { orchardId: string; startDate: string; endDate: string; message?: string }) {
    const { data } = await api.post<ApiResponse<Booking>>('/bookings', body);
    return data.data;
  },

  async approve(id: string) {
    const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/approve`);
    return data.data;
  },

  async reject(id: string, reason?: string) {
    const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/reject`, { reason });
    return data.data;
  },

  async cancel(id: string, reason?: string) {
    const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, { reason });
    return data.data;
  },

  async complete(id: string) {
    const { data } = await api.post<ApiResponse<Booking>>(`/bookings/${id}/complete`);
    return data.data;
  },
};
