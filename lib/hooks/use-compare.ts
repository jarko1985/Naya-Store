'use client';

import { useCallback, useEffect, useState } from 'react';
import { COMPARE_PRODUCTS_LIMIT } from '@/lib/constants';

const STORAGE_KEY = 'compare-product-ids';
const EVENT_NAME = 'compare-updated';

const readIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const writeIds = (ids: string[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
};

export const useCompare = () => {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readIds());
    const handleUpdate = () => setIds(readIds());
    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isComparing = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string): 'added' | 'removed' | 'limit-reached' => {
    const current = readIds();
    if (current.includes(id)) {
      writeIds(current.filter((x) => x !== id));
      return 'removed';
    }
    if (current.length >= COMPARE_PRODUCTS_LIMIT) {
      return 'limit-reached';
    }
    writeIds([...current, id]);
    return 'added';
  }, []);

  const remove = useCallback((id: string) => {
    writeIds(readIds().filter((x) => x !== id));
  }, []);

  const clear = useCallback(() => {
    writeIds([]);
  }, []);

  return { ids, isComparing, toggle, remove, clear, limit: COMPARE_PRODUCTS_LIMIT };
};
