export const DEFAULT_TIMEZONE = "America/Santiago"

export function formatDateInTimezone(date: Date, timezone: string = DEFAULT_TIMEZONE): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: timezone,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function getCurrentDateInTimezone(timezone: string = DEFAULT_TIMEZONE): Date {
  // Always store in UTC, but get current time in specified timezone
  return new Date()
}

export function convertToUTC(date: Date): Date {
  return new Date(date.toISOString())
}
