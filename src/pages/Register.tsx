import React, { useRef, useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { signUpStudent, signUpTeacher } from '../utils/Services/UserService'
import AuthContext from '../utils/AuthContext'
import { courseOptions } from '../utils/Enums/Course.enum'
import PasswordTooltip from '../components/PasswordTooltip'
import { maskCPF, maskCellphone, unmaskCPF, unmaskCellphone } from '../utils/Helpers/masks'
import toast from 'react-hot-toast'

// RegisterForm type is inferred from the schema below

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

const schema = yup.object({
  userRole: yup.string().oneOf(['STUDENT', 'TEACHER']).required(),
  firstName: yup.string().required('Nome é obrigatório'),
  lastName: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().matches(passwordRegex, {
    message: 'Minimum eight characters, at least one letter, one number and one special character',
  }).required('Senha é obrigatória'),
  dateBirth: yup.string().required('Data de nascimento é obrigatória'),
  cpf: yup.string().required('CPF é obrigatório'),
  cellphone: yup.string().required('Celular é obrigatório'),
  registrationNumber: yup.string().when('userRole', {
    is: (val: unknown) => val === 'STUDENT',
    then: (schema) => schema
      .required('Número de matrícula é obrigatório')
      .matches(/^\d{10}$/, 'Matrícula deve ter exatamente 10 dígitos numéricos'),
    otherwise: (schema) => schema
      .required('SIAP é obrigatório')
      .matches(/^\d{7}$/, 'SIAP deve ter exatamente 7 dígitos numéricos'),
  }),
  course: yup.string().when('userRole', {
    is: (val: unknown) => val === 'STUDENT',
    then: (schema) => schema.required('Curso é obrigatório para estudantes'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const Register: React.FC = () => {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { userRole: 'STUDENT' },
  })

  const submittingRef = useRef(false)

  const userRole = watch('userRole')
  const password = watch('password')

  async function onSubmit(data: Record<string, unknown>) {
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      // preparar body
      const firstName = String(data.firstName)
      const lastName = String(data.lastName)
      const email = String(data.email)
      const password = String(data.password)
      const dateBirthRaw = String(data.dateBirth)
      // Convert date input (local) to an ISO8601 timestamp in UTC with +00:00 offset
      // Example output: 2001-03-16T00:00:00+00:00
      const [y, m, d] = dateBirthRaw.split('-').map(Number)
      const utcDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0))
      // toISOString() returns e.g. 2001-03-16T00:00:00.000Z — replace milliseconds+Z with +00:00
      const dateBirthIso = utcDate.toISOString().replace(/\.\d{3}Z$/, '+00:00')
      // Remove masks before sending
      const cpf = unmaskCPF(String(data.cpf))
      const cellphone = unmaskCellphone(String(data.cellphone))
      const registrationNumber = Number(data.registrationNumber)
      const userRole = String(data.userRole) as 'STUDENT' | 'TEACHER'

      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email,
        password,
        dateBirth: dateBirthIso,
        cpf,
        cellphone,
        registrationNumber,
        userRole,
      }
      if (userRole === 'STUDENT') body['course'] = String(data.course ?? '')

      // Assumo endpoints separados para cada tipo; ajuste se necessário
      if (userRole === 'STUDENT') await signUpStudent(body)
      else await signUpTeacher(body)

      toast.success('Conta criada com sucesso! Fazendo login...')

      // Auto-login after successful registration
      try {
        await auth?.signIn(email, password)

        // Redirect to face capture for students, to home for teachers
        if (userRole === 'STUDENT') {
          navigate('/face-capture')
        } else {
          navigate('/home')
        }
      } catch (loginErr) {
        console.error('Erro ao fazer login automático', loginErr)
        toast.error('Conta criada, mas erro ao fazer login automático. Faça login manualmente.')
        navigate('/')
      }
    } catch (err: unknown) {
      let message: string | undefined
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        const resp = e['response'] as Record<string, unknown> | undefined
        const d = resp?.['data'] as Record<string, unknown> | undefined
        if (d && typeof d['message'] === 'string') message = d['message'] as string
      }
      if (!message && err instanceof Error) message = err.message
      toast.error(message || 'Erro ao criar conta')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Criar Conta</h2>

        <div className="mb-4">
          <label className="mr-4">
            <input {...register('userRole')} type="radio" value="STUDENT" defaultChecked />{' '}
            Estudante
          </label>
          <label>
            <input {...register('userRole')} type="radio" value="TEACHER" />{' '}
            Professor
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Nome</label>
            <input {...register('firstName')} className="w-full p-2 border rounded" />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-700">Sobrenome</label>
            <input {...register('lastName')} className="w-full p-2 border rounded" />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Email</label>
            <input {...register('email')} type="email" className="w-full p-2 border rounded" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full p-2 pr-10 border rounded"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 13a8.971 8.971 0 01-1.07 3.6M12 19c4.478 0 8.268-2.943 9.543-7A9.969 9.969 0 0020.437 5.197M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7C7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                  )}
                </button>
                <PasswordTooltip password={password} />
              </div>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Data de Nascimento</label>
            <input
              {...register('dateBirth')}
              type="date"
              className="w-full p-2 border rounded"
            />
            {errors.dateBirth && <p className="text-sm text-red-600">{errors.dateBirth.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">CPF</label>
            <input
              {...register('cpf')}
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const masked = maskCPF(e.target.value)
                e.target.value = masked
              }}
              maxLength={14}
              placeholder="123.456.789-00"
            />
            {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Celular</label>
            <input
              {...register('cellphone')}
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const masked = maskCellphone(e.target.value)
                e.target.value = masked
              }}
              maxLength={15}
              placeholder="(12) 98765-4321"
            />
            {errors.cellphone && <p className="text-sm text-red-600">{errors.cellphone.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              {userRole === 'STUDENT' ? 'Nº Matrícula' : 'CIAP'}
            </label>
            <input
              {...register('registrationNumber')}
              className="w-full p-2 border rounded"
              placeholder={userRole === 'STUDENT' ? '1234567890' : '1234567'}
              maxLength={userRole === 'STUDENT' ? 10 : 7}
            />
            {errors.registrationNumber && <p className="text-sm text-red-600">{errors.registrationNumber.message}</p>}
          </div>

          {userRole === 'STUDENT' && (
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-700">Curso</label>
              <select {...register('course')} className="w-full p-2 border rounded">
                <option value="">Selecione um curso</option>
                {courseOptions.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
              {errors.course && <p className="text-sm text-red-600">{errors.course.message}</p>}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
            Voltar
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60">
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Register
