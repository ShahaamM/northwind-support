import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '../../../api/client';
import { ticketsApi } from '../../../api/tickets';
import type { PagedResult, TicketFilters, TicketListItem } from '../../../types/api';

const DEBOUNCE_MS = 300;

export const emptyFilters: TicketFilters = {
  search: '',
  status: undefined,
  priority: undefined,
  categoryId: undefined,
  customerId: undefined,
  assignedAgentId: undefined,
  unassignedOnly: false,
  page: 1,
  pageSize: 20,
  sortBy: 'createdAtUtc',
  sortDirection: 'desc',
};

interface State {
  isLoading: boolean;
  data?: PagedResult<TicketListItem>;
  error?: string;
}

/**
 * Owns the ticket list's filters and the data they produce.
 */
export function useTicketList() {
  const [filters, setFilters] = useState<TicketFilters>(emptyFilters);
  const [state, setState] = useState<State>({ isLoading: true });
  const [reloadCount, setReloadCount] = useState(0);

  // Track search and non-search filters separately to prevent stale closure bugs (DEFECT-117)
  const lastSearchRef = useRef(filters.search);

  useEffect(() => {
    let cancelled = false;
    const searchChanged = filters.search !== lastSearchRef.current;

    const load = async () => {
      lastSearchRef.current = filters.search;
      setState((current) => ({ ...current, isLoading: true, error: undefined }));

      try {
        const data = await ticketsApi.getTickets(filters);
        if (!cancelled) {
          setState({ isLoading: false, data, error: undefined });
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof ApiError ? error.message : 'Unable to load tickets.';
          setState((current) => ({ ...current, isLoading: false, error: message }));
        }
      }
    };

    // Only debounce if the search text specifically changed; dropdowns or other filters fetch immediately.
    const timeoutId = window.setTimeout(
      () => void load(),
      searchChanged ? DEBOUNCE_MS : 0
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [filters, reloadCount]);

  const updateFilters = useCallback(
    (patch: Partial<TicketFilters>) =>
      setFilters((current) => ({ ...current, ...patch, page: patch.page ?? 1 })),
    [],
  );

  const resetFilters = useCallback(() => setFilters(emptyFilters), []);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { filters, updateFilters, resetFilters, reload, ...state };
}
