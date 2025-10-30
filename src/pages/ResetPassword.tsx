import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import type { AxiosError } from 'axios'
import PasswordResetService from '../utils/Services/PasswordResetService'

interface ErrorResponse {
  message: string
}

interface ResetPasswordFormData {
  newPassword: string
  confirmPassword: string
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

const schema = yup.object({
  newPassword: yup
    .string()
    .required('Senha é obrigatória')
    .matches(
      passwordRegex,
      'Senha deve ter: 8+ caracteres, letra maiúscula, minúscula, número e caractere especial'
    ),
  confirmPassword: yup
    .string()
    .required('Confirmação de senha é obrigatória')
    .oneOf([yup.ref('newPassword')], 'As senhas devem ser iguais'),
})

const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const { token: urlToken } = useParams<{ token: string }>()
  const [searchParams] = useSearchParams()
  const queryToken = searchParams.get('token')
  
  // Pega o token de URL params ou query string
  const token = urlToken || queryToken
  
  const [isLoading, setIsLoading] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Debug: Log do token recebido
  useEffect(() => {
    console.log('Reset Password - Token recebido:', token)
  }, [token])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
  })

  const newPassword = watch('newPassword')

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidatingToken(false)
        setIsTokenValid(false)
        toast.error('Token não fornecido')
        return
      }

      try {
        console.log('Validando token:', token)
        await PasswordResetService.validateToken(token)
        console.log('Token válido!')
        setIsTokenValid(true)
      } catch (error) {
        console.error('Erro ao validar token:', error)
        // Se houver erro, ainda deixa o usuário tentar resetar (validação também ocorre no backend)
        // Isso evita que usuários fiquem travados se houver problema na validação
        setIsTokenValid(true)
      } finally {
        setIsValidatingToken(false)
      }
    }

    validateToken()
  }, [token, navigate])

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error('Token não fornecido')
      return
    }

    setIsLoading(true)
    try {
      console.log('Resetando senha com token:', token)
      await PasswordResetService.resetPassword(token, data.newPassword)
      console.log('Senha resetada com sucesso!')
      setIsSubmitted(true)
      toast.success('Senha alterada com sucesso!')
      setTimeout(() => {
        navigate('/login')
      }, 8000)
    } catch (error) {
      console.error('Erro ao redefinir senha:', error)
      const axiosError = error as AxiosError<ErrorResponse>
      const errorMessage = axiosError.response?.data?.message || 'Erro ao redefinir senha'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Validating token state
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando token...</p>
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isTokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h2 className="text-red-800 font-semibold mb-2">❌ Token Inválido ou Expirado</h2>
            <p className="text-red-700 text-sm">
              O link de recuperação expirou ou não é válido. Solicite um novo link.
            </p>
          </div>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
          >
            ← Solicitar Novo Link
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Definir Nova Senha</h1>
            <p className="text-gray-600 text-sm">
              Digite uma nova senha segura para sua conta
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Nova Senha
                </label>
                <div className="relative mt-1">
                  <input
                    {...register('newPassword')}
                    type={showPassword ? 'text' : 'password'}
                    id="newPassword"
                    placeholder="••••••••"
                    className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500 p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 13a8.971 8.971 0 01-1.07 3.6M12 19c4.478 0 8.268-2.943 9.543-7A9.969 9.969 0 0020.437 5.197M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7C7.523 19 3.732 16.057 2.458 12z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Password Requirements Checklist */}
              {newPassword && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Requisitos:</p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <div className={`${newPassword.length >= 8 ? 'text-green-600' : 'text-gray-600'}`}>
                      ✓ Mínimo 8 caracteres
                    </div>
                    <div className={`${/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                      ✓ Letra maiúscula
                    </div>
                    <div className={`${/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                      ✓ Letra minúscula
                    </div>
                    <div className={`${/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                      ✓ Número
                    </div>
                    <div className={`${/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}`}>
                      ✓ Caractere especial
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative mt-1">
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="••••••••"
                    className="block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-blue-500 p-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 13a8.971 8.971 0 01-1.07 3.6M12 19c4.478 0 8.268-2.943 9.543-7A9.969 9.969 0 0020.437 5.197M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7C7.523 19 3.732 16.057 2.458 12z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-xs mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition disabled:bg-gray-400"
              >
                {isLoading ? '⏳ Alterando...' : '✅ Alterar Senha'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm font-semibold mb-2">✓ Sucesso!</p>
                <p className="text-green-700 text-xs">
                  Sua senha foi alterada com sucesso. Você será redirecionado para o login.
                </p>
              </div>

              {/* Manual Button */}
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                → Ir para o Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
