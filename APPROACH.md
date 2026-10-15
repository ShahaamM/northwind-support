## Task 1 notes

### DEFECT-117: filters sometimes did not take effect

**Root cause:** the load effect in `useTicketList` depended only on `search`, `page` and
`pageSize`, but the request it sends contains every filter. Changing status, priority, category,
customer, agent or "unassigned only" never re-ran it; a later search re-ran it and only then
sent the up-to-date filters.

**Fix:** the effect depends on the whole `filters` state, so every filter, including any added
later such as the SLA status, triggers a request with no extra wiring. Only a change to the
search text is debounced (300 ms). A response from a superseded request is ignored.

**Verify:** `npm run test --workspace apps/web`. `useTicketList.requests.test.ts` stubs `fetch`
and asserts the URL actually requested; 6 of its 9 tests fail on the original code.

### Server-side filtering

Applied in `TicketQueries.ApplyFilters` (Infrastructure), before the count and the page, so
`totalCount` and `totalPages` describe the filtered set. Nothing is filtered in C#. Search is
trimmed and matches title, reference or customer name with `Contains`.

**How the SQL was checked:** in Development the API logs each SQL command; the `COUNT` and the
page query both carry the same `WHERE`. The API's `totalCount` was compared with a direct
`SELECT COUNT(*)` for the same filter.

**Adding the next filter** (e.g. `slaStatus`): add the property on `TicketQuery` and one
`.WhereIf(condition, predicate)` line in `ApplyFilters`.

**Tests:** `TicketQueriesFilteringTests` runs the real query on in-memory SQLite: exact-match
priority, a four-filter combination, customer-name search, title and reference search, blank
and trimmed search, unassigned-only, agent match, and count and paging on a filtered set.
Case-insensitive search is a property of SQL Server's collation and is deliberately not
asserted on SQLite, whose string search is case-sensitive.
