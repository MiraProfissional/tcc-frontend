import React, { useState, useContext } from 'react'
import { formatDateBirth } from '../utils/Helpers/dateFormatter'
import type { SessionDto } from '../utils/Dtos/Session.dto'
import AuthContext from '../utils/AuthContext'
import { jwtDecode } from 'jwt-decode'

interface SessionListProps {
  sessions: SessionDto[]
  loading: boolean
  isTeacher?: boolean
}

type Payload = { sub?: number; email?: string; userRole?: string; }

const SessionList: React.FC<SessionListProps> = ({ sessions, loading, isTeacher = false }) => {
  const auth = useContext(AuthContext)
  const token = auth?.token
  const [expandedSessionId, setExpandedSessionId] = useState<number | null>(null)

  // Get current user ID from token
  let currentUserId: number | null = null
  try {
    if (token?.accessToken) {
      const payload = jwtDecode<Payload>(token.accessToken)
      currentUserId = payload.sub ?? null
    }
  } catch {
    // ignore
  }

  const toggleExpand = (sessionId: number) => {
    setExpandedSessionId(expandedSessionId === sessionId ? null : sessionId)
  }

  const formatDateTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoDate
    }
  }

  const calculateDuration = (start: string, end: string) => {
    try {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const diffMs = endDate.getTime() - startDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      return `${diffMins} min`
    } catch {
      return 'N/A'
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando aulas...</p>
  }

  if (sessions.length === 0) {
    return <p className="text-gray-600">Nenhuma aula registrada ainda.</p>
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const isExpanded = expandedSessionId === session.id
        const totalStudents = session.presentStudents.length + session.absentStudents.length
        const attendanceRate = totalStudents > 0
          ? Math.round((session.presentStudents.length / totalStudents) * 100)
          : 0

        // Check if current user is in present or absent list (for students view)
        const isCurrentUserPresent = session.presentStudents.some((s) => s.id === currentUserId)
        const isCurrentUserAbsent = session.absentStudents.some((s) => s.id === currentUserId)

        return (
          <div key={session.id} className="border rounded-lg overflow-hidden">
            {/* Session Header */}
            <button
              onClick={() => toggleExpand(session.id)}
              className="w-full bg-gray-100 hover:bg-gray-200 p-4 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="font-semibold text-gray-800">
                    Aula #{session.id} - {formatDateBirth(session.day)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duração: {calculateDuration(session.startedAt, session.endedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Teacher View: Show all stats */}
                {isTeacher && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      Presentes: <span className="font-semibold text-green-600">{session.presentStudents.length}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Ausentes: <span className="font-semibold text-red-600">{session.absentStudents.length}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Taxa: {attendanceRate}%
                    </p>
                  </div>
                )}

                {/* Student View: Show only their attendance */}
                {!isTeacher && (
                  <div className="text-right">
                    {isCurrentUserPresent && (
                      <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                        ✓ Presente
                      </p>
                    )}
                    {isCurrentUserAbsent && (
                      <p className="text-sm font-semibold text-red-600 flex items-center gap-1">
                        ✗ Ausente
                      </p>
                    )}
                    {!isCurrentUserPresent && !isCurrentUserAbsent && (
                      <p className="text-sm text-gray-500">Não registrado</p>
                    )}
                  </div>
                )}

                <span className="text-gray-500 text-xl">{isExpanded ? '▼' : '▶'}</span>
              </div>
            </button>

            {/* Session Details */}
            {isExpanded && (
              <div className="p-4 bg-white border-t">
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-600">Início:</span>
                    <span className="ml-2 font-medium">{formatDateTime(session.startedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Término:</span>
                    <span className="ml-2 font-medium">{formatDateTime(session.endedAt)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Câmera:</span>
                    <span className="ml-2 font-medium">{session.cameraIndex}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Aberta por:</span>
                    <span className="ml-2 font-medium">
                      {session.openedBy.firstName} {session.openedBy.lastName}
                    </span>
                  </div>
                </div>

                {/* Teacher View: Show all students lists */}
                {isTeacher && (
                  <>
                    {/* Present Students */}
                    {session.presentStudents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                          ✓ Alunos Presentes ({session.presentStudents.length})
                        </h4>
                        <div className="space-y-1">
                          {session.presentStudents.map((student) => (
                            <div
                              key={student.id}
                              className="bg-green-50 border border-green-200 rounded p-2 text-sm"
                            >
                              <p className="font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {student.email} • Matrícula: {student.registrationNumber}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Absent Students */}
                    {session.absentStudents.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                          ✗ Alunos Ausentes ({session.absentStudents.length})
                        </h4>
                        <div className="space-y-1">
                          {session.absentStudents.map((student) => (
                            <div
                              key={student.id}
                              className="bg-red-50 border border-red-200 rounded p-2 text-sm"
                            >
                              <p className="font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {student.email} • Matrícula: {student.registrationNumber}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Student View: Only show their status */}
                {!isTeacher && (
                  <div>
                    {isCurrentUserPresent && (
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="font-semibold text-green-700">✓ Você estava presente nesta aula</p>
                        <p className="text-sm text-gray-600 mt-1">Taxa de presença da turma: {attendanceRate}%</p>
                      </div>
                    )}
                    {isCurrentUserAbsent && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="font-semibold text-red-700">✗ Você estava ausente nesta aula</p>
                        <p className="text-sm text-gray-600 mt-1">Taxa de presença da turma: {attendanceRate}%</p>
                      </div>
                    )}
                    {!isCurrentUserPresent && !isCurrentUserAbsent && (
                      <div className="bg-gray-50 border border-gray-200 rounded p-3">
                        <p className="font-semibold text-gray-700">ℹ️ Seu registro não foi encontrado</p>
                        <p className="text-sm text-gray-600 mt-1">Taxa de presença da turma: {attendanceRate}%</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SessionList
