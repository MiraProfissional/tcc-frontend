import React, { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../utils/useAuth'
import toast from 'react-hot-toast'

type LoginForm = {
  email: string
  password: string
}

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A senha precisa ter ao menos 6 caracteres').required('Senha é obrigatória'),
})

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) })

  const submittingRef = useRef(false)

  async function onSubmit(data: LoginForm) {
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      await signIn(data.email, data.password)
      toast.success('Login efetuado com sucesso! 🎉')
      navigate('/home')
    } catch (err: unknown) {
      console.error('Erro ao fazer login', err)
      let statusCode: number | undefined
      let message: string | undefined
      
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        const resp = e['response'] as Record<string, unknown> | undefined
        statusCode = resp?.['status'] as number | undefined
        const d = resp?.['data'] as Record<string, unknown> | undefined
        if (d && typeof d['message'] === 'string') message = d['message'] as string
      }
      
      // Tratamento específico por status code
      if (statusCode === 401 || statusCode === 400) {
        toast.error('Email ou senha inválidos', {
          duration: 4000,
        })
      } else if (statusCode === 429) {
        toast.error('Muitas tentativas. Tente novamente mais tarde.', {
          duration: 5000
        })
      } else if (statusCode && statusCode >= 500) {
        toast.error('Erro no servidor. Tente novamente em alguns momentos.', {
          duration: 4000
        })
      } else if (message) {
        toast.error(message, { duration: 4000 })
      } else if (err instanceof Error) {
        toast.error(`⚠️ ${err.message}`, { duration: 4000 })
      } else {
        toast.error('⚠️ Erro desconhecido. Verifique sua conexão.', { duration: 4000 })
      }
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-white p-6 sm:p-8 rounded shadow" aria-label="login-form">
  <h2 className="text-xl sm:text-2xl font-semibold mb-4">Entrar</h2>

  {/* mensagens de erro agora aparecem via toast */}

  <label className="block mb-2">
          <span className="text-sm text-gray-700">Email</span>
          <input
            {...register('email')}
            type="email"
            className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="seu@exemplo.com"
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-700">Senha</span>
          <div className="relative mt-1">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className={`block w-full rounded border border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2 pr-12 ${errors.password ? 'border-red-500' : ''}`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856A10.05 10.05 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.97 9.97 0 01-1.563 4.803m-5.596 3.856a3 3 0 01-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            aria-disabled={isSubmitting}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Ainda não tem conta? <Link to="/register" className="text-indigo-600">Cadastre-se</Link>
        </div>

        <div className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700">
            Esqueci minha senha
          </Link>
        </div>
      </form>
    </div>
  )
}

export default Login
