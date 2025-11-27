import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { updateUserProfile } from '../utils/Services/UserService'
import { formatDateToHTMLInput, parseHTMLDateToISO } from '../utils/Helpers/dateFormatter'
import { maskCPF, maskCellphone, unmaskCPF, unmaskCellphone } from '../utils/Helpers/masks'
import { courseOptions } from '../utils/Enums/Course.enum'
import type { StudentDto } from '../utils/Dtos/Student.dto'
import type { TeacherDto } from '../utils/Dtos/Teacher.dto'

type ProfileType = StudentDto | TeacherDto

interface EditProfileModalProps {
  isOpen: boolean
  profile: ProfileType | null
  isStudent: boolean
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  firstName: yup.string().required('Nome é obrigatório'),
  lastName: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  dateBirth: yup.string().required('Data de nascimento é obrigatória'),
  cpf: yup.string().required('CPF é obrigatório'),
  cellphone: yup.string().required('Celular é obrigatório'),
  registrationNumber: yup.number().required('Matrícula é obrigatória'),
  course: yup.string().when('isStudent', {
    is: true,
    then: (schema) => schema.required('Curso é obrigatório para estudantes'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  profile,
  isStudent,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateBirth: '',
      cpf: '',
      cellphone: '',
      registrationNumber: 0,
      course: '',
    },
  })

  useEffect(() => {
    if (isOpen && profile) {
      setValue('firstName', profile.firstName)
      setValue('lastName', profile.lastName)
      setValue('email', profile.email)
      setValue('dateBirth', formatDateToHTMLInput(profile.dateBirth))
      setValue('cpf', profile.cpf)
      setValue('cellphone', profile.cellphone)
      setValue('registrationNumber', profile.registrationNumber)
      
      if (isStudent && 'course' in profile) {
        setValue('course', (profile as StudentDto).course)
      }
    }
  }, [isOpen, profile, setValue, isStudent])

  const onSubmit = async (data: unknown) => {
    if (!profile) return
    
    setLoading(true)
    try {
      const formData = data as Record<string, unknown>
      
      const body: Record<string, unknown> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        dateBirth: parseHTMLDateToISO(String(formData.dateBirth)),
        cpf: unmaskCPF(String(formData.cpf)),
        cellphone: unmaskCellphone(String(formData.cellphone)),
        registrationNumber: formData.registrationNumber,
      }

      // Only add course if it's a student
      if (isStudent) {
        body.course = formData.course
      }

      await updateUserProfile(body)
      toast.success('Perfil atualizado com sucesso!')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erro ao atualizar perfil', err)
      toast.error('Não foi possível atualizar o perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !profile) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Editar Perfil</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                {...register('firstName')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu nome"
              />
              {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sobrenome</label>
              <input
                type="text"
                {...register('lastName')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu sobrenome"
              />
              {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
              <input
                type="date"
                {...register('dateBirth')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateBirth && <p className="text-red-600 text-sm mt-1">{errors.dateBirth.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                type="text"
                {...register('cpf')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123.456.789-00"
                maxLength={14}
                onChange={(e) => {
                  const masked = maskCPF(e.target.value)
                  e.target.value = masked
                }}
              />
              {errors.cpf && <p className="text-red-600 text-sm mt-1">{errors.cpf.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Celular</label>
              <input
                type="text"
                {...register('cellphone')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(12) 98765-4321"
                maxLength={15}
                onChange={(e) => {
                  const masked = maskCellphone(e.target.value)
                  e.target.value = masked
                }}
              />
              {errors.cellphone && <p className="text-red-600 text-sm mt-1">{errors.cellphone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isStudent ? 'Matrícula' : 'CIAP'}
              </label>
              <input
                type="number"
                {...register('registrationNumber')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={isStudent ? '1234567890' : '1234567'}
              />
              {errors.registrationNumber && <p className="text-red-600 text-sm mt-1">{errors.registrationNumber.message}</p>}
            </div>
          </div>

          {isStudent && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Curso</label>
              <select
                {...register('course')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um curso</option>
                {courseOptions.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
              {errors.course && <p className="text-red-600 text-sm mt-1">{errors.course.message}</p>}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfileModal
