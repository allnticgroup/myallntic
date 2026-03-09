import { useLocalStorage } from './useLocalStorage';
import { AuditLogEntry, AuditAction, AuditEntity } from '@/types';

const MAX_ENTRIES = 500;

export function useAuditLog() {
  const [entries, setEntries] = useLocalStorage<AuditLogEntry[]>('allntic_audit_log', []);

  const addEntry = (action: AuditAction, entity: AuditEntity, entityId: string, entityLabel: string, details?: string) => {
    const entry: AuditLogEntry = {
      id: crypto.randomUUID(),
      action,
      entity,
      entityId,
      entityLabel,
      timestamp: new Date().toISOString(),
      details,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
  };

  const clearLog = () => setEntries([]);

  return { entries, addEntry, clearLog };
}
