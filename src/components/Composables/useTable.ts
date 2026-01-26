import type { Row } from '@tanstack/table-core';
import type { SortingFn } from '@tanstack/table-core';

/**
 * Map Redfish `Status.Health` values into a numeric severity rank.
 * Higher numbers indicate "worse" status.
 */
export function statusSortRank(status: unknown): number {
  switch (status) {
    case 'Critical':
      return 3;
    case 'Warning':
      return 2;
    case 'OK':
      return 1;
    default:
      return 0;
  }
}

/**
 * TanStack Table sorting function that sorts by Redfish Health severity.
 *
 * Note: Use with `desc: true` if you want Critical first.
 */
export function makeStatusSortingFn<TData>(): SortingFn<TData> {
  return (rowA: Row<TData>, rowB: Row<TData>, columnId: string) =>
    statusSortRank(rowA.getValue(columnId)) - statusSortRank(rowB.getValue(columnId));
}

