import apiClient from '@/lib/apiClient';
import type { ApiResponse, Booking } from '@/types';

export const bookingService = {
  list: async (params?: { role?: string; status?: string; page?: number }) => {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings', { params });
    return res.data;
  },

  async history(params: {
    role: 'renter' | 'seller';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<ApiResponse<Booking[]>>('/bookings', {
      params: {
        ...params,
        statuses: 'completed,cancelled,rejected',
        limit: params.limit ?? 50,
      },
    });
    return data;
  },
  async get(id: string) {
    const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return data.data;
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
