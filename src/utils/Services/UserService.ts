import api from './api'

export async function signUpStudent(body: Record<string, unknown>) {
  return api.post('/auth/sign-up/student', body)
}

export async function signUpTeacher(body: Record<string, unknown>) {
  return api.post('/auth/sign-up/teacher', body)
}

export default { signUpStudent, signUpTeacher }
