export interface FaceRecognitionContextType {
  activeDisciplineId: number | null
  elapsedTime: number
  isActive: boolean
  startRecognition: (disciplineId: number) => Promise<void>
  stopRecognition: () => Promise<void>
  setActiveDiscipline: (id: number | null) => void
}
