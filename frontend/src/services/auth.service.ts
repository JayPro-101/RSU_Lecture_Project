
import { api } from './api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role:
    | 'STUDENT'
    | 'STUDENT_MODERATOR'
    | 'ACADEMIC_REPRESENTATIVE'
    | 'PLATFORM_ADMIN';
  accountStatus: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface LoginData {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

interface RefreshData {
  accessToken: string;
  expiresIn: number;
}

let accessToken: string | null = null;

export const authService = {
  getAccessToken(): string | null {
    return accessToken;
  },

  isAuthenticated(): boolean {
    return accessToken !== null;
  },

  async register(payload: {
    email: string;
    displayName: string;
    password: string;
  }): Promise<AuthUser> {
    const response = await api.post<ApiResponse<AuthUser>>(
      '/auth/register',
      payload
    );

    if (!response.data) {
      throw new Error('Registration response did not contain user data.');
    }

    return response.data;
  },

  async login(payload: {
    email: string;
    password: string;
  }): Promise<AuthUser> {
    const response = await api.post<ApiResponse<LoginData>>(
      '/auth/login',
      payload
    );

    if (!response.data?.accessToken || !response.data.user) {
      throw new Error('Invalid login response from server.');
    }

    accessToken = response.data.accessToken;

    return response.data.user;
  },

  async refresh(): Promise<string> {
    const response = await api.post<ApiResponse<RefreshData>>(
      '/auth/refresh',
      {}
    );

    if (!response.data?.accessToken) {
      accessToken = null;
      throw new Error('Session expired. Please log in again.');
    }

    accessToken = response.data.accessToken;

    return accessToken;
  },

  async getCurrentUser(): Promise<AuthUser> {
    if (!accessToken) {
      throw new Error('No active access token.');
    }

    const response = await api.get<ApiResponse<AuthUser>>(
      '/auth/me',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.data) {
      throw new Error('Unable to retrieve user profile.');
    }

    return response.data;
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  },

  async resendVerification(email: string): Promise<void> {
    await api.post('/auth/resend-verification', { email });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email });
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
  }): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {});
    } finally {
      accessToken = null;
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await api.post(
        '/auth/logout-all',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } finally {
      accessToken = null;
    }
  },
};
