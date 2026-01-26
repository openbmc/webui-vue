/**
 * Data formatting utilities for UI display.
 *
 * Replacement for DataFormatterMixin - use these functions directly
 * in Vue 3 Composition API components.
 */

/**
 * Format a value for display, handling null/undefined/empty values.
 * Numbers are formatted to 3 decimal places.
 *
 * @param value - The value to format
 * @returns Formatted string for display
 */
export function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === '') {
    return '--';
  }
  if (typeof value === 'number') {
    return parseFloat(value.toFixed(3)).toString();
  }
  return String(value);
}

/**
 * Convert Redfish status to Bootstrap icon variant.
 *
 * Maps Redfish Health status values to Bootstrap theme colors:
 * - OK -> success (green)
 * - Warning -> warning (yellow)
 * - Critical -> danger (red)
 *
 * @param status - Redfish Health status (OK, Warning, Critical)
 * @returns Bootstrap variant name for StatusIcon component
 */
export function statusIcon(status: string | null | undefined): string {
  switch (status) {
    case 'OK':
      return 'success';
    case 'Warning':
      return 'warning';
    case 'Critical':
      return 'danger';
    default:
      return 'secondary';
  }
}

/**
 * Format an array of values as a comma-separated string.
 *
 * @param value - Array of values to join
 * @returns Comma-separated string
 */
export function formatArray(value: unknown[]): string {
  return value.join(', ');
}

/**
 * Format a boolean value for display.
 *
 * @param value - Boolean value
 * @param trueText - Text to display for true (default: 'Yes')
 * @param falseText - Text to display for false (default: 'No')
 * @returns Formatted string
 */
export function formatBoolean(
  value: boolean | null | undefined,
  trueText = 'Yes',
  falseText = 'No',
): string {
  if (value === null || value === undefined) {
    return '--';
  }
  return value ? trueText : falseText;
}

/**
 * Format a date value for display.
 *
 * @param value - Date string or Date object
 * @param locale - Locale for formatting (default: user's locale)
 * @returns Formatted date string
 */
export function formatDate(
  value: string | Date | null | undefined,
  locale?: string,
): string {
  if (!value) {
    return '--';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleDateString(locale);
}

/**
 * Format a date and time value for display.
 *
 * @param value - Date string or Date object
 * @param locale - Locale for formatting (default: user's locale)
 * @returns Formatted date and time string
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  locale?: string,
): string {
  if (!value) {
    return '--';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) {
    return '--';
  }
  return date.toLocaleString(locale);
}
