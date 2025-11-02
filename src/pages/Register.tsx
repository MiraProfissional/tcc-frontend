import React, { useRef, useContext, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import { signUpStudent, signUpStudentWithFace, signUpTeacher } from '../utils/Services/UserService'
import AuthContext from '../utils/AuthContext'
import { courseOptions } from '../utils/Enums/Course.enum'
import PasswordTooltip from '../components/PasswordTooltip'
import { maskCPF, maskCellphone, unmaskCPF, unmaskCellphone } from '../utils/Helpers/masks'
import toast from 'react-hot-toast'

// RegisterForm type is inferred from the schema below

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

const schema = yup.object({
  userRole: yup.string().oneOf(['STUDENT', 'TEACHER']).required(),
  firstName: yup.string().required('Nome é obrigatório'),
  lastName: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().matches(passwordRegex, {
    message: 'Minimum eight characters, at least one letter, one number and one special character',
  }).required('Senha é obrigatória'),
  dateBirth: yup.string().required('Data de nascimento é obrigatória'),
  cpf: yup.string().required('CPF é obrigatório'),
  cellphone: yup.string().required('Celular é obrigatório'),
  registrationNumber: yup.string().when('userRole', {
    is: (val: unknown) => val === 'STUDENT',
    then: (schema) => schema
      .required('Número de matrícula é obrigatório')
      .matches(/^\d{10}$/, 'Matrícula deve ter exatamente 10 dígitos numéricos'),
    otherwise: (schema) => schema
      .required('SIAP é obrigatório')
      .matches(/^\d{7}$/, 'SIAP deve ter exatamente 7 dígitos numéricos'),
  }),
  course: yup.string().when('userRole', {
    is: (val: unknown) => val === 'STUDENT',
    then: (schema) => schema.required('Curso é obrigatório para estudantes'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

const Register: React.FC = () => {
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { userRole: 'STUDENT' },
  })

  const submittingRef = useRef(false)
  
  // Face capture states
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [showFaceCapture, setShowFaceCapture] = useState(false)

  const userRole = watch('userRole')
  const password = watch('password')

  // Debug effect
  useEffect(() => {
    console.log('Estados atuais:', {
      userRole,
      showFaceCapture,
      isCameraActive,
      capturedImage: capturedImage ? 'presente' : 'ausente',
    })
  }, [userRole, showFaceCapture, isCameraActive, capturedImage])

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null)
      console.log('Tentando acessar câmera...')
      
      // Set camera active FIRST so video element gets rendered
      setIsCameraActive(true)
      
      // Wait a bit for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      
      console.log('Stream obtido:', stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          console.log('Metadata carregada, iniciando vídeo')
          videoRef.current?.play().catch(err => console.error('Erro ao iniciar vídeo', err))
        }
        toast.success('Câmera ativada!')
      } else {
        console.error('videoRef.current is null even after waiting')
        setIsCameraActive(false)
        setCameraError('Erro ao inicializar vídeo')
      }
    } catch (err) {
      console.error('Erro ao acessar câmera', err)
      setIsCameraActive(false)
      setCameraError('Não foi possível acessar a câmera. Verifique as permissões.')
      toast.error('Erro ao acessar câmera')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const context = canvasRef.current.getContext('2d')
    if (!context) return

    canvasRef.current.width = videoRef.current.videoWidth
    canvasRef.current.height = videoRef.current.videoHeight
    context.drawImage(videoRef.current, 0, 0)

    const imageData = canvasRef.current.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)
    stopCamera()
    toast.success('Foto capturada!')
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string)
      toast.success('Imagem selecionada!')
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(data: Record<string, unknown>) {
    if (submittingRef.current) return
    submittingRef.current = true
    try {
      const userRole = String(data.userRole) as 'STUDENT' | 'TEACHER'
      
      // For students, require face image
      if (userRole === 'STUDENT' && !capturedImage) {
        toast.error('Por favor, capture ou selecione uma foto do seu rosto antes de continuar')
        setShowFaceCapture(true)
        return
      }

      // preparar body
      const firstName = String(data.firstName)
      const lastName = String(data.lastName)
      const email = String(data.email)
      const password = String(data.password)
      const dateBirthRaw = String(data.dateBirth)
      // Convert date input (local) to an ISO8601 timestamp in UTC with +00:00 offset
      // Example output: 2001-03-16T00:00:00+00:00
      const [y, m, d] = dateBirthRaw.split('-').map(Number)
      const utcDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1, 0, 0, 0))
      // toISOString() returns e.g. 2001-03-16T00:00:00.000Z — replace milliseconds+Z with +00:00
      const dateBirthIso = utcDate.toISOString().replace(/\.\d{3}Z$/, '+00:00')
      // Remove masks before sending
      const cpf = unmaskCPF(String(data.cpf))
      const cellphone = unmaskCellphone(String(data.cellphone))
      const registrationNumber = Number(data.registrationNumber)

      const body: Record<string, unknown> = {
        firstName,
        lastName,
        email,
        password,
        dateBirth: dateBirthIso,
        cpf,
        cellphone,
        registrationNumber,
        userRole,
      }
      if (userRole === 'STUDENT') body['course'] = String(data.course ?? '')

      // For students with face image, use transactional endpoint
      if (userRole === 'STUDENT' && capturedImage) {
        // Convert base64 to blob
        const response = await fetch(capturedImage)
        const blob = await response.blob()
        
        await signUpStudentWithFace(body, blob)
        toast.success('Conta criada com sucesso com foto da face!')
      } else {
        // Legacy endpoints for teachers or if something goes wrong
        if (userRole === 'STUDENT') await signUpStudent(body)
        else await signUpTeacher(body)
        toast.success('Conta criada com sucesso!')
      }

      // Auto-login after successful registration
      try {
        await auth?.signIn(email, password)
        
        // For students with face already uploaded, go straight to home
        // For teachers, also go to home
        navigate('/home')
      } catch (loginErr) {
        console.error('Erro ao fazer login automático', loginErr)
        toast.error('Conta criada, mas erro ao fazer login automático. Faça login manualmente.')
        navigate('/')
      }
    } catch (err: unknown) {
      let message: string | undefined
      if (typeof err === 'object' && err !== null) {
        const e = err as Record<string, unknown>
        const resp = e['response'] as Record<string, unknown> | undefined
        const d = resp?.['data'] as Record<string, unknown> | undefined
        if (d && typeof d['message'] === 'string') message = d['message'] as string
      }
      if (!message && err instanceof Error) message = err.message
      toast.error(message || 'Erro ao criar conta')
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Criar Conta</h2>

        <div className="mb-4">
          <label className="mr-4">
            <input {...register('userRole')} type="radio" value="STUDENT" defaultChecked />{' '}
            Estudante
          </label>
          <label>
            <input {...register('userRole')} type="radio" value="TEACHER" />{' '}
            Professor
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-700">Nome</label>
            <input {...register('firstName')} className="w-full p-2 border rounded" />
            {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-700">Sobrenome</label>
            <input {...register('lastName')} className="w-full p-2 border rounded" />
            {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Email</label>
            <input {...register('email')} type="email" className="w-full p-2 border rounded" />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">Senha</label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full p-2 pr-20 border rounded"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <PasswordTooltip password={password} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM19.5 13a8.971 8.971 0 01-1.07 3.6M12 19c4.478 0 8.268-2.943 9.543-7A9.969 9.969 0 0020.437 5.197M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7C7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Data de Nascimento</label>
            <input
              {...register('dateBirth')}
              type="date"
              className="w-full p-2 border rounded"
            />
            {errors.dateBirth && <p className="text-sm text-red-600">{errors.dateBirth.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">CPF</label>
            <input
              {...register('cpf')}
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const masked = maskCPF(e.target.value)
                e.target.value = masked
              }}
              maxLength={14}
              placeholder="123.456.789-00"
            />
            {errors.cpf && <p className="text-sm text-red-600">{errors.cpf.message}</p>}
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700">Celular</label>
            <input
              {...register('cellphone')}
              className="w-full p-2 border rounded"
              onChange={(e) => {
                const masked = maskCellphone(e.target.value)
                e.target.value = masked
              }}
              maxLength={15}
              placeholder="(12) 98765-4321"
            />
            {errors.cellphone && <p className="text-sm text-red-600">{errors.cellphone.message}</p>}
          </div>
          
          <div>
            <label className="block mb-1 text-sm text-gray-700">
              {userRole === 'STUDENT' ? 'Nº Matrícula' : 'CIAP'}
            </label>
            <input
              {...register('registrationNumber')}
              className="w-full p-2 border rounded"
              placeholder={userRole === 'STUDENT' ? '1234567890' : '1234567'}
              maxLength={userRole === 'STUDENT' ? 10 : 7}
            />
            {errors.registrationNumber && <p className="text-sm text-red-600">{errors.registrationNumber.message}</p>}
          </div>

          {userRole === 'STUDENT' && (
            <div className="col-span-2">
              <label className="block mb-1 text-sm text-gray-700">Curso</label>
              <select {...register('course')} className="w-full p-2 border rounded">
                <option value="">Selecione um curso</option>
                {courseOptions.map((course) => (
                  <option key={course.value} value={course.value}>
                    {course.label}
                  </option>
                ))}
              </select>
              {errors.course && <p className="text-sm text-red-600">{errors.course.message}</p>}
            </div>
          )}
        </div>

        {/* Face capture section for students */}
        {userRole === 'STUDENT' && (
          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Foto do Rosto (Obrigatório)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Para criar sua conta, você precisa enviar uma foto do seu rosto para o sistema de reconhecimento facial.
            </p>

            {!capturedImage ? (
              <div className="space-y-3">
                {!showFaceCapture && (
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Botão clicado: mostrando seção de captura')
                      setShowFaceCapture(true)
                    }}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    📸 Adicionar Foto do Rosto
                  </button>
                )}

                {showFaceCapture && !isCameraActive && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('Botão Abrir Câmera clicado')
                        startCamera()
                      }}
                      className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                    >
                      📷 Abrir Câmera
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-indigo-500 text-white py-2 rounded hover:bg-indigo-600"
                    >
                      📁 Selecionar Arquivo
                    </button>
                  </div>
                )}

                {isCameraActive && (
                  <div className="space-y-2">
                    <div className="bg-gray-900 rounded overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600"
                      >
                        ✓ Capturar Foto
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600"
                      >
                        ✕ Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded text-sm">
                    {cameraError}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full rounded border"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null)
                      setShowFaceCapture(true)
                    }}
                    className="flex-1 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
                  >
                    🔄 Tirar Outra Foto
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded text-sm">
                  ✓ Foto capturada! Agora você pode criar sua conta.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-6 flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50">
            Voltar
          </button>
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-60">
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Register
