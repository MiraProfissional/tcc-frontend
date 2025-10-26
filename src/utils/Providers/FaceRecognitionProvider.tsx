import React, { useState, useEffect, useRef } from 'react'
import { FaceRecognitionContext } from '../Contexts/FaceRecognitionContext'

export const FaceRecognitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeDisciplineId, setActiveDisciplineId] = useState<number | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Timer effect - auto stop after 20 minutes (1200 seconds)
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => {
          const newTime = prev + 1
          // Auto stop at 20 minutes (1200 seconds)
          if (newTime >= 1200) {
            setIsActive(false)
            setActiveDisciplineId(null)
          }
          return newTime
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isActive])

  const startRecognition = async (disciplineId: number) => {
    try {
      setActiveDisciplineId(disciplineId)
      setIsActive(true)
      setElapsedTime(0)
    } catch (err) {
      console.error('Erro ao iniciar reconhecimento', err)
    }
  }

  const stopRecognition = async () => {
    try {
      setIsActive(false)
      setActiveDisciplineId(null)
      setElapsedTime(0)
    } catch (err) {
      console.error('Erro ao parar reconhecimento', err)
    }
  }

  const setActiveDiscipline = (id: number | null) => {
    setActiveDisciplineId(id)
  }

  return (
    <FaceRecognitionContext.Provider
      value={{
        activeDisciplineId,
        elapsedTime,
        isActive,
        startRecognition,
        stopRecognition,
        setActiveDiscipline,
      }}
    >
      {children}
    </FaceRecognitionContext.Provider>
  )
}
