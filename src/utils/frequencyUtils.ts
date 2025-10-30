import type { DisciplineDto } from './Dtos/Discipline.dto'
import type { SessionDto } from './Dtos/Session.dto'

export interface AttendanceStats {
  totalSessions: number
  attendedSessions: number
  attendancePercentage: number
}

/**
 * Calculate attendance statistics for a student in a discipline
 * @param _discipline - The discipline data
 * @param studentId - The student ID to check attendance for
 * @param sessions - Array of sessions for the discipline
 * @returns Attendance statistics
 */
export function calculateAttendance(
  _discipline: DisciplineDto,
  studentId: number,
  sessions: SessionDto[]
): AttendanceStats {
  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      attendedSessions: 0,
      attendancePercentage: 0,
    }
  }

  let attendedCount = 0

  // Count how many sessions this student was present in
  sessions.forEach((session) => {
    const isPresent = session.presentStudents?.some((student) => student.id === studentId)
    if (isPresent) {
      attendedCount++
    }
  })

  const totalSessions = sessions.length
  const attendancePercentage = totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0

  return {
    totalSessions,
    attendedSessions: attendedCount,
    attendancePercentage,
  }
}

/**
 * Get attendance color based on percentage
 * @param percentage - Attendance percentage
 * @returns Tailwind color class
 */
export function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return 'text-green-600'
  if (percentage >= 50) return 'text-yellow-600'
  return 'text-red-600'
}

/**
 * Get attendance background color for badges
 * @param percentage - Attendance percentage
 * @returns Tailwind background color class
 */
export function getAttendanceBgColor(percentage: number): string {
  if (percentage >= 75) return 'bg-green-100'
  if (percentage >= 50) return 'bg-yellow-100'
  return 'bg-red-100'
}
