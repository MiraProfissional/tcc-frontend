import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import AuthContext from '../utils/AuthContext'
import { getDisciplineById, deleteDiscipline, removeStudentFromDiscipline } from '../utils/Services/DisciplineService'
import { getSessionsByDiscipline } from '../utils/Services/SessionService'
import { calculateAttendance, getAttendanceColor } from '../utils/frequencyUtils'
import EditDisciplineModal from '../components/EditDisciplineModal'
import AddStudentToDisciplineModal from '../components/AddStudentToDisciplineModal'
import FaceRecognitionButton from '../components/FaceRecognitionButton'
import SessionList from '../components/SessionList'
import toast from 'react-hot-toast'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'
import type { SessionDto } from '../utils/Dtos/Session.dto'

type Payload = { sub?: number; email?: string; userRole?: string; role?: string }

const DisciplineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const auth = useContext(AuthContext)
  const token = auth?.token

  const [discipline, setDiscipline] = useState<DisciplineDto | null>(null)
  const [sessions, setSessions] = useState<SessionDto[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'sessions' | 'students'>('sessions')
  const navigate = useNavigate()

  useEffect(() => {
    // Get user role and id from token (handles both `userRole` and legacy `role` claim)
    if (token?.accessToken) {
      try {
        const payload = jwtDecode<Payload>(token.accessToken)
        const roleClaim = (payload?.userRole ?? payload?.role) as string | undefined
        if (roleClaim) setUserRole(String(roleClaim).toUpperCase())
        if (payload?.sub) setUserId(Number(payload.sub))
      } catch (err) {
        // ignore decode errors
        console.warn('Failed to decode token payload', err)
      }
    }
  }, [token])

  useEffect(() => {
    let mounted = true
    async function loadDiscipline() {
      if (!id) return
      setLoading(true)
      try {
        const data = await getDisciplineById(id)
        if (!mounted) return
        setDiscipline(data)
      } catch (err) {
        console.error('Erro ao carregar disciplina', err)
        toast.error('Não foi possível carregar os detalhes da disciplina')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadDiscipline()
    return () => { mounted = false }
  }, [id])

  // Load sessions
  useEffect(() => {
    let mounted = true
    async function loadSessions() {
      if (!id) return
      setLoadingSessions(true)
      try {
        const data = await getSessionsByDiscipline(Number(id))
        if (!mounted) return
        setSessions(data)
      } catch (err) {
        console.error('Erro ao carregar aulas', err)
        // Don't show error toast, just fail silently
      } finally {
        if (mounted) setLoadingSessions(false)
      }
    }
    loadSessions()
    return () => { mounted = false }
  }, [id])

  // Listen for session creation events and refresh list
  useEffect(() => {
    const handleSessionCreated = (event: Event) => {
      const customEvent = event as CustomEvent
      const { disciplineId } = customEvent.detail || {}
      
      // Only refresh if the event is for this discipline
      if (disciplineId === Number(id)) {
        if (id) {
          getSessionsByDiscipline(Number(id))
            .then((data) => setSessions(data))
            .catch((err) => {
              console.error('Erro ao recarregar aulas', err)
            })
        }
      }
    }

    window.addEventListener('sessionCreated', handleSessionCreated)
    return () => window.removeEventListener('sessionCreated', handleSessionCreated)
  }, [id])

  const handleDelete = () => {
    if (!discipline || !window.confirm('Tem certeza que deseja deletar esta disciplina?')) return

    deleteDiscipline(discipline.id)
      .then(() => {
        toast.success('Disciplina deletada com sucesso!')
        // Notify HomePage to refresh disciplines list
        window.dispatchEvent(new CustomEvent('disciplineDeleted', { detail: { disciplineId: discipline.id } }))
        // Small delay to ensure event is processed before navigation
        setTimeout(() => navigate('/home'), 100)
      })
      .catch((err) => {
        console.error('Erro ao deletar disciplina', err)
        toast.error('Não foi possível deletar a disciplina')
      })
  }

  const handleEditSuccess = () => {
    // Reload discipline data
    if (id) {
      getDisciplineById(id)
        .then((data) => setDiscipline(data))
        .catch((err) => {
          console.error('Erro ao recarregar disciplina', err)
          toast.error('Não foi possível recarregar os detalhes')
        })
    }
  }

  const handleRemoveStudent = (studentId: number) => {
    if (!discipline || !window.confirm('Tem certeza que deseja remover este aluno?')) return

    removeStudentFromDiscipline(discipline.id, [studentId])
      .then(() => {
        toast.success('Aluno removido com sucesso!')
        handleEditSuccess()
      })
      .catch((err) => {
        console.error('Erro ao remover aluno', err)
        toast.error('Não foi possível remover o aluno')
      })
  }

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

  // Consider user a teacher for UI purposes if they have TEACHER/ADMIN role
  // or if they are the owner (teacher) of this discipline
  const isTeacher =
    userRole === 'TEACHER' || userRole === 'ADMIN' || (discipline && userId !== null && discipline.teacher?.id === userId)

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4">
        <Link
          to="/home"
          className="text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          ← Voltar
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold break-words">{discipline.name}</h2>
          {isTeacher && (
            <div className="flex flex-wrap gap-2">
              <FaceRecognitionButton disciplineId={discipline.id} variant="icon" />
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm sm:text-base whitespace-nowrap"
              >
                ✎ Editar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base whitespace-nowrap"
              >
                🗑 Deletar
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
          {/* Only show teacher info for students (hide when viewing as the teacher owner) */}
          {!isTeacher && (
            <div>
              <p className="text-sm text-gray-600">Professor</p>
              <p className="font-medium">
                {discipline.teacher.firstName} {discipline.teacher.lastName}
              </p>
            </div>
          )}
          {/* Show attendance for students viewing their own discipline */}
          {!isTeacher && userId && (
            <div>
              <p className="text-sm text-gray-600">Sua Frequência</p>
              <p className={`font-medium ${getAttendanceColor(calculateAttendance(discipline, userId, sessions).attendancePercentage)}`}>
                {calculateAttendance(discipline, userId, sessions).attendedSessions}/{calculateAttendance(discipline, userId, sessions).totalSessions} ({calculateAttendance(discipline, userId, sessions).attendancePercentage}%)
              </p>
            </div>
          )}
        </div>

        {/* Tabs for Sessions and Students */}
        <div className="mt-4 sm:mt-6">
          {/* Tab Navigation */}
          <div className="flex border-b mb-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'sessions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📚 Aulas ({sessions.length})
            </button>
            {isTeacher && (
              <button
                onClick={() => setActiveTab('students')}
                className={`px-3 sm:px-4 py-2 font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeTab === 'students'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👥 Alunos ({discipline.students.length})
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'sessions' && (
            <div>
              <SessionList sessions={sessions} loading={loadingSessions} isTeacher={isTeacher} />
            </div>
            )}

            {activeTab === 'students' && isTeacher && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                  <h3 className="text-base sm:text-lg font-semibold">
                    Alunos Matriculados ({discipline.students.length})
                  </h3>
                  <button
                    onClick={() => setIsAddStudentModalOpen(true)}
                    className="bg-green-600 text-white px-3 py-2 text-sm rounded hover:bg-green-700 whitespace-nowrap w-full sm:w-auto"
                  >
                    + Adicionar
                  </button>
                </div>
                {discipline.students.length === 0 ? (
                  <p className="text-gray-600">Nenhum aluno matriculado.</p>
                ) : (
                  <div className="space-y-2">
                    {discipline.students.map((student) => {
                      const attendance = calculateAttendance(discipline, student.id, sessions)
                      const attendanceColor = getAttendanceColor(attendance.attendancePercentage)
                      return (
                        <div
                          key={student.id}
                          className="border rounded p-3 flex justify-between items-center"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Frequência</p>
                              <p className={`font-medium ${attendanceColor}`}>
                                {attendance.attendedSessions}/{attendance.totalSessions} ({attendance.attendancePercentage}%)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">Matrícula</p>
                              <p className="font-medium">{student.registrationNumber}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveStudent(student.id)}
                              className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      <EditDisciplineModal
        isOpen={isEditModalOpen}
        discipline={discipline}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      {discipline && (
        <AddStudentToDisciplineModal
          isOpen={isAddStudentModalOpen}
          discipline={discipline}
          onClose={() => setIsAddStudentModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}

export default DisciplineDetail
