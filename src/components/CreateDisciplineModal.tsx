import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { createDiscipline } from '../utils/Services/DisciplineService'
import { getAllStudents } from '../utils/Services/UserService'
import type { CreateDisciplineDto } from '../utils/Dtos/CreateDiscipline.dto'
import type { StudentDto } from '../utils/Dtos/Student.dto'

interface CreateDisciplineModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const schema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  code: yup.string().required('Código é obrigatório'),
  semester: yup.string().required('Semestre é obrigatório'),
  disciplineTime: yup.array()
    .of(yup.string().required('Horário é obrigatório'))
    .min(1, 'Adicione pelo menos um horário'),
  disciplineRoom: yup.string().required('Sala é obrigatória'),
  ipCamera: yup.number().typeError('Câmera IP deve ser um número').required('Câmera IP é obrigatória'),
})

const CreateDisciplineModal: React.FC<CreateDisciplineModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [timeInput, setTimeInput] = useState('')
  const [allStudents, setAllStudents] = useState<StudentDto[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      code: '',
      semester: '',
      disciplineTime: [],
      disciplineRoom: '',
      ipCamera: 1,
    },
  })

  const disciplineTime = watch('disciplineTime')

  useEffect(() => {
    if (isOpen) {
      loadAllStudents()
      setSelectedStudents([])
    }
  }, [isOpen])

  const loadAllStudents = async () => {
    setLoadingStudents(true)
    try {
      const students = await getAllStudents()
      setAllStudents(students)
    } catch (err) {
      console.error('Erro ao carregar alunos', err)
      toast.error('Não foi possível carregar a lista de alunos')
    } finally {
      setLoadingStudents(false)
    }
  }

  const handleToggleStudent = (studentId: number) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    )
  }

  const addTime = () => {
    if (timeInput.trim()) {
      const currentTimes = disciplineTime || []
      const updated = [...currentTimes, timeInput]
      setValue('disciplineTime', updated)
      setTimeInput('')
    }
  }

  const removeTime = (index: number) => {
    const currentTimes = (disciplineTime || []).filter((_, i) => i !== index)
    setValue('disciplineTime', currentTimes)
  }

  const onSubmit = async (data: unknown) => {
    setLoading(true)
    try {
      const createData = data as CreateDisciplineDto
      // Add selected students if any
      if (selectedStudents.length > 0) {
        createData.students = selectedStudents
      }
      await createDiscipline(createData)
      toast.success('Disciplina criada com sucesso!')
      reset()
      setSelectedStudents([])
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erro ao criar disciplina', err)
      toast.error('Não foi possível criar a disciplina')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Criar Disciplina</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                {...register('name')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Aula 4"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input
                type="text"
                {...register('code')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: SDES09"
              />
              {errors.code && <p className="text-red-600 text-sm mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <input
                type="text"
                {...register('semester')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 2025.1"
              />
              {errors.semester && <p className="text-red-600 text-sm mt-1">{errors.semester.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sala</label>
              <input
                type="text"
                {...register('disciplineRoom')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: C1113"
              />
              {errors.disciplineRoom && <p className="text-red-600 text-sm mt-1">{errors.disciplineRoom.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Câmera IP</label>
              <input
                type="number"
                {...register('ipCamera')}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 1"
              />
              {errors.ipCamera && <p className="text-red-600 text-sm mt-1">{errors.ipCamera.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horários</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={timeInput}
                onChange={(e) => setTimeInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 5T34"
              />
              <button
                type="button"
                onClick={addTime}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {(disciplineTime || []).map((time, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-blue-50 border border-blue-200 p-3 rounded"
                >
                  <span className="font-medium text-blue-900">{time}</span>
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
                  >
                    ✕ Excluir
                  </button>
                </div>
              ))}
            </div>
            {errors.disciplineTime && <p className="text-red-600 text-sm mt-1">{errors.disciplineTime.message}</p>}
          </div>

          {/* Students Selection */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">Adicionar Alunos (opcional)</label>
            {loadingStudents ? (
              <p className="text-gray-600 text-sm">Carregando alunos...</p>
            ) : allStudents.length === 0 ? (
              <p className="text-gray-600 text-sm">Nenhum aluno disponível.</p>
            ) : (
              <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2 bg-gray-50">
                {allStudents.map((student) => (
                  <label
                    key={student.id}
                    className="flex items-center p-2 border rounded hover:bg-white cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => handleToggleStudent(student.id)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-sm">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{student.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            {selectedStudents.length > 0 && (
              <p className="text-sm text-blue-600 font-medium mt-2">
                {selectedStudents.length} aluno(s) selecionado(s)
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Criando...' : 'Criar'}
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

export default CreateDisciplineModal
