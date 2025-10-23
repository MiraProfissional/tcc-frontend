import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { getAllStudents } from '../utils/Services/UserService'
import { addStudentsToDiscipline } from '../utils/Services/DisciplineService'
import type { StudentDto } from '../utils/Dtos/Student.dto'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'

interface AddStudentToDisciplineModalProps {
  isOpen: boolean
  discipline: DisciplineDto
  onClose: () => void
  onSuccess: () => void
}

const AddStudentToDisciplineModal: React.FC<AddStudentToDisciplineModalProps> = ({
  isOpen,
  discipline,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [allStudents, setAllStudents] = useState<StudentDto[]>([])
  const [selectedStudents, setSelectedStudents] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      loadAllStudents()
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

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Selecione pelo menos um aluno')
      return
    }

    setLoading(true)
    try {
      await addStudentsToDiscipline(discipline.id, selectedStudents)
      toast.success(`${selectedStudents.length} aluno(s) adicionado(s) com sucesso!`)
      setSelectedStudents([])
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Erro ao adicionar alunos', err)
      toast.error('Não foi possível adicionar os alunos')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Get current student IDs in discipline
  const currentStudentIds = discipline.students.map((s) => s.id)

  // Filter out students already in the discipline
  const availableStudents = allStudents.filter((s) => !currentStudentIds.includes(s.id))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Adicionar Alunos</h2>
        <p className="text-sm text-gray-600 mb-4">
          Disciplina: <strong>{discipline.name}</strong>
        </p>

        {loadingStudents ? (
          <p className="text-gray-600">Carregando lista de alunos...</p>
        ) : availableStudents.length === 0 ? (
          <p className="text-gray-600">Todos os alunos já estão matriculados nesta disciplina.</p>
        ) : (
          <div className="space-y-3 mb-6">
            {availableStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center p-3 border rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleToggleStudent(student.id)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <p className="font-medium">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  ID: {student.id}
                </span>
              </label>
            ))}
          </div>
        )}

        {selectedStudents.length > 0 && (
          <p className="text-sm text-blue-600 mb-4 font-medium">
            {selectedStudents.length} aluno(s) selecionado(s)
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleAddStudents}
            disabled={loading || selectedStudents.length === 0}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddStudentToDisciplineModal
