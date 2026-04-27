import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { store, newId, type Endpoint, type RequestLog } from "@/lib/mockdrop/store";
import { parseShareHash } from "@/lib/mockdrop/share";
import { toast } from "sonner";

type Ctx = {
  endpoints: Endpoint[];
  logs: RequestLog[];
  activeId: string | null;
  active: Endpoint | null;
  loading: boolean;
  selectEndpoint: (id: string | null) => void;
  upsertEndpoint: (e: Endpoint) => Promise<void>;
  createEndpoint: (partial?: Partial<Endpoint>) => Promise<Endpoint>;
  duplicateEndpoint: (id: string) => Promise<Endpoint | null>;
  deleteEndpoint: (id: string) => Promise<void>;
  addLog: (l: RequestLog) => Promise<void>;
  refreshLogs: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
};

const WorkspaceCtx = createContext<Ctx | null>(null);

const DEFAULT_PAYLOAD = `{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "role": "admin",
  "preferences": {
    "theme": "dark",
    "notifications": true
  },
  "createdAt": "2026-04-01T12:00:00Z"
}`;

const blank = (overrides: Partial<Endpoint> = {}): Endpoint => {
  const id = newId();
  const now = Date.now();
  return {
    id,
    label: "Untitled endpoint",
    payload: DEFAULT_PAYLOAD,
    status: 200,
    expiry: "Never",
    delay: 0,
    cors: true,
    method: "GET",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const list = await store.listEndpoints();
    setEndpoints(list);
    return list;
  }, []);

  const refreshLogs = useCallback(async () => {
    const list = await store.listLogs(undefined, 200);
    setLogs(list);
  }, []);

  // Initial load + share-hash import
  useEffect(() => {
    (async () => {
      const list = await refresh();
      await refreshLogs();

      const shared = parseShareHash();
      if (shared) {
        const e = blank({ ...shared, label: shared.label || "Shared endpoint" });
        await store.saveEndpoint(e);
        history.replaceState(null, "", window.location.pathname);
        const next = await refresh();
        setActiveId(e.id);
        toast.success("Shared endpoint imported!");
        setLoading(false);
        return;
      }

      if (list.length === 0) {
        const e = blank();
        await store.saveEndpoint(e);
        await refresh();
        setActiveId(e.id);
      } else {
        setActiveId(list[0].id);
      }
      setLoading(false);
    })();
  }, [refresh, refreshLogs]);

  const upsertEndpoint = useCallback(async (e: Endpoint) => {
    const updated = { ...e, updatedAt: Date.now() };
    await store.saveEndpoint(updated);
    await refresh();
  }, [refresh]);

  const createEndpoint = useCallback(async (partial: Partial<Endpoint> = {}) => {
    const e = blank(partial);
    await store.saveEndpoint(e);
    await refresh();
    setActiveId(e.id);
    return e;
  }, [refresh]);

  const duplicateEndpoint = useCallback(async (id: string) => {
    const src = await store.getEndpoint(id);
    if (!src) return null;
    const dup = blank({ ...src, id: newId(), label: `${src.label} (copy)`, createdAt: Date.now() });
    await store.saveEndpoint(dup);
    await refresh();
    setActiveId(dup.id);
    return dup;
  }, [refresh]);

  const deleteEndpoint = useCallback(async (id: string) => {
    await store.deleteEndpoint(id);
    const list = await refresh();
    if (activeId === id) setActiveId(list[0]?.id ?? null);
    await refreshLogs();
  }, [refresh, refreshLogs, activeId]);

  const addLog = useCallback(async (l: RequestLog) => {
    await store.addLog(l);
    await refreshLogs();
  }, [refreshLogs]);

  const exportData = useCallback(async () => {
    const data = await store.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mockdrop-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded");
  }, []);

  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await store.importAll(parsed);
      await refresh();
      await refreshLogs();
      toast.success(`Imported ${res.endpoints} endpoints, ${res.logs} logs`);
    } catch {
      toast.error("Invalid backup file");
    }
  }, [refresh, refreshLogs]);

  const active = endpoints.find((e) => e.id === activeId) ?? null;

  return (
    <WorkspaceCtx.Provider
      value={{
        endpoints,
        logs,
        activeId,
        active,
        loading,
        selectEndpoint: setActiveId,
        upsertEndpoint,
        createEndpoint,
        duplicateEndpoint,
        deleteEndpoint,
        addLog,
        refreshLogs,
        exportData,
        importData,
      }}
    >
      {children}
    </WorkspaceCtx.Provider>
  );
};

export const useWorkspace = () => {
  const ctx = useContext(WorkspaceCtx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
};
