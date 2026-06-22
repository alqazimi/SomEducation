/**
 * Admin list queries return:
 * - `undefined` while loading or when the client skips the query (auth reconnect)
 * - `null` when the server denies access (not signed in to Convex or not admin)
 * - data when authorized
 */
export function isAdminListLoading(
  authLoading: boolean,
  isAuthenticated: boolean,
  data: unknown
) {
  return authLoading || !isAuthenticated || data === undefined;
}

export function isAdminListDenied(data: unknown): data is null {
  return data === null;
}

export function isAdminListReady<T>(data: T | null | undefined): data is T {
  return data !== null && data !== undefined;
}
