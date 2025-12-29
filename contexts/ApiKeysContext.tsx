
import React, { createContext, useContext, useState, useEffect } from 'react';
import Dexie, { Table } from 'dexie';
import { ApiKeyState } from '../types';

// Dexie Database Schema for Secure Persistence
interface KeyEntry {
  provider: string;
  key: string;
}

// Initializing Dexie instance directly to ensure type safety for versioning and stores
const db = new Dexie('AetherSecureStorage') as Dexie & {
  keys: Table<KeyEntry>;
};

// Define schema on the instance
db.version(1).stores({
  keys: 'provider'
});

interface ApiKeysContextType {
  keys: ApiKeyState;
  setKey: (provider: string, key: string) => Promise<void>;
  removeKey: (provider: string) => Promise<void>;
  isLoading: boolean;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export const ApiKeysProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [keys, setKeys] = useState<ApiKeyState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load keys from IndexedDB on initialization
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        const allKeys = await db.keys.toArray();
        const keyMap: ApiKeyState = {};
        allKeys.forEach(entry => {
          keyMap[entry.provider] = entry.key;
        });
        setKeys(keyMap);
      } catch (error) {
        console.error('Failed to initialize Aether secure storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeKeys();
  }, []);

  const setKey = async (provider: string, key: string) => {
    const normalizedProvider = provider.toLowerCase();
    try {
      await db.keys.put({ provider: normalizedProvider, key });
      setKeys(prev => ({ ...prev, [normalizedProvider]: key }));
    } catch (error) {
      console.error(`Insecure write operation for ${provider}:`, error);
      throw new Error(`Failed to persist key for ${provider}`);
    }
  };

  const removeKey = async (provider: string) => {
    const normalizedProvider = provider.toLowerCase();
    try {
      await db.keys.delete(normalizedProvider);
      setKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[normalizedProvider];
        return newKeys;
      });
    } catch (error) {
      console.error(`Secure delete failed for ${provider}:`, error);
    }
  };

  return (
    <ApiKeysContext.Provider value={{ keys, setKey, removeKey, isLoading }}>
      {children}
    </ApiKeysContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
};
