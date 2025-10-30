import React, { useEffect, useState } from 'react'
import { getProfile } from '../utils/Services/UserService'
import { formatDateBirth } from '../utils/Helpers/dateFormatter'
import EditProfileModal from '../components/EditProfileModal'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import toast from 'react-hot-toast'
import type { StudentDto } from '../utils/Dtos/Student.dto'
import type { TeacherDto } from '../utils/Dtos/Teacher.dto'

type ProfileType = StudentDto | TeacherDto

const mapRole = (role?: string) => {
  if (!role) return ''
  const r = String(role).toUpperCase()
  if (r === 'STUDENT') return 'Aluno'
  if (r === 'TEACHER') return 'Professor'
  if (r === 'ADMIN') return 'Administrador'
  return role
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProfile()
      .then((data) => setProfile(data as ProfileType))
      .catch((err: unknown) => {
        console.error('Erro ao buscar perfil', err)
        toast.error('Não foi possível carregar o perfil')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleEditSuccess = () => {
    // Reload profile data
    getProfile()
      .then((data) => setProfile(data as ProfileType))
      .catch((err: unknown) => {
        console.error('Erro ao recarregar perfil', err)
      })
  }

  if (loading) return <div className="p-6">Carregando...</div>

  const person = profile ?? null
  const isStudent = person?.userRole === 'STUDENT'

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Meu Perfil</h2>
      {person ? (
        <div className="bg-white shadow rounded-lg p-8 max-w-3xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-2xl font-bold text-gray-900">{person.firstName} {person.lastName}</p>
              <p className="text-base text-gray-600 mt-1">{person.email}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium"
              >
                Trocar Senha
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
              >
                ✎ Editar
              </button>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="border-b pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Matrícula</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{person.registrationNumber}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CPF</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{person.cpf}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Celular</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{person.cellphone}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Data de Nascimento</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{formatDateBirth(person.dateBirth)}</p>
            </div>
            <div className="border-b pb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Perfil</p>
              <p className="text-lg font-medium text-gray-900 mt-1">{mapRole(person.userRole as unknown as string)}</p>
            </div>
            {'course' in person && (
              <div className="border-b pb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Curso</p>
                <p className="text-lg font-medium text-gray-900 mt-1">{(person as StudentDto).course}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Perfil não disponível</p>
      )}

      <EditProfileModal
        isOpen={isEditModalOpen}
        profile={person}
        isStudent={isStudent}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        userRole={person?.userRole || 'STUDENT'}
      />
    </div>
  )
}

export default Profile
