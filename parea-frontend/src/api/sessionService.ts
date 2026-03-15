// src/api/sessionService.ts
import axiosClient from './axiosClient';
import type { SessionRes } from '../types';

export const sessionService = {
  
  // --- READ ---
  getHostSessions: async (hostId: number): Promise<SessionRes[]> => {
    const response = await axiosClient.get(`/sessions/host/${hostId}`);
    return response.data;
  },

  getSessionById: async (sessionId: number): Promise<SessionRes> => {
    const response = await axiosClient.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // --- CREATE / UPDATE ---
  createSession: async (data: { title: string; hostId: number }): Promise<SessionRes> => {
    const response = await axiosClient.post('/sessions', data);
    return response.data;
  },

  // Change this method to accept the object structure
  addFriend: async (sessionId: number, data: { name: string }): Promise<SessionRes> => {
    const response = await axiosClient.post(`/api/sessions/${sessionId}/friends`, data);
    return response.data;
  },

  addItem: async (sessionId: number, data: { name: string; price: number }) => {
    const response = await axiosClient.post(`/sessions/${sessionId}/items`, data);
    return response.data;
  },

  toggleShare: async (sessionId: number, itemId: number, friendId: number) => {
    const response = await axiosClient.post(`/sessions/${sessionId}/items/${itemId}/share`, null, {
      params: { friendId }
    });
    return response.data;
  },

  // --- MATH ENGINE ---
  calculateSplit: async (sessionId: number) => {
    const response = await axiosClient.get(`/sessions/${sessionId}/calculate`);
    return response.data;
  },

  // ==========================================
  // DELETION ENDPOINTS (These were missing!)
  // ==========================================

  deleteSession: async (sessionId: number) => {
    await axiosClient.delete(`/sessions/${sessionId}`);
  },

  deleteFriend: async (sessionId: number, friendId: number) => {
    const response = await axiosClient.delete(`/sessions/${sessionId}/friends/${friendId}`);
    return response.data;
  },

  deleteItem: async (sessionId: number, itemId: number) => {
    const response = await axiosClient.delete(`/sessions/${sessionId}/items/${itemId}`);
    return response.data;
  },

  addItemsBulk: async (sessionId: number, items: { name: string; price: number }[]): Promise<SessionRes> => {
  const response = await axiosClient.post(`/sessions/${sessionId}/items/bulk`, { items });
  return response.data;
  }

};