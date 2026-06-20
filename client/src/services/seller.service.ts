import api from '@/lib/apiClient';
import type { ApiResponse } from '@/types';

export interface SellerOverview {
  totalOrchards: number;
  activeListings: number;
  totalViews: number;
  totalBookings: number;
  bookingsByStatus: Record<string, number>;
  revenue: number;
  completedBookings: number;
  pendingApprovals: number;
}

export interface RevenuePoint {
  label: string;
  revenue: number;
  bookings: number;
}

export interface PerformanceRow {
  _id: string;
  gardenName: string;
  slug: string;
  thumbnail: string;
  status: string;
  viewCount: number;
  favouriteCount: number;
  ratingAverage: number;
  revenue: number;
  bookings: number;
}

export const sellerService = {
  async overview() {
    const { data } = await api.get<ApiResponse<SellerOverview>>('/seller/overview');
    return data.data;
  },

  async revenue(months = 6) {
    const { data } = await api.get<ApiResponse<RevenuePoint[]>>('/seller/revenue', {
      params: { months },
    });
    return data.data;
  },

  async performance(limit = 10) {
    const { data } = await api.get<ApiResponse<PerformanceRow[]>>('/seller/performance', {
      params: { limit },
    });
    return data.data;
  },

  exportBookingsUrl: `${import.meta.env.VITE_API_URL || '/api/v1'}/seller/export/bookings`,
};
