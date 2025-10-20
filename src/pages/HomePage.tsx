import { useContext, useEffect, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import AuthContext from '../utils/AuthContext'
import { jwtDecode } from 'jwt-decode'
import { getProfile } from '../utils/Services/UserService'
// toast not used here; keep import commented for future use

type Payload = { sub?: number; email?: string; userRole?: string;}

function HomePage() {
  const auth = useContext(AuthContext)
  const token = auth?.token

  const [name, setName] = useState('Usuário')
  const [role, setRole] = useState<string>('')
  const location = useLocation()

  const mapRole = (r?: string) => {
    if (!r) return ''
    const normalized = String(r).toUpperCase()
    if (normalized === 'STUDENT') return 'Aluno'
    if (normalized === 'TEACHER') return 'Professor'
    if (normalized === 'ADMIN') return 'Administrador'
    return r
  }

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

  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-white border-r">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Bem vindo {name}</h2>
          {role && <p className="text-sm text-gray-500">{mapRole(role)}</p>}
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link to="/home" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50">Início</Link>
            </li>
            <li>
              <Link to="/home/profile" className="block w-full text-left px-3 py-2 rounded hover:bg-gray-50">Meu perfil</Link>
            </li>
            {/* Disciplines removed per request */}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {/* Main content area — nested routes will render here */}
        <div className="max-w-5xl mx-auto">
          {/* keep the home card above nested content; hide when not at index */}
          {location.pathname === '/home' && (
            <div className="bg-white p-6 rounded shadow mb-6">
            <h1 className="text-2xl font-bold mb-4">Página inicial</h1>
            <p className="text-sm text-gray-600 mb-2">Conteúdo disponível para: <strong>{mapRole(role) || 'Todos'}</strong></p>
            <div>
              {role === 'STUDENT' && <p>Visão do estudante com disciplinas e notas.</p>}
              {role === 'TEACHER' && <p>Visão do professor com turmas e materiais.</p>}
              {!role && <p>Conteúdo geral do sistema.</p>}
            </div>
            </div>
          )}
          <div id="home-nested" className="">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage