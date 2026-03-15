import axiosClient from './axiosClient';
import type { ParticipantCreateReq, ParticipantSettleReq, ParticipantRes } from '../types';

export const participantService = {
  addParticipant: async (sessionId: number, data: ParticipantCreateReq) => {
    await axiosClient.post(`/sessions/${sessionId}/participants`, data);
  },
  
  removeParticipant: async (sessionId: number, participantId: number) => {
    // Note: Added sessionId here to match your Backend Service method signature
    await axiosClient.delete(`/${sessionId}/participants/${participantId}`);
  },

  updateParticipantName: async (participantId: number, name: string) => {
    await axiosClient.put(`/participants/${participantId}`, { name });
  },

  /**
   * SENIOR FIX: The Snapshot Settlement
   * Sends { amount: number } to match ParticipantSettleReq
   */
 settleParticipant: async (participantId: number, amount: number): Promise<ParticipantRes> => {
    const data: ParticipantSettleReq = { amount };
    const response = await axiosClient.patch<ParticipantRes>(`/participants/${participantId}/settle`, data);
    return response.data;
  },

};