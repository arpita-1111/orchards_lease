import api from '@/lib/apiClient';
import type { ApiResponse, AppNotification } from '@/types';

export const notificationService = {
  async list(params: { page?: number; unread?: boolean } = {}) {
    const { data } = await api.get<ApiResponse<AppNotification[]>>('/notifications', { params });
    return data;
  },

  async unreadCount() {
    const { data } = await api.get<ApiResponse<{ unreadCount: number }>>(
      '/notifications/unread-count'
    );
    return data.data.unreadCount;
  },

  async markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead() {
    await api.patch('/notifications/read-all');
  },

  async remove(id: string) {
    await api.delete(`/notifications/${id}`);
  },
};
