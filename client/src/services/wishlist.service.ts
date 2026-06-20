import api from '@/lib/apiClient';
import type { ApiResponse, Orchard } from '@/types';

export const wishlistService = {
  async getWishlist() {
    const { data } = await api.get<ApiResponse<Orchard[]>>('/wishlist');
    return data.data;
  },

  async toggle(orchardId: string) {
    const { data } = await api.post<ApiResponse<{ added: boolean; count: number }>>(
      `/wishlist/${orchardId}/toggle`
    );
    return data.data;
  },

  async getCompare() {
    const { data } = await api.get<ApiResponse<Orchard[]>>('/wishlist/compare');
    return data.data;
  },

  async toggleCompare(orchardId: string) {
    const { data } = await api.post<ApiResponse<string[]>>(`/wishlist/compare/${orchardId}/toggle`);
    return data.data;
  },

  async clearCompare() {
    await api.delete('/wishlist/compare');
  },

  async getRecentlyViewed() {
    const { data } = await api.get<ApiResponse<Orchard[]>>('/wishlist/recently-viewed');
    return data.data;
  },
};
