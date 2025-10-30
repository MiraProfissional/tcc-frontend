import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import PasswordResetService from '../utils/Services/PasswordResetService'

interface ForgotPasswordFormData {
  email: string
}

const schema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('Email é obrigatório'),
})

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await PasswordResetService.forgotPassword(data)
      setIsSubmitted(true)
      toast.success('Se a conta existir, um email de recuperação foi enviado')
      setTimeout(() => {
        navigate('/login')
      }, 8000)
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error)
      toast.error('Erro ao solicitar recuperação de senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Recuperar Senha</h1>
            <p className="text-gray-600 text-sm">
              Digite seu email para receber um link de recuperação
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="seu.email@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400"
              >
                {isLoading ? '⏳ Enviando...' : 'Enviar Link de Recuperação'}
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Voltar para o Login
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  ✓ Se a conta existir, um email de recuperação foi enviado para{' '}
                  <strong>seu email</strong>.
                </p>
                <p className="text-green-700 text-xs mt-2">
                  O link expira em 1 hora. Verifique também sua pasta de spam.
                </p>
              </div>

              {/* Redirect Countdown */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Você será redirecionado para o login em poucos segundos...
                </p>
              </div>

              {/* Manual Button */}
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition"
              >
                ← Voltar para o Login
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6 text-gray-600 text-xs">
          <p>Não tem uma conta? <button onClick={() => navigate('/register')} className="text-blue-600 hover:text-blue-700 font-medium">Criar conta</button></p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
