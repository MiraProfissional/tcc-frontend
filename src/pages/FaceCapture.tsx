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

  // Initialize camera
  const startCamera = async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      console.error('Erro ao acessar câmera', err)
      setCameraError('Não foi possível acessar sua câmera. Verifique as permissões.')
      toast.error('Erro ao acessar câmera')
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

  // Skip photo upload (go directly to home)
  const skipPhoto = () => {
    if (window.confirm('Deseja pular a captura de foto do rosto? Você poderá fazer isso depois.')) {
      navigate('/home')
    }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Capturar Foto do Rosto</h1>
          <p className="text-gray-600">Etapa 2 de 2 - Confirmação de Identidade</p>
        </div>

        {/* Instructions Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📸 Instruções para a Foto</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Sem acessórios (óculos de sol, chapéu, lenço, etc.)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Fundo branco ou neutro (sem elementos ao fundo)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Apenas o rosto visível (enquadre bem)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Boa iluminação (evite sombras no rosto)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">✓</span>
              <span>Expresão neutra ou sorriso natural</span>
            </div>
          </div>
        </div>

        {/* Camera/Upload Area */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {!capturedImage ? (
            <>
              {/* Camera Section */}
              <div className="mb-6">
                {cameraError && (
                  <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
                    <p className="text-red-800 text-sm">{cameraError}</p>
                  </div>
                )}

                <div className="bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                <canvas ref={canvasRef} className="hidden" />

                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium mb-4"
                  >
                    📷 Abrir Câmera
                  </button>
                ) : (
                  <button
                    onClick={capturePhoto}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium mb-4"
                  >
                    📸 Capturar Foto
                  </button>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-gray-500 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* File Upload Section */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-600 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <p className="text-gray-600 font-medium mb-2">📁 Selecionar Foto</p>
                <p className="text-gray-500 text-sm">Clique ou arraste uma imagem aqui</p>
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
              <div className="mb-6">
                <p className="text-gray-600 text-sm font-medium mb-3">Pré-visualização da Foto</p>
                <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={capturedImage}
                    alt="Foto capturada"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Preview Actions */}
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  🔄 Tirar Outra Foto
                </button>
                <button
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                >
                  {uploading ? '⏳ Enviando...' : '✅ Enviar Foto'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Skip Option */}
        <div className="text-center">
          <button
            onClick={skipPhoto}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
          >
            ⏭️ Pular por enquanto
          </button>
        </div>
      </div>
    </div>
  )
}

export default FaceCapture
