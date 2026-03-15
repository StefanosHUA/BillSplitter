import { useState, useEffect, useCallback } from 'react';
import { sessionService } from '../api/sessionService';
import { authService } from '../api/authService';
import type { SessionRes } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionRes[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = authService.getCurrentUserId();

  const loadSessions = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const data = await sessionService.getHostSessions(currentUserId);
      setSessions(data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const createSession = async (title: string) => {
    if (!currentUserId) return;
    await sessionService.createSession({ title, hostId: currentUserId });
    await loadSessions();
  };

  const deleteSession = async (id: number) => {
    await sessionService.deleteSession(id);
    await loadSessions();
  };

  return { sessions, loading, createSession, deleteSession, currentUserId };
}