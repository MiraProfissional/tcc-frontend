import React, { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { signUpStudent, signUpTeacher } from '../utils/Services/UserService'
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
  registrationNumber: yup.string().required('Número de matrícula é obrigatório'),
  course: yup.string().when('userRole', {
    is: (val: unknown) => val === 'STUDENT',
    then: (schema) => schema.required('Curso é obrigatório para estudantes'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { userRole: 'STUDENT' },
  })

  const submittingRef = useRef(false)

  const userRole = watch('userRole')

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
      const cpf = String(data.cpf)
      const cellphone = String(data.cellphone)
      const registrationNumber = Number(data.registrationNumber)
      const userRole = String(data.userRole) as 'STUDENT' | 'TEACHER'

      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email,
        password,
        dateBirth: new Date(dateBirthRaw).toISOString(),
        cpf,
        cellphone,
        registrationNumber,
        userRole,
      }
      if (userRole === 'STUDENT') body['course'] = String(data.course ?? '')

      // Assumo endpoints separados para cada tipo; ajuste se necessário
  if (userRole === 'STUDENT') await signUpStudent(body)
  else await signUpTeacher(body)
      toast.success('Conta criada com sucesso')
      navigate('/')
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
            <input {...register('password')} type="password" className="w-full p-2 border rounded" />
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Data de Nascimento</label>
            <input {...register('dateBirth')} type="date" className="w-full p-2 border rounded" />
            {errors.dateBirth && <p className="text-sm text-red-600">{errors.dateBirth.message}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-700">CPF</label>
            <input {...register('cpf')} className="w-full p-2 border rounded" />
            {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Celular</label>
            <input {...register('cellphone')} className="w-full p-2 border rounded" />
            {errors.cellphone && <p className="text-sm text-red-600">{errors.cellphone.message}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-700">Nº Matrícula</label>
            <input {...register('registrationNumber')} className="w-full p-2 border rounded" />
            {errors.registrationNumber && <p className="text-sm text-red-600">{errors.registrationNumber.message}</p>}
          </div>

          {userRole === 'STUDENT' && (
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-700">Curso</label>
              <input {...register('course')} className="w-full p-2 border rounded" />
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
