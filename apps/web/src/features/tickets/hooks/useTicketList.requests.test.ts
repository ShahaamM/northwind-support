import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { page, ticketListItem } from '../../../test/fixtures';
import { useTicketList } from './useTicketList';

/**
 * Regression tests for DEFECT-117. They stub `fetch` rather than `ticketsApi`, so they assert the
 * request that actually goes over the wire (URL and query string), not just the hook's arguments.
 */
const fetchMock = vi.fn();

const requestedQueries = () =>
  fetchMock.mock.calls.map(([url]) => new URL(String(url), 'http://localhost').searchParams);

const lastQuery = () => requestedQueries().at(-1);

/** Lets timers and the promises they start settle. */
const settle = (ms = 0) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

describe('useTicketList requests (DEFECT-117)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify(page([ticketListItem()])), { status: 200 })),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('sends a request as soon as the status changes, without waiting for the search debounce', async () => {
    const { result } = renderHook(() => useTicketList());
    await settle();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    act(() => result.current.updateFilters({ status: 'InProgress' }));
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastQuery()?.get('status')).toBe('InProgress');
    expect(lastQuery()?.get('page')).toBe('1');
  });

  it('keeps the chosen status when the user then types a search', async () => {
    const { result } = renderHook(() => useTicketList());
    await settle();

    act(() => result.current.updateFilters({ status: 'InProgress' }));
    await settle();
    act(() => result.current.updateFilters({ search: 'invoice' }));
    await settle(300);

    const query = lastQuery();
    expect(query?.get('status')).toBe('InProgress');
    expect(query?.get('search')).toBe('invoice');
  });

  it('keeps the chosen status when the search is cleared', async () => {
    const { result } = renderHook(() => useTicketList());
    await settle();

    act(() => result.current.updateFilters({ status: 'InProgress', search: 'invoice' }));
    await settle(300);
    act(() => result.current.updateFilters({ search: '' }));
    await settle(300);

    const query = lastQuery();
    expect(query?.get('status')).toBe('InProgress');
    expect(query?.has('search')).toBe(false);
  });

  it('sends one request for a burst of keystrokes, not one per keystroke', async () => {
    const { result } = renderHook(() => useTicketList());
    await settle();
    fetchMock.mockClear();

    for (const text of ['i', 'in', 'inv', 'invo']) {
      act(() => result.current.updateFilters({ search: text }));
      await settle(100);
    }
    expect(fetchMock).not.toHaveBeenCalled();

    await settle(300);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(lastQuery()?.get('search')).toBe('invo');
  });

  it.each([
    ['priority', { priority: 'High' as const }, 'High'],
    ['categoryId', { categoryId: 3 }, '3'],
    ['customerId', { customerId: 2 }, '2'],
    ['assignedAgentId', { assignedAgentId: 4 }, '4'],
    ['unassignedOnly', { unassignedOnly: true }, 'true'],
  ])('sends a request immediately when %s changes', async (key, patch, expected) => {
    const { result } = renderHook(() => useTicketList());
    await settle();

    act(() => result.current.updateFilters(patch));
    await settle();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(lastQuery()?.get(key)).toBe(expected);
  });
});
