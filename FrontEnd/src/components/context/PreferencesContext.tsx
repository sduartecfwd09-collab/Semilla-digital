import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface PreferencesContextValue {
  notifications: boolean;
  toggleNotifications: () => void;
  setNotifications: (v: boolean) => void;
}

const STORAGE_KEY = 'agromap_pn_notifications';

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotificationsState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === null) return true;
      return stored === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(notifications));
    } catch {
      /* storage off */
    }
  }, [notifications]);

  const setNotifications = useCallback((v: boolean) => setNotificationsState(v), []);
  const toggleNotifications = useCallback(() => setNotificationsState(p => !p), []);

  return (
    <PreferencesContext.Provider value={{ notifications, toggleNotifications, setNotifications }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences debe usarse dentro de <PreferencesProvider>');
  return ctx;
};
