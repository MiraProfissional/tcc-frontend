export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ValidateTokenResponse {
  valid: boolean
  message: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}
