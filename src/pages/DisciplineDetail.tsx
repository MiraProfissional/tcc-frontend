import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import AuthContext from '../utils/AuthContext'
import toast from 'react-hot-toast'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'

type Payload = { sub?: number; email?: string; userRole?: string }

const DisciplineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const auth = useContext(AuthContext)
  const token = auth?.token

  const [discipline, setDiscipline] = useState<DisciplineDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    // Get user role from token
    if (token?.accessToken) {
      try {
        const payload = jwtDecode<Payload>(token.accessToken)
        if (payload?.userRole) setUserRole(String(payload.userRole).toUpperCase())
      } catch {
        // ignore
      }
    }
  }, [token])

  useEffect(() => {
    // TODO: Fetch discipline details by ID from API
    // For now this is a placeholder - you'll implement the API call
    setLoading(true)
    // Simulated fetch - replace with actual API call
    setTimeout(() => {
      setLoading(false)
      toast('Detalhes da disciplina serão carregados aqui')
    }, 500)
  }, [id])

  if (loading) return <div className="p-6">Carregando detalhes...</div>

  if (!discipline) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Detalhes da Disciplina</h2>
        <p className="text-gray-600 mb-4">
          Disciplina ID: {id}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          (Implementação da busca de detalhes pendente)
        </p>
        <Link
          to="/home"
          className="inline-block bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
        >
          Voltar
        </Link>
      </div>
    )
  }

  const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN'

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link
          to="/home"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Voltar
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{discipline.name}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600">Código</p>
            <p className="font-medium">{discipline.code}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Semestre</p>
            <p className="font-medium">{discipline.semester}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Sala</p>
            <p className="font-medium">{discipline.disciplineRoom}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Horários</p>
            <p className="font-medium">{discipline.disciplineTime.join(', ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Professor</p>
            <p className="font-medium">
              {discipline.teacher.firstName} {discipline.teacher.lastName}
            </p>
          </div>
        </div>

        {/* Students list - only visible to teachers */}
        {isTeacher && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">
              Alunos Matriculados ({discipline.students.length})
            </h3>
            {discipline.students.length === 0 ? (
              <p className="text-gray-600">Nenhum aluno matriculado.</p>
            ) : (
              <div className="space-y-2">
                {discipline.students.map((student) => (
                  <div
                    key={student.id}
                    className="border rounded p-3 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Matrícula</p>
                      <p className="font-medium">{student.registrationNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* For students, show different content */}
        {!isTeacher && (
          <div className="mt-6">
            <p className="text-gray-600">
              Informações adicionais para alunos serão exibidas aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DisciplineDetail
