/** ISO partial YYYY-MM or free text; order check when both match YYYY-MM. */
const YEAR_MONTH = /^\d{4}-\d{2}$/;

export function isYearMonth(value: string): boolean {
  return YEAR_MONTH.test(value.trim());
}

export function experienceDatesValid(input: {
  startDate?: string;
  endDate?: string;
  current?: boolean;
}): boolean {
  const start = input.startDate?.trim();
  const end = input.endDate?.trim();
  if (input.current && end) return false;
  if (!start || !end) return true;
  if (!isYearMonth(start) || !isYearMonth(end)) return true;
  return start <= end;
}
