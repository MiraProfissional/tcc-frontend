import api from './api'

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
}

const ChangePasswordService = {
  async changePassword(
    data: ChangePasswordRequest,
    userType: 'student' | 'teacher'
  ): Promise<ChangePasswordResponse> {
    const endpoint = userType === 'student' ? '/students/me/password' : '/teachers/me/password'
    const response = await api.patch<ChangePasswordResponse>(endpoint, data)
    return response.data
  },
}

export default ChangePasswordService
