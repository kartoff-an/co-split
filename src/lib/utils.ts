export { cn } from 'cn';

export function formatDate(timestamp: string | number | Date) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
