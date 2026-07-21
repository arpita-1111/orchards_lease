import apiClient from '@/lib/apiClient';
import type { ApiResponse, Booking } from '@/types';

export const bookingService = {
  list: async (params?: { role?: string; status?: string; page?: number }) => {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data.data;
  },

  create: async (data: { orchardId: string; startDate: string; endDate: string; message?: string }) => {
    const res = await apiClient.post<ApiResponse<Booking>>('/bookings', data);
    return res.data.data;
  },

  // Lease Renewal Request Method (Issue #27)
  requestRenewal: async (bookingId: string, data: { newEndDate: string; message?: string }) => {
    const res = await apiClient.post<ApiResponse<Booking>>(`/bookings/${bookingId}/renew`, data);
    return res.data.data;
  },

  updateStatus: async (bookingId: string, action: 'approve' | 'reject' | 'cancel', reason?: string) => {
    const res = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/status`, { action, reason });
    return res.data.data;
  },
};
