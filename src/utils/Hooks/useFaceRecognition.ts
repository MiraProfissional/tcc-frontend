import { useContext } from 'react'
import { FaceRecognitionContext } from '../Contexts/FaceRecognitionContext'

export function useFaceRecognition() {
  const context = useContext(FaceRecognitionContext)
  if (!context) {
    throw new Error('useFaceRecognition must be used within FaceRecognitionProvider')
  }
  return context
}
