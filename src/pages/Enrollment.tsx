import React, { useContext, useEffect, useState } from 'react'
import AuthContext from '../utils/AuthContext'
import { jwtDecode } from 'jwt-decode'
import toast from 'react-hot-toast'
import { getAllDisciplines, enrollInDiscipline } from '../utils/Services/EnrollmentService'
import { getDisciplinesByUser } from '../utils/Services/DisciplineService'
import { getProfile } from '../utils/Services/UserService'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'

type Payload = { sub?: number; email?: string; userRole?: string; role?: string }

const Enrollment: React.FC = () => {
  const auth = useContext(AuthContext)
  const token = auth?.token

  const [allDisciplines, setAllDisciplines] = useState<DisciplineDto[]>([])
  const [enrolledDisciplines, setEnrolledDisciplines] = useState<DisciplineDto[]>([])
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState<number | null>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [userId, setUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Get user role and ID from profile or token
  useEffect(() => {
    const loadUserData = async () => {
      if (!token?.accessToken) return

      try {
        // First try to get from backend profile
        const profile = await getProfile()
        
        const profileData = profile as unknown as Record<string, unknown>
        if (profileData?.userRole) {
          const role = String(profileData.userRole).toUpperCase()
          setUserRole(role)
        }
        if (profileData?.id) {
          const id = Number(profileData.id)
          setUserId(id)
        }
        return
      } catch {
        // Could not fetch profile, trying token
      }

      // Fallback to token if profile fails
      try {
        const payload = jwtDecode<Payload>(token.accessToken)
        const role = String(payload?.userRole || payload?.role || '').toUpperCase()
        if (role) {
          setUserRole(role)
        }
        if (payload?.sub) {
          setUserId(payload.sub)
        }
      } catch (err) {
        console.error('Erro ao decodificar token:', err)
      }
    }

    loadUserData()
  }, [token])

  // Fetch all disciplines and enrolled disciplines
  useEffect(() => {
    let mounted = true
    async function loadDisciplines() {
      if (!token?.accessToken) return

      setLoading(true)
      try {
        // Get all disciplines
        const allDiscs = await getAllDisciplines()
        if (!mounted) return
        setAllDisciplines(allDiscs)

        // Get enrolled disciplines
        const userDiscs = await getDisciplinesByUser()
        if (!mounted) return
        setEnrolledDisciplines(userDiscs)
      } catch (err) {
        console.error('Erro ao carregar disciplinas', err)
        toast.error('Não foi possível carregar as disciplinas')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDisciplines()
    return () => {
      mounted = false
    }
  }, [token])

    const handleEnroll = async (disciplineId: number) => {
    if (enrolling !== null || !userId) return // Prevent double clicks

    // Check for schedule conflicts
    const disciplineToEnroll = allDisciplines.find((d) => d.id === disciplineId)
    if (!disciplineToEnroll) {
      toast.error('Disciplina não encontrada')
      return
    }

    // Extract the day from schedule (e.g., "2M12" -> "2M", "3N34" -> "3N")
    const getScheduleDay = (schedule: string): string => {
      return schedule.slice(0, 2) // Gets first 2 chars (day+period like "2M")
    }

    const conflictingDiscipline = enrolledDisciplines.find((enrolled) => {
      const enrolledDays = enrolled.disciplineTime.map(getScheduleDay)
      const newDays = disciplineToEnroll.disciplineTime.map(getScheduleDay)

      // Check if there's any overlap in days
      return enrolledDays.some((day) => newDays.includes(day))
    })

    if (conflictingDiscipline) {
      toast.error(
        `Conflito de horário! Você já está matriculado em "${conflictingDiscipline.name}" que possui o mesmo horário.`,
        { duration: 5000 }
      )
      return
    }

    setEnrolling(disciplineId)
    try {
      await enrollInDiscipline(disciplineId, userId)
      toast.success('Matrícula realizada com sucesso!')

      // Reload disciplines
      const userDiscs = await getDisciplinesByUser()
      setEnrolledDisciplines(userDiscs)

      // Dispatch event to notify other pages about enrollment
      window.dispatchEvent(
        new CustomEvent('studentEnrolled', {
          detail: { disciplineId, studentId: userId },
        })
      )
    } catch (err) {
      console.error('Erro ao matricular', err)
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Erro ao realizar matrícula. Tente novamente.'
      toast.error(`❌ ${errorMessage}`)
    } finally {
      setEnrolling(null)
    }
  }

  // Filter disciplines that the user is not enrolled in
  let availableDisciplines = allDisciplines.filter(
    (disc) => !enrolledDisciplines.some((enrolled) => enrolled.id === disc.id)
  )

  // Function to check for schedule conflicts
  const hasScheduleConflict = (disciplineId: number): { hasConflict: boolean; conflictingName?: string } => {
    const disciplineToCheck = allDisciplines.find((d) => d.id === disciplineId)
    if (!disciplineToCheck) return { hasConflict: false }

    const getScheduleDay = (schedule: string): string => {
      return schedule.slice(0, 2)
    }

    const conflicting = enrolledDisciplines.find((enrolled) => {
      const enrolledDays = enrolled.disciplineTime.map(getScheduleDay)
      const newDays = disciplineToCheck.disciplineTime.map(getScheduleDay)
      return enrolledDays.some((day) => newDays.includes(day))
    })

    return {
      hasConflict: !!conflicting,
      conflictingName: conflicting?.name,
    }
  }

  // Filter by search query
  if (searchQuery.trim()) {
    availableDisciplines = availableDisciplines.filter((disc) =>
      disc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      disc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (disc.teacher && `${disc.teacher.firstName} ${disc.teacher.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  const isStudent = userRole.toUpperCase() === 'STUDENT'

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Matrícula em Disciplinas</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            Selecione as disciplinas que deseja se matricular
          </p>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar por nome, código ou professor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Carregando disciplinas...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && availableDisciplines.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {enrolledDisciplines.length === 0
                ? 'Nenhuma disciplina disponível no momento.'
                : 'Você já está matriculado em todas as disciplinas!'}
            </p>
          </div>
        )}

        {/* Disciplines grid */}
        {!loading && availableDisciplines.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {availableDisciplines.map((discipline) => (
              <div
                key={discipline.id}
                className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2 break-words">{discipline.name}</h3>

                <div className="space-y-2 text-xs sm:text-sm mb-4">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Código:</span>
                    <span className="font-medium text-right">{discipline.code}</span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Semestre:</span>
                    <span className="font-medium text-right">{discipline.semester}</span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Sala:</span>
                    <span className="font-medium text-right">{discipline.disciplineRoom}</span>
                  </div>

                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Horários:</span>
                    <span className="font-medium text-right break-words">
                      {discipline.disciplineTime && discipline.disciplineTime.length > 0
                        ? discipline.disciplineTime.join(', ')
                        : 'Não especificado'}
                    </span>
                  </div>

                  {discipline.teacher && (
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600">Professor:</span>
                      <span className="font-medium text-right break-words">
                        {`${discipline.teacher.firstName} ${discipline.teacher.lastName}`}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleEnroll(discipline.id)}
                  disabled={enrolling === discipline.id || !isStudent || hasScheduleConflict(discipline.id).hasConflict}
                  title={hasScheduleConflict(discipline.id).hasConflict ? `Conflita com: ${hasScheduleConflict(discipline.id).conflictingName}` : ''}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {enrolling === discipline.id ? (
                    <span className="flex items-center justify-center">
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Matriculando...
                    </span>
                  ) : hasScheduleConflict(discipline.id).hasConflict ? (
                    '⚠️ Conflito de Horário'
                  ) : (
                    'Matricular'
                  )}
                </button>

                {hasScheduleConflict(discipline.id).hasConflict && (
                  <p className="text-xs text-orange-600 mt-2 font-medium break-words">
                    Conflita com: <strong>{hasScheduleConflict(discipline.id).conflictingName}</strong>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Enrollment
