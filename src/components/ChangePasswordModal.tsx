import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import ChangePasswordService from '../utils/Services/ChangePasswordService'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  userRole: string
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/

const validationSchema = yup.object().shape({
  currentPassword: yup.string().required('Senha atual é obrigatória'),
  newPassword: yup
    .string()
    .required('Nova senha é obrigatória')
    .matches(
      passwordRegex,
      'A senha deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais'
    )
})

interface FormData {
  currentPassword: string
  newPassword: string
}

export const ChangePasswordModal = ({ isOpen, onClose, userRole }: ChangePasswordModalProps) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema)
  })

  const newPassword = watch('newPassword', '')

  const passwordRequirements = [
    { label: 'Pelo menos 8 caracteres', met: newPassword.length >= 8 },
    { label: 'Letra maiúscula', met: /[A-Z]/.test(newPassword) },
    { label: 'Letra minúscula', met: /[a-z]/.test(newPassword) },
    { label: 'Número', met: /\d/.test(newPassword) },
    { label: 'Caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) }
  ]

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      const userType = userRole === 'STUDENT' ? 'student' : 'teacher'
      await ChangePasswordService.changePassword(data, userType)
      toast.success('Senha alterada com sucesso!')
      reset()
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Erro ao alterar senha')
      } else {
        toast.error('Erro ao alterar senha')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Trocar Senha</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
            <div className="relative">
              <input
                {...register('currentPassword')}
                type={showCurrentPassword ? 'text' : 'password'}
                className="block w-full rounded border border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 focus:border-transparent p-2 pr-10"
                placeholder="Sua senha atual"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-1.414-1.414M9.4 2.567a1 1 0 10-.8 1.856A8.971 8.971 0 0110 2c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-1.074 4.512" />
                  </svg>
                )}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                className="block w-full rounded border border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 focus:border-transparent p-2 pr-10"
                placeholder="Nova senha"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-1.414-1.414M9.4 2.567a1 1 0 10-.8 1.856A8.971 8.971 0 0110 2c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-1.074 4.512" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Requisitos da Senha */}
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-xs font-medium text-gray-700 mb-2">Requisitos da senha:</p>
            <ul className="space-y-1">
              {passwordRequirements.map((req, index) => (
                <li key={index} className="flex items-center text-xs">
                  <span
                    className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center ${
                      req.met ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {req.met && <span className="text-white text-xs">✓</span>}
                  </span>
                  <span className={req.met ? 'text-green-700' : 'text-gray-600'}>{req.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
