/**
 * Formata uma data ISO8601 para o padrão brasileiro (DD/MM/YYYY)
 * Ex: "2001-03-16T07:46:32+00:00" → "16/03/2001"
 */
export function formatDateBirth(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    const day = String(date.getUTCDate()).padStart(2, '0')
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const year = date.getUTCFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return isoDate
  }
}

/**
 * Converte uma data no formato DD/MM/YYYY para ISO8601 UTC
 * Ex: "16/03/2001" → "2001-03-16T00:00:00+00:00"
 */
export function parseDateBirthToISO(dateStr: string): string {
  try {
    const [day, month, year] = dateStr.split('/').map(Number)
    const utcDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1, 0, 0, 0))
    const isoString = utcDate.toISOString().replace(/\.\d{3}Z$/, '+00:00')
    return isoString
  } catch {
    return dateStr
  }
}

/**
 * Converte uma data de input HTML (YYYY-MM-DD) para ISO8601 UTC
 * Ex: "2001-03-16" → "2001-03-16T00:00:00+00:00"
 */
export function parseHTMLDateToISO(htmlDate: string): string {
  try {
    const [year, month, day] = htmlDate.split('-').map(Number)
    const utcDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1, 0, 0, 0))
    const isoString = utcDate.toISOString().replace(/\.\d{3}Z$/, '+00:00')
    return isoString
  } catch {
    return htmlDate
  }
}

/**
 * Converte uma data ISO8601 para o formato de input HTML (YYYY-MM-DD)
 * Ex: "2001-03-16T07:46:32+00:00" → "2001-03-16"
 */
export function formatDateToHTMLInput(isoDate: string): string {
  try {
    const date = new Date(isoDate)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return isoDate
  }
}
