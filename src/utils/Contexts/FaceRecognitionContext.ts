import { createContext } from 'react'
import type { FaceRecognitionContextType } from '../Types/FaceRecognitionTypes'

export const FaceRecognitionContext = createContext<FaceRecognitionContextType | undefined>(undefined)
