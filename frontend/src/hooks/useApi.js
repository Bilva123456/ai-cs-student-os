import { useState, useEffect, useCallback } from 'react';

/**
 * useApi — fetches data on mount (or when deps change).
 * Returns { data, loading, error, refetch }
 */
export function useApi(apiFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * useMutation — for POST/PATCH/DELETE calls.
 * Returns { mutate, loading, error, reset }
 */
export function useMutation(apiFn, { onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const msg = err?.response?.data?.detail || err.message || 'Request failed';
        setError(msg);
        onError?.(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, loading, error, reset };
}
