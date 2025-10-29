import { useContext, useEffect, useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import AuthContext from '../utils/AuthContext'
import { jwtDecode } from 'jwt-decode'
import { getProfile, validateUserExists } from '../utils/Services/UserService'
import { getDisciplinesByUser } from '../utils/Services/DisciplineService'
import DisciplineCard from '../components/DisciplineCard'
import CreateDisciplineModal from '../components/CreateDisciplineModal'
import ScheduleGrid from '../components/ScheduleGrid'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'
import toast from 'react-hot-toast'

type Payload = { sub?: number; email?: string; userRole?: string;}

function HomePage() {
  const auth = useContext(AuthContext)
  const token = auth?.token
  const signOut = auth?.signOut
  const navigate = useNavigate()

  const [name, setName] = useState('Usuário')
  const [role, setRole] = useState<string>('')
  const [disciplines, setDisciplines] = useState<DisciplineDto[]>([])
  const [loadingDisciplines, setLoadingDisciplines] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const location = useLocation()

  const mapRole = (r?: string) => {
    if (!r) return ''
    const normalized = String(r).toUpperCase()
    if (normalized === 'STUDENT') return 'Aluno'
    if (normalized === 'TEACHER') return 'Professor'
    if (normalized === 'ADMIN') return 'Administrador'
    return r
  }

  const handleLogout = () => {
    if (signOut) {
      signOut()
      toast.success('Logout realizado com sucesso')
    }
  }

  // Validate if user still exists in the backend
  useEffect(() => {
    let mounted = true
    async function validateUser() {
      if (!token?.accessToken) return
      
      const userExists = await validateUserExists()
      if (!mounted) return
      
      if (!userExists) {
        // User doesn't exist anymore, logout and redirect
        if (signOut) {
          signOut()
        }
        toast.error('Sua conta foi deletada ou não existe mais. Faça login novamente.')
        navigate('/')
      }
    }

    validateUser()
    return () => { mounted = false }
  }, [token, signOut, navigate])

  useEffect(() => {
    let mounted = true
    async function load() {
      // Try to fetch profile from backend first
      try {
  const person = await getProfile()
  if (!mounted) return
  const personData = person as { firstName?: string; lastName?: string; email?: string; userRole?: string } | undefined
        if (!person) return
  const first = personData?.firstName
  const last = personData?.lastName
  const email = personData?.email
  if (first || last) setName(`${first ?? ''} ${last ?? ''}`.trim())
  else if (email) setName(email.split('@')[0])
  if (personData?.userRole) setRole(String(personData.userRole))
        return
      } catch {
        // fallback to token decode
        try {
          if (token?.accessToken) {
            const p = jwtDecode<Payload>(token.accessToken)
            if (p?.email) setName(p.email!.split('@')[0])
            if (p?.userRole) setRole(String(p.userRole))
          }
        } catch {
          // ignore
        }
      }
    }
    load()
    return () => { mounted = false }
  }, [token])

  // Fetch disciplines
  useEffect(() => {
    let mounted = true
    async function loadDisciplines() {
      if (!token?.accessToken) return
      setLoadingDisciplines(true)
      try {
        const data = await getDisciplinesByUser()
        if (!mounted) return
        setDisciplines(data)
      } catch (err) {
        console.error('Erro ao carregar disciplinas', err)
        toast.error('Não foi possível carregar as disciplinas')
      } finally {
        if (mounted) setLoadingDisciplines(false)
      }
    }
    loadDisciplines()
    return () => { mounted = false }
  }, [token])

  // Listen for discipline deletion event and refresh list
  useEffect(() => {
    const handleDisciplineDeleted = () => {
      // Reload disciplines when one is deleted
      if (token?.accessToken) {
        getDisciplinesByUser()
          .then((data) => setDisciplines(data))
          .catch((err) => {
            console.error('Erro ao recarregar disciplinas', err)
          })
      }
    }

    window.addEventListener('disciplineDeleted', handleDisciplineDeleted)
    return () => window.removeEventListener('disciplineDeleted', handleDisciplineDeleted)
  }, [token])

  return (
    <div className="h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r flex flex-col fixed h-screen">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Bem vindo {name}</h2>
          {role && <p className="text-sm text-gray-500">{mapRole(role)}</p>}
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">Início</Link>
            </li>
            <li>
              <Link to="/home/profile" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100">Meu perfil</Link>
            </li>
            {/* Disciplines removed per request */}
          </ul>
        </nav>
        
        {/* Logout button at the bottom of sidebar */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded text-red-600 hover:bg-red-50 font-medium"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto ml-64">
        {/* Main content area — nested routes will render here */}
        <div className="max-w-5xl mx-auto">
          {/* keep the home card above nested content; hide when not at index */}
          {location.pathname === '/home' && (
            <>
              {/* Schedule Grid */}
              {!loadingDisciplines && disciplines.length > 0 && (
                <div className="mb-6">
                  <ScheduleGrid disciplines={disciplines} />
                </div>
              )}

              {/* Disciplines grid */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Minhas Disciplinas</h2>
                  {(role === 'TEACHER' || role === 'ADMIN') && (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      + Criar Disciplina
                    </button>
                  )}
                </div>
                {loadingDisciplines && <p className="text-gray-600">Carregando disciplinas...</p>}
                {!loadingDisciplines && disciplines.length === 0 && (
                  <p className="text-gray-600">Nenhuma disciplina encontrada.</p>
                )}
                {!loadingDisciplines && disciplines.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {disciplines.map((disc) => (
                      <DisciplineCard key={disc.id} discipline={disc} isTeacher={role === 'TEACHER' || role === 'ADMIN'} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
          <div id="home-nested" className="">
            <Outlet />
          </div>
        </div>

        <CreateDisciplineModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            // Refresh disciplines list
            setLoadingDisciplines(true)
            getDisciplinesByUser()
              .then((data) => setDisciplines(data))
              .catch((err) => {
                console.error('Erro ao carregar disciplinas', err)
                toast.error('Não foi possível carregar as disciplinas')
              })
              .finally(() => setLoadingDisciplines(false))
          }}
        />
      </main>
    </div>
  )
}

export default HomePage