import React, { useState } from 'react'

interface PasswordTooltipProps {
  password: string
}

const PasswordTooltip: React.FC<PasswordTooltipProps> = ({ password = '' }) => {
  const [isVisible, setIsVisible] = useState(false)

  const passwordStr = String(password || '')

  const requirements = [
    {
      label: 'Mínimo 8 caracteres',
      met: passwordStr.length >= 8,
    },
    {
      label: 'Pelo menos uma letra',
      met: /[A-Za-z]/.test(passwordStr),
    },
    {
      label: 'Pelo menos um número',
      met: /\d/.test(passwordStr),
    },
    {
      label: 'Pelo menos um caractere especial (@$!%*#?&)',
      met: /[@$!%*#?&]/.test(passwordStr),
    },
  ]

  const allMet = requirements.every((req) => req.met)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="Ver requisitos de senha"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {isVisible && (
        <div className="absolute bottom-full right-0 mb-3 w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-50">
          <div className="space-y-3">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-medium ${
                  req.met 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {req.met ? '✓' : '○'}
                </span>
                <span className={`text-sm ${req.met ? 'text-gray-700' : 'text-gray-500'}`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
          
          {allMet && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm font-medium text-green-700 flex items-center gap-1">
                <span className="text-green-600">✓</span> Senha válida!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PasswordTooltip
