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
    const { data } = await apiClient.get<ApiResponse<Booking[]>>('/bookings', {
      params: {
        ...params,
        statuses: 'completed,cancelled,rejected',
        limit: params.limit ?? 50,
      },
    });
    return data;
  },
  async get(id: string) {
    const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
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

  updateStatus: async (bookingId: string, action: 'approve' | 'reject' | 'cancel' | 'complete', reason?: string) => {
    const res = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${bookingId}/status`, { action, reason });
    return res.data.data;
  },

  async approve(id: string) {
    return this.updateStatus(id, 'approve');
  },

  async reject(id: string) {
    return this.updateStatus(id, 'reject');
  },

  async complete(id: string) {
    return this.updateStatus(id, 'complete');
  },

  async downloadAgreement(id: string) {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("ORCHARD LEASE AGREEMENT", 20, 30);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Agreement ID: ${id}`, 20, 45);
    doc.text("This document certifies a lease booking on OrchardLease platform.", 20, 60);
    doc.text("Terms and conditions apply as per the platform user agreement.", 20, 70);
    doc.save(`lease_agreement_${id}.pdf`);
  }
};
