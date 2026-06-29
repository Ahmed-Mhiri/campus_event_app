export const formatDate = (iso: string, timezone: string = 'Europe/Berlin') => new Date(iso).toLocaleString('de-DE', { timeZone: timezone });
