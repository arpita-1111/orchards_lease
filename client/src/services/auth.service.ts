import api from '@/lib/apiClient';
import type { ApiResponse, User, Role } from '@/types';

interface AuthPayload {
  user: User;
  accessToken: string;
  sessionId?: string;
}

export const authService = {
  async register(body: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
  }) {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/register', body);
    return data.data;
  },

  async login(body: { email: string; password: string; remember?: boolean }) {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/login', body);
    return data.data;
  },

  async adminLogin(body: { email: string; password: string }) {
    const { data } = await api.post<ApiResponse<AuthPayload>>('/auth/admin/login', body);
    return data.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async me() {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data.data;
  },

  async forgotPassword(email: string) {
    const { data } = await api.post<ApiResponse<null>>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string) {
    const { data } = await api.post<ApiResponse<null>>('/auth/reset-password', {
      token,
      password,
    });
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post<ApiResponse<null>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async verifyEmail(token: string) {
    const { data } = await api.post<ApiResponse<null>>('/auth/verify-email', { token });
    return data;
  },

  async listSessions() {
    const { data } = await api.get<ApiResponse<unknown[]>>('/auth/sessions');
    return data.data;
  },

  async revokeSession(id: string) {
    await api.delete(`/auth/sessions/${id}`);
  },

  async revokeOtherSessions() {
    await api.delete('/auth/sessions/others');
  },
};
