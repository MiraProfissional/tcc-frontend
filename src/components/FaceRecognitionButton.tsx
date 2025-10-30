import React, { useState } from 'react'
import { useAuth } from '../utils/useAuth'
import { useFaceRecognition } from '../utils/Hooks/useFaceRecognition'
import api from '../utils/Services/api'
import toast from 'react-hot-toast'

interface FaceRecognitionButtonProps {
  disciplineId: number
  variant?: 'full' | 'icon'
}

const FaceRecognitionButton: React.FC<FaceRecognitionButtonProps> = ({ disciplineId, variant = 'full' }) => {
  const { token } = useAuth()
  const { activeDisciplineId, elapsedTime, isActive, startRecognition, stopRecognition } = useFaceRecognition()
  const [loading, setLoading] = useState(false)

  const isThisDisciplineActive = isActive && activeDisciplineId === disciplineId

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleStartRecognition = async () => {
    if (!token?.accessToken) {
      toast.error('Token não encontrado')
      return
    }

    setLoading(true)
    try {
      await api.post('/disciplines/start-face-recognition', {
        id: disciplineId,
      })

      await startRecognition(disciplineId)
      toast.success('Reconhecimento facial iniciado')
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento facial', err)
      toast.error('Não foi possível iniciar o reconhecimento facial')
    } finally {
      setLoading(false)
    }
  }

  const handleStopRecognition = async () => {
    if (!token?.accessToken) {
      toast.error('Token não encontrado')
      return
    }

    setLoading(true)
    try {
      await api.post('/disciplines/stop-face-recognition', {
        id: disciplineId,
      })

      await stopRecognition()
      toast.success('Reconhecimento facial finalizado')

      // Dispatch event to notify other components (like DisciplineDetail) to refresh sessions
      window.dispatchEvent(
        new CustomEvent('sessionCreated', {
          detail: { disciplineId },
        })
      )
    } catch (err) {
      console.error('Erro ao finalizar reconhecimento facial', err)
      toast.error('Não foi possível finalizar o reconhecimento facial')
    } finally {
      setLoading(false)
    }
  }

  // Icon variant for DisciplineDetail (alongside edit/delete buttons)
  if (variant === 'icon') {
    if (isThisDisciplineActive) {
      return (
        <button
          onClick={handleStopRecognition}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 font-medium"
          title="Parar reconhecimento facial"
        >
          ◼ {formatTime(elapsedTime)}
        </button>
      )
    }

    return (
      <button
        onClick={handleStartRecognition}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 font-medium"
        title="Iniciar reconhecimento facial"
      >
        ▶ Reconhecimento
      </button>
    )
  }

  // Full variant for DisciplineCard
  if (isThisDisciplineActive) {
    return (
      <button
        onClick={handleStopRecognition}
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:bg-gray-400 font-medium"
      >
        ◼ Parando em {formatTime(elapsedTime)}
      </button>
    )
  }

  return (
    <button
      onClick={handleStartRecognition}
      disabled={loading}
      className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400 font-medium"
    >
      {loading ? 'Iniciando...' : '▶ Iniciar Reconhecimento'}
    </button>
  )
}

export default FaceRecognitionButton
