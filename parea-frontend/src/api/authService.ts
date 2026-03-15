// src/api/authService.ts
import axiosClient from './axiosClient';
import type { LoginReq, RegisterReq, AuthRes } from '../types';

export const authService = {
  login: async (data: LoginReq): Promise<AuthRes> => {
    const response = await axiosClient.post<AuthRes>('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('parea_token', response.data.token);
      localStorage.setItem('parea_user_id', response.data.id.toString());
      localStorage.setItem('parea_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  register: async (data: RegisterReq): Promise<AuthRes> => {
    const response = await axiosClient.post<AuthRes>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('parea_token', response.data.token);
      localStorage.setItem('parea_user_id', response.data.id.toString());
      localStorage.setItem('parea_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('parea_token');
    localStorage.removeItem('parea_user_id');
    localStorage.removeItem('parea_user');
  },
  
  getCurrentUserId: (): number | null => {
    const id = localStorage.getItem('parea_user_id');
    return id ? parseInt(id) : null;
  },

  googleLogin: async (googleToken: string): Promise<AuthRes> => {
    const response = await axiosClient.post<AuthRes>('/auth/google', { token: googleToken });
    if (response.data.token) {
      localStorage.setItem('parea_token', response.data.token);
      localStorage.setItem('parea_user_id', response.data.id.toString());
      localStorage.setItem('parea_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  getToken: (): string | null => {
    return localStorage.getItem('parea_token');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('parea_token');
    if (!token) return false;

    try {
      // JWTs must have exactly 3 parts: Header.Payload.Signature
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error("Invalid structure");

      // Decoding the Payload (parts[1])
      const payload = JSON.parse(atob(parts[1]));
      const expiry = payload.exp * 1000;

      // Check if current time is past expiration
      if (Date.now() > expiry) {
        authService.logout();
        return false;
      }
      return true;
    } catch (e) {
      // This catches 1-character deletions or malformed base64 strings
      console.error("Token security check failed:", e);
      authService.logout();
      return false;
    }
  },
};