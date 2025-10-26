import React from 'react'
import { Link } from 'react-router-dom'
import FaceRecognitionButton from './FaceRecognitionButton'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'

interface DisciplineCardProps {
  discipline: DisciplineDto
  isTeacher?: boolean
}

const DisciplineCard: React.FC<DisciplineCardProps> = ({ discipline, isTeacher = false }) => {
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
