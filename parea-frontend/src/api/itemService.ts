// src/api/itemService.ts
import axiosClient from './axiosClient';
import type { ItemCreateReq } from '../types';

export const itemService = {
  addItem: async (sessionId: number, data: ItemCreateReq) => {
    await axiosClient.post(`/sessions/${sessionId}/items`, data);
  },
  removeItem: async (itemId: number) => {
    await axiosClient.delete(`/items/${itemId}`);
  },
  shareItem: async (itemId: number, participantIds: number[]) => {
    await axiosClient.post(`/items/${itemId}/share`, { participantIds });
  }
};