import api from './api'

export async function signUpStudent(body: Record<string, unknown>) {
  return api.post('/students', body)
}

export async function signUpTeacher(body: Record<string, unknown>) {
  return api.post('/teachers', body)
}

export default { signUpStudent, signUpTeacher }
