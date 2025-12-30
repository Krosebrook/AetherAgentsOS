/**
 * @fileoverview Secure API key management context
 * @module contexts/ApiKeysContext
 * @description Provides secure storage and retrieval of API keys using IndexedDB via Dexie
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Dexie, { Table } from 'dexie';
import { ApiKeyState } from '../types';

// =============================================================================
// DATABASE SCHEMA
// =============================================================================

/**
 * Key entry stored in IndexedDB
 */
interface KeyEntry {
  provider: string;
  key: string;
}

/**
 * Dexie database for secure key storage
 */
class AetherSecureStorage extends Dexie {
  keys!: Table<KeyEntry>;

  constructor() {
    super('AetherSecureStorage');
    this.version(1).stores({
      keys: 'provider',
    });
  }
}

// Database singleton
const db = new AetherSecureStorage();

// =============================================================================
// CONTEXT TYPES
// =============================================================================

/**
 * API Keys context value type
 */
interface ApiKeysContextType {
  /** Current API keys state */
  keys: ApiKeyState;
  /** Set or update an API key */
  setKey: (provider: string, key: string) => Promise<void>;
  /** Remove an API key */
  removeKey: (provider: string) => Promise<void>;
  /** Check if a provider has a key */
  hasKey: (provider: string) => boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
}

// =============================================================================
// CONTEXT
// =============================================================================

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

interface ApiKeysProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component for API key management
 *
 * @example
 * ```tsx
 * <ApiKeysProvider>
 *   <App />
 * </ApiKeysProvider>
 * ```
 */
export const ApiKeysProvider: React.FC<ApiKeysProviderProps> = ({ children }) => {
  const [keys, setKeys] = useState<ApiKeyState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load keys from IndexedDB on mount
  useEffect(() => {
    const initializeKeys = async () => {
      try {
        const allKeys = await db.keys.toArray();
        const keyMap: ApiKeyState = {};

        allKeys.forEach(entry => {
          keyMap[entry.provider] = entry.key;
        });

        setKeys(keyMap);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize Aether secure storage:', err);
        setError('Failed to load API keys from secure storage');
      } finally {
        setIsLoading(false);
      }
    };

    initializeKeys();
  }, []);

  /**
   * Set or update an API key
   */
  const setKey = useCallback(async (provider: string, key: string) => {
    const normalizedProvider = provider.toLowerCase();

    try {
      await db.keys.put({ provider: normalizedProvider, key });
      setKeys(prev => ({ ...prev, [normalizedProvider]: key }));
      setError(null);
    } catch (err) {
      console.error(`Failed to persist key for ${provider}:`, err);
      setError(`Failed to save key for ${provider}`);
      throw new Error(`Failed to persist key for ${provider}`);
    }
  }, []);

  /**
   * Remove an API key
   */
  const removeKey = useCallback(async (provider: string) => {
    const normalizedProvider = provider.toLowerCase();

    try {
      await db.keys.delete(normalizedProvider);
      setKeys(prev => {
        const newKeys = { ...prev };
        delete newKeys[normalizedProvider];
        return newKeys;
      });
      setError(null);
    } catch (err) {
      console.error(`Failed to delete key for ${provider}:`, err);
      setError(`Failed to remove key for ${provider}`);
    }
  }, []);

  /**
   * Check if a provider has a stored key
   */
  const hasKey = useCallback(
    (provider: string): boolean => {
      return Boolean(keys[provider.toLowerCase()]);
    },
    [keys]
  );

  const value: ApiKeysContextType = {
    keys,
    setKey,
    removeKey,
    hasKey,
    isLoading,
    error,
  };

  return (
    <ApiKeysContext.Provider value={value}>
      {children}
    </ApiKeysContext.Provider>
  );
};

// =============================================================================
// HOOK
// =============================================================================

/**
 * Hook to access API keys context
 *
 * @throws Error if used outside of ApiKeysProvider
 *
 * @example
 * ```tsx
 * const { keys, setKey, hasKey } = useApiKeys();
 *
 * if (!hasKey('openai')) {
 *   await setKey('openai', 'sk-...');
 * }
 * ```
 */
export function useApiKeys(): ApiKeysContextType {
  const context = useContext(ApiKeysContext);

  if (context === undefined) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }

  return context;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ApiKeysContext;
export type { ApiKeysContextType };
