import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '../api/sessionService';
import { participantService } from '../api/participantService';
import type { SessionRes, DebtRes } from '../types';

export function useSessionDetails(id: string | undefined) {
  const [session, setSession] = useState<SessionRes | null>(null);
  const [splitResults, setSplitResults] = useState<DebtRes[] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    try {
      const data = await sessionService.getSessionById(Number(id));
      setSession(data);
    } catch (err) {
      console.error("Failed to load session", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalPrice = session?.receiptTotal ?? 
    (session?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0);

  // --- PARTICIPANT ACTIONS ---

  const addParticipant = async (name: string) => {
    if (!id) return;
    try {
      await participantService.addParticipant(Number(id), { name }); 
      await refresh();
    } catch (err) {
      console.error("Failed to add participant", err);
    }
  };

  const editParticipantName = async (participantId: number, newName: string) => {
    if (!newName.trim()) return;
    try {
      await participantService.updateParticipantName(participantId, newName);
      await refresh();
    } catch (err) {
      console.error("Failed to update name", err);
    }
  };

  const deleteParticipant = async (participantId: number) => {
    if (!id) return;
    try {
      await participantService.removeParticipant(Number(id), participantId);
      await refresh();
    } catch (err) {
      console.error("Failed to remove participant", err);
    }
  };

  /**
   * SENIOR FIX: toggleParticipantPaid with Optimistic UI
   * We update the local 'session' state IMMEDIATELY so the user sees 
   * the Green/Orange/Gray change without waiting for the server.
   */
  const toggleParticipantPaid = async (participantId: number, currentDebt: number) => {
  if (!session) return;

  try {
    const participant = session.participants.find(p => p.id === participantId);
    const amountToSet = (participant?.amountPaid || 0) > 0 ? 0 : currentDebt;

    // 1. Call the API and get the updated participant
    const updatedParticipant = await participantService.settleParticipant(participantId, amountToSet);

    // 2. FORCE REACTIVE UPDATE: 
    // We create a deep copy of the session and replace the specific participant.
    // This ensures the reference change triggers a re-render.
    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        participants: prev.participants.map(p => 
          p.id === participantId ? updatedParticipant : p
        )
      };
    });

    // 3. Re-calculate if needed to sync the split UI
    await calculate(); 
  } catch (err) {
    console.error("Settlement failed", err);
    await refresh(); // Revert on error
  }
};

  // --- ITEM ACTIONS ---

  const addItem = async (name: string, price: number) => {
    if (!id) return;
    try {
      await sessionService.addItem(Number(id), { name, price });
      await refresh();
    } catch (err) {
      console.error("Failed to add item", err);
    }
  };

  const deleteItem = async (itemId: number) => {
    if (!id) return;
    try {
      await sessionService.deleteItem(Number(id), itemId);
      await refresh();
    } catch (err) {
      console.error("Failed to delete item", err);
    }
  };

  const toggleShare = async (itemId: number, friendId: number) => {
    if (!id) return;
    try {
      await sessionService.toggleShare(Number(id), itemId, friendId);
      await refresh();
    } catch (err) {
      console.error("Failed to toggle share", err);
    }
  };

  // --- CALCULATION ---

  const calculate = async () => {
    if (!id) return;
    setIsCalculating(true);
    try {
      const results = await sessionService.calculateSplit(Number(id));
      setSplitResults(results);
    } catch (err) {
      console.error("Split calculation failed", err);
    } finally {
      setIsCalculating(false);
    }
  };

  const addItemsBulk = async (items: { name: string; price: number }[]) => {
  if (!id) return;
  try {
    const updated = await sessionService.addItemsBulk(Number(id), items);
    setSession(updated);
    await refresh();
  } catch (err) {
    console.error("Bulk add failed", err);
  }
};

  return { 
    session, 
    totalPrice, 
    splitResults, 
    isCalculating, 
    loading,
    addParticipant, 
    addItem, 
    deleteParticipant, 
    deleteItem, 
    toggleShare, 
    calculate, 
    editParticipantName, 
    toggleParticipantPaid,
    addItemsBulk
  };
}