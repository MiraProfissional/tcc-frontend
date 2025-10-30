import type {
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ValidateTokenResponse,
  ResetPasswordResponse,
} from '../Dtos/PasswordReset.dto'
import api from './api'

const PasswordResetService = {
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await api.post<ForgotPasswordResponse>('/password/forgot-password', data)
    return response.data
  },

  async validateToken(token: string): Promise<ValidateTokenResponse> {
    const response = await api.get<ValidateTokenResponse>(`/password/validate-token/${token}`)
    return response.data
  },

  async resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const response = await api.post<ResetPasswordResponse>('/password/reset-password', {
      token,
      newPassword,
    })
    return response.data
  },
}

export default PasswordResetService
