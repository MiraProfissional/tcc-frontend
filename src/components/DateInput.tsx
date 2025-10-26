import React from 'react'

interface DateInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

/**
 * Input de data customizado que exibe DD/MM/YYYY visualmente
 * mas armazena internamente em YYYY-MM-DD (formato de input HTML)
 */
const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = React.useState('')

  React.useEffect(() => {
    // Quando value muda (do react-hook-form), atualizar displayValue
    if (value && value.includes('-')) {
      // value vem como YYYY-MM-DD, converter para DD/MM/YYYY
      const [year, month, day] = value.split('-')
      setDisplayValue(`${day}/${month}/${year}`)
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // Remover caracteres não-numéricos
    inputValue = inputValue.replace(/\D/g, '')
    
    // Aplicar máscara DD/MM/YYYY
    let maskedValue = inputValue
    if (inputValue.length > 0) {
      maskedValue = inputValue.slice(0, 2)
      if (inputValue.length >= 3) maskedValue += '/' + inputValue.slice(2, 4)
      if (inputValue.length >= 5) maskedValue += '/' + inputValue.slice(4, 8)
    }
    
    setDisplayValue(maskedValue)
    
    // Quando completar 10 caracteres (DD/MM/YYYY), converter para YYYY-MM-DD
    if (maskedValue.length === 10) {
      const [day, month, year] = maskedValue.split('/')
      const htmlDateFormat = `${year}-${month}-${day}`
      onChange(htmlDateFormat)
    }
  }

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      maxLength={10}
      className={className}
    />
  )
}

export default DateInput
