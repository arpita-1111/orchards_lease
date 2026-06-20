import api from '@/lib/apiClient';
import type { ApiResponse, User, NotificationSettings } from '@/types';

interface ActivityEvent {
  type: string;
  action: string;
  title: string;
  detail: string;
  link: string;
  at: string;
}

export const userService = {
  async getProfile() {
    const { data } = await api.get<ApiResponse<User>>('/users/me');
    return data.data;
  },

  async updateProfile(body: Partial<User>) {
    const { data } = await api.patch<ApiResponse<User>>('/users/me', body);
    return data.data;
  },

  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('avatar', file);
    const { data } = await api.post<ApiResponse<{ avatar: string }>>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async updateNotifications(body: Partial<NotificationSettings>) {
    const { data } = await api.patch<ApiResponse<NotificationSettings>>(
      '/users/me/notifications',
      body
    );
    return data.data;
  },

  async getActivity() {
    const { data } = await api.get<ApiResponse<ActivityEvent[]>>('/users/me/activity');
    return data.data;
  },

  async deleteAccount(password: string) {
    await api.delete('/users/me', { data: { password } });
  },
};
