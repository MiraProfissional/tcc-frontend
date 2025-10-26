/**
 * Aplica máscara de CPF ao valor
 * Ex: "12345678900" → "123.456.789-00"
 */
export function maskCPF(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14)
}

/**
 * Remove máscara de CPF
 * Ex: "123.456.789-00" → "12345678900"
 */
export function unmaskCPF(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Aplica máscara de celular ao valor
 * Ex: "12987654321" → "(12) 98765-4321"
 */
export function maskCellphone(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

/**
 * Remove máscara de celular
 * Ex: "(12) 98765-4321" → "12987654321"
 */
export function unmaskCellphone(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Converte data DD/MM/YYYY para YYYY-MM-DD (formato HTML input)
 * Ex: "16/03/2001" → "2001-03-16"
 */
export function convertBrToHtmlDate(brDate: string): string {
  const [day, month, year] = brDate.split('/').map(Number)
  if (!day || !month || !year) return ''
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Converte data YYYY-MM-DD para DD/MM/YYYY (formato brasileiro)
 * Ex: "2001-03-16" → "16/03/2001"
 */
export function convertHtmlTobrDate(htmlDate: string): string {
  const [year, month, day] = htmlDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`
}

/**
 * Aplica máscara de data DD/MM/YYYY ao valor
 * Ex: "16032001" → "16/03/2001"
 */
export function maskDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10)
}

/**
 * Remove máscara de data
 * Ex: "16/03/2001" → "16032001"
 */
export function unmaskDate(value: string): string {
  return value.replace(/\D/g, '')
}
