// --- RESPONSE TYPES ---

export interface ParticipantRes {
  id: number;
  name: string;
  amountPaid: number; // Now correctly matches your "Snapshot" backend model
}

export interface ItemRes {
  id: number;
  itemName: string;
  price: number;
  sharedByParticipantIds: number[];
}

export interface SessionRes {
  id: number;
  title: string;
  date: string;
  isSettled: boolean;
  participants: ParticipantRes[];
  items: ItemRes[];
  receiptTotal: number | null;
}

export interface DebtRes {
  participantId: number;
  name: string;
  amount: number;
}

// --- REQUEST TYPES ---

export interface SessionCreateReq {
  title: string;
  hostId: number;
}

export interface ParticipantCreateReq {
  name: string;
}

/** * NEW: Necessary for the "Snapshot" settlement.
 * This ensures TypeScript knows we are sending { amount: number } 
 * to the backend patch request.
 */
export interface ParticipantSettleReq {
  amount: number;
}

export interface ItemCreateReq {
  name: string; // Backend record expects 'name' usually, mapped to 'itemName' in Res
  price: number;
}

export interface ItemShareReq {
  participantIds: number[];
}

// --- AUTHENTICATION TYPES ---

export interface LoginReq {
  username: string;
  password?: string; 
}

export interface RegisterReq {
  username: string;
  email: string;
  password?: string;
  confirmPassword: string;
}

export interface AuthRes {
  token: string;
  id: number;
  username: string;
  email: string;
}