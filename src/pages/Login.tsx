import React from 'react'
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: yupResolver(schema) })

  async function onSubmit(data: LoginForm) {
    try {
      await signIn(data.email, data.password)
  toast.success('Login efetuado com sucesso')
  navigate('/home')
    } catch (err: unknown) {
      console.error('Erro ao fazer login', err)
      let message: string | undefined
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        const resp = e['response'] as Record<string, unknown> | undefined
        const d = resp?.['data'] as Record<string, unknown> | undefined
        if (d && typeof d['message'] === 'string') message = d['message'] as string
      }
      if (!message && err instanceof Error) message = err.message
      toast.error(message || 'Erro na requisição')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm bg-white p-6 rounded shadow" aria-label="login-form">
  <h2 className="text-2xl font-semibold mb-4">Entrar</h2>

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
          <input
            {...register('password')}
            type="password"
            className={`mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring focus:ring-indigo-200 p-2 ${errors.password ? 'border-red-500' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
        </label>

        <button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:opacity-60">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          Ainda não tem conta? <Link to="/register" className="text-indigo-600">Cadastre-se</Link>
        </div>
      </form>
    </div>
  )
}

export default Login
