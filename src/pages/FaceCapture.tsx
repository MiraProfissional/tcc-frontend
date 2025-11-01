import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/useAuth'
import api from '../utils/Services/api'
import toast from 'react-hot-toast'

const FaceCapture: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useAuth()
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  // Initialize camera with better error handling
  const startCamera = async () => {
    try {
      setCameraError(null)
      setIsRequestingPermission(true)

      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Seu navegador não suporta acesso à câmera. Use um navegador mais recente.')
      }

      // Show toast to inform user about permission request
      toast.loading('Solicitando permissão para acessar a câmera...', { id: 'camera-permission' })

      // Request camera access with better constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      })
      
      toast.dismiss('camera-permission')
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error('Erro ao iniciar vídeo', err)
          })
        }
        
        setIsCameraActive(true)
        toast.success('Câmera ativada com sucesso!')
      }
    } catch (err: unknown) {
      toast.dismiss('camera-permission')
      console.error('Erro ao acessar câmera', err)
      
      let errorMessage = 'Não foi possível acessar sua câmera.'
      
      // Provide specific error messages based on error type
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = '❌ Permissão negada! Você precisa permitir o acesso à câmera nas configurações do navegador.'
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = '📷 Nenhuma câmera foi encontrada no seu dispositivo.'
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = '⚠️ A câmera está sendo usada por outro aplicativo. Feche outros apps e tente novamente.'
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = '⚙️ As configurações da câmera não são suportadas. Tentando novamente...'
          // Try again with simpler constraints
          trySimpleCamera()
          return
        } else if (err.name === 'TypeError') {
          errorMessage = '🌐 Seu navegador não suporta acesso à câmera. Use Chrome, Firefox, Safari ou Edge.'
        } else if (err.message) {
          errorMessage = err.message
        }
      }
      
      setCameraError(errorMessage)
      toast.error(errorMessage, { duration: 5000 })
    } finally {
      setIsRequestingPermission(false)
    }
  }

  // Fallback function with simpler constraints
  const trySimpleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error('Erro ao iniciar vídeo', err)
          })
        }
        setIsCameraActive(true)
        setCameraError(null)
        toast.success('Câmera ativada com sucesso!')
      }
    } catch (err) {
      console.error('Erro ao tentar câmera simples', err)
      setCameraError('Não foi possível acessar a câmera mesmo com configurações simplificadas.')
    }
  }

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      setIsCameraActive(false)
    }
  }

  // Capture photo from camera
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
    toast.success('Foto capturada com sucesso!')
  }

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter menos de 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string)
      toast.success('Imagem selecionada com sucesso!')
    }
    reader.readAsDataURL(file)
  }

  // Upload photo to backend
  const uploadPhoto = async () => {
    if (!capturedImage || !token?.accessToken) return

    setUploading(true)
    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage)
      const blob = await response.blob()

      // Create form data
      const formData = new FormData()
      formData.append('file', blob, 'face-photo.jpg')

      // Upload with token in header
      await api.post('/uploads/user-face', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token.accessToken}`,
        },
      })

      toast.success('Foto enviada com sucesso! Bem-vindo!')
      
      // Redirect to home after successful upload
      setTimeout(() => {
        navigate('/home')
      }, 1500)
    } catch (err) {
      console.error('Erro ao enviar foto', err)
      toast.error('Não foi possível enviar a foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
    startCamera()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (!token?.accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-600 mb-4">Você precisa estar autenticado para acessar esta página.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Ir para Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 sm:p-6 lg:p-10 flex items-center justify-center overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-4 w-full h-full lg:h-[90vh] max-w-7xl">
        {/* Header + Instructions */}
        <div className="flex flex-col lg:flex-col w-full lg:w-auto">
          {/* Header */}
          <div className="mb-2 lg:mb-2">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Capturar Foto do Rosto</h1>
            <p className="text-gray-600 text-xs">Etapa 2 de 2</p>
          </div>

          {/* Instructions - Collapsible on mobile, always visible on desktop */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 w-full lg:w-72">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">📸 Instruções</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-x-4 gap-y-1 text-xs text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>Sem acessórios</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>Fundo neutro</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>Rosto visível</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>Boa iluminação</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                <span>Expressão neutra</span>
              </div>
            </div>
            
            {/* Help section for permission issues */}
            {cameraError && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-800 mb-1">💡 Ajuda</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Clique no ícone 🔒 ou 🎥 na barra de endereço</p>
                  <p>• Permita o acesso à câmera</p>
                  <p>• Recarregue a página se necessário</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Camera/Upload Area */}
        <div className="flex-1 bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col overflow-hidden min-h-0">
          {!capturedImage ? (
            <>
              {/* Camera Section */}
              {cameraError && (
                <div className="bg-red-50 border border-red-200 rounded p-2 mb-2 text-red-800 text-xs">
                  {cameraError}
                </div>
              )}

              {/* Video Preview */}
              <div className="bg-gray-900 rounded-lg overflow-hidden mb-2 sm:mb-3 flex-1 min-h-[200px] sm:min-h-[300px]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Button */}
              <div className="mb-2">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    disabled={isRequestingPermission}
                    className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                  >
                    {isRequestingPermission ? '⏳ Solicitando permissão...' : '📷 Abrir Câmera'}
                  </button>
                ) : (
                  <button
                    onClick={capturePhoto}
                    className="w-full bg-green-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    📸 Capturar Foto
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-2 my-2">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-xs">ou</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* File Upload Section */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4 text-center cursor-pointer hover:border-blue-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-gray-600 font-medium text-xs">📁 Selecionar Foto</p>
                <p className="text-gray-500 text-xs">Clique ou arraste</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            <>
              {/* Preview Section */}
              <p className="text-gray-600 text-xs font-medium mb-2">Pré-visualização</p>
              <div className="bg-gray-100 rounded-lg overflow-hidden flex-1 mb-2 min-h-[200px] sm:min-h-[300px]">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Preview Actions */}
              <div className="flex gap-2">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gray-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-gray-700 font-medium text-sm"
                >
                  🔄 Outra Foto
                </button>
                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 bg-green-600 text-white py-2 sm:py-2.5 rounded-lg hover:bg-green-700 font-medium text-sm disabled:bg-gray-400"
                >
                  {uploading ? '⏳ Enviando...' : '✅ Enviar'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FaceCapture
