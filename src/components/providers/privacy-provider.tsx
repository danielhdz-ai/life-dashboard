"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

type PrivacyContextValue = {
  enabled: boolean;
  toggle: () => void;
  setEnabled: (value: boolean) => void;
};

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

const STORAGE_KEY = "life-dashboard-privacy";
const PRIVACY_EVENT = "life-dashboard:privacy-change";

function readStored(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(PRIVACY_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PRIVACY_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function writeStored(value: boolean) {
  try {
    sessionStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(PRIVACY_EVENT));
}

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const enabled = useSyncExternalStore(
    subscribe,
    readStored,
    () => false,
  );

  useEffect(() => {
    document.documentElement.dataset.privacy = enabled ? "true" : "false";
  }, [enabled]);

  const setEnabled = useCallback((value: boolean) => {
    writeStored(value);
  }, []);

  const toggle = useCallback(() => {
    writeStored(!readStored());
  }, []);

  const value = useMemo(
    () => ({ enabled, toggle, setEnabled }),
    [enabled, toggle, setEnabled],
  );

  return (
    <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
  );
}

export function usePrivacyMode() {
  const ctx = useContext(PrivacyContext);
  if (!ctx) {
    throw new Error("usePrivacyMode debe usarse dentro de PrivacyProvider");
  }
  return ctx;
}
