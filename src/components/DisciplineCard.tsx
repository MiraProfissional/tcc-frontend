import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../utils/AuthContext'
import { jwtDecode } from 'jwt-decode'
import FaceRecognitionButton from './FaceRecognitionButton'
import { calculateAttendance, getAttendanceColor } from '../utils/frequencyUtils'
import { getSessionsByDiscipline } from '../utils/Services/SessionService'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'
import type { SessionDto } from '../utils/Dtos/Session.dto'

type Payload = { sub?: number; email?: string; userRole?: string; role?: string }

interface DisciplineCardProps {
  discipline: DisciplineDto
  isTeacher?: boolean
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({ discipline, isTeacher = false }) => {
  const auth = useContext(AuthContext)
  const token = auth?.token
  
  const [sessions, setSessions] = useState<SessionDto[]>([])
  const [userId, setUserId] = useState<number | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Get user ID from token
  useEffect(() => {
    if (token?.accessToken && !isTeacher) {
      try {
        const payload = jwtDecode<Payload>(token.accessToken)
        if (payload?.sub) setUserId(Number(payload.sub))
      } catch {
        // ignore decode errors
      }
    }
  }, [token, isTeacher])

  // Load sessions for attendance calculation (students only)
  useEffect(() => {
    let mounted = true
    if (isTeacher || !userId) return

    async function loadSessions() {
      setLoadingSessions(true)
      try {
        const data = await getSessionsByDiscipline(discipline.id)
        if (mounted) setSessions(data)
      } catch {
        // fail silently
      } finally {
        if (mounted) setLoadingSessions(false)
      }
    }

    loadSessions()
    return () => { mounted = false }
  }, [discipline.id, userId, isTeacher])

  // Calculate attendance stats for students
  const attendanceStats = userId && !isTeacher ? calculateAttendance(discipline, userId, sessions) : null
  const attendancePercentage = attendanceStats?.attendancePercentage || 0
  const attendanceColor = getAttendanceColor(attendancePercentage)

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold mb-2">{discipline.name}</h3>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Código:</span>
          <span className="font-medium">{discipline.code}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Semestre:</span>
          <span className="font-medium">{discipline.semester}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Sala:</span>
          <span className="font-medium">{discipline.disciplineRoom}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Horários:</span>
          <span className="font-medium">{discipline.disciplineTime.join(', ')}</span>
        </div>
        
        {!isTeacher && (
          <div className="flex justify-between">
            <span className="text-gray-600">Professor:</span>
            <span className="font-medium">
              {discipline.teacher.firstName} {discipline.teacher.lastName}
            </span>
          </div>
        )}

        {/* Attendance info for students */}
        {!isTeacher && attendanceStats && !loadingSessions && (
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">Frequência:</span>
            <span className={`font-medium ${attendanceColor}`}>
              {attendanceStats.attendedSessions}/{attendanceStats.totalSessions} ({attendancePercentage}%)
            </span>
          </div>
        )}

        {!isTeacher && loadingSessions && (
          <div className="flex justify-between pt-2 border-t">
            <span className="text-gray-600">Frequência:</span>
            <span className="text-gray-400 text-xs">Carregando...</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isTeacher && (
          <FaceRecognitionButton disciplineId={discipline.id} />
        )}
        <Link
          to={`/home/discipline/${discipline.id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Detalhes
        </Link>
      </div>
    </div>
  )
}

export default DisciplineCard
