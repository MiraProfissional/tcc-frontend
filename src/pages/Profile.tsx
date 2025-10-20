import React, { useEffect, useState } from 'react'
import { getProfile } from '../utils/Services/UserService'
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

  if (loading) return <div className="p-6">Carregando...</div>

  const person = profile ?? null

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>
      {person ? (
        <div className="bg-white shadow rounded p-6 max-w-xl">
          <p className="text-lg font-medium">{person.firstName} {person.lastName}</p>
          <p className="text-sm text-gray-600">{person.email}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500">Data de Nascimento</div>
              <div>{person.dateBirth}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">CPF</div>
              <div>{person.cpf}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Celular</div>
              <div>{person.cellphone}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Matrícula</div>
              <div>{person.registrationNumber}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Perfil</div>
              <div>{mapRole(person.userRole as unknown as string)}</div>
            </div>
            {'course' in person && (
              <div>
                <div className="text-xs text-gray-500">Curso</div>
                <div>{(person as StudentDto).course}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p>Perfil não disponível</p>
      )}
    </div>
  )
}

export default Profile
