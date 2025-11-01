import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { DisciplineDto } from '../utils/Dtos/Discipline.dto'

interface ScheduleGridProps {
  disciplines: DisciplineDto[]
}

// Mapeamento dos horários conforme a imagem
const TIME_SLOTS = {
  M: [
    { slot: '1', time: '07h00-07h55' },
    { slot: '2', time: '07h55-08h50' },
    { slot: '3', time: '10h10-11h05' },
    { slot: '4', time: '11h05-12h00' },
    { slot: '5', time: '08h50-09h45' },
  ],
  T: [
    { slot: '1', time: '13h30-14h25' },
    { slot: '2', time: '14h25-15h20' },
    { slot: '3', time: '15h40-16h40' },
    { slot: '4', time: '16h40-17h35' },
    { slot: '5', time: '17h35-18h30' },
  ],
  N: [
    { slot: '1', time: '19h00-19h50' },
    { slot: '2', time: '19h50-20h40' },
    { slot: '3', time: '21h00-21h50' },
    { slot: '4', time: '21h50-22h40' },
    { slot: '5', time: '22h40-23h30' },
  ],
}

const DAYS = [
  { key: '2', label: 'Segunda' },
  { key: '3', label: 'Terça' },
  { key: '4', label: 'Quarta' },
  { key: '5', label: 'Quinta' },
  { key: '6', label: 'Sexta' },
]

const PERIODS = [
  { key: 'M', label: 'Manhã', slots: TIME_SLOTS.M },
  { key: 'T', label: 'Tarde', slots: TIME_SLOTS.T },
  { key: 'N', label: 'Noite', slots: TIME_SLOTS.N },
]

interface ParsedSchedule {
  day: string // '2', '3', '4', '5', '6'
  period: string // 'M', 'T', 'N'
  slots: string[] // ['1', '2', '3', etc]
}

// Parse schedule like "2M34" -> { day: '2', period: 'M', slots: ['3', '4'] }
function parseSchedule(schedule: string): ParsedSchedule | null {
  if (!schedule || schedule.length < 3) return null
  
  const day = schedule[0] // primeiro char: dia da semana
  const period = schedule[1] // segundo char: período (M/T/N)
  const slots = schedule.slice(2).split('') // resto: slots individuais
  
  if (!['2', '3', '4', '5', '6'].includes(day)) return null
  if (!['M', 'T', 'N'].includes(period.toUpperCase())) return null
  
  return {
    day,
    period: period.toUpperCase(),
    slots,
  }
}

function ScheduleGrid({ disciplines }: ScheduleGridProps) {
  // Organizar disciplinas por dia/período/slot
  const scheduleMap = useMemo(() => {
    const map = new Map<string, DisciplineDto[]>()
    
    disciplines.forEach((discipline) => {
      discipline.disciplineTime.forEach((timeStr: string) => {
        const parsed = parseSchedule(timeStr)
        if (!parsed) return
        
        parsed.slots.forEach((slot) => {
          const key = `${parsed.day}-${parsed.period}-${slot}`
          const existing = map.get(key) || []
          map.set(key, [...existing, discipline])
        })
      })
    })
    
    return map
  }, [disciplines])

  const getDisciplinesForCell = (day: string, period: string, slot: string): DisciplineDto[] => {
    const key = `${day}-${period}-${slot}`
    return scheduleMap.get(key) || []
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-3 sm:p-4 bg-blue-600 text-white">
        <h2 className="text-base sm:text-lg font-bold">📅 Grade Horária</h2>
        <p className="text-xs opacity-90">Suas disciplinas organizadas por horário</p>
      </div>

      {/* Adicionar hint para scroll horizontal em mobile */}
      <div className="bg-gray-50 px-3 py-2 text-xs text-gray-600 sm:hidden border-b">
        💡 Deslize para ver todos os dias →
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs min-w-[600px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-1 text-xs font-semibold text-gray-700 w-16 sm:w-20 sticky left-0 bg-gray-100 z-10">Horário</th>
              {DAYS.map((day) => (
                <th key={day.key} className="border p-1 text-xs font-semibold text-gray-700">
                  <span className="hidden sm:inline">{day.label}</span>
                  <span className="sm:hidden">{day.label.slice(0, 3)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <>
                {/* Cabeçalho do período */}
                <tr key={`${period.key}-header`} className="bg-gray-50">
                  <td colSpan={6} className="border p-1 text-center font-semibold text-gray-700 text-xs">
                    {period.label}
                  </td>
                </tr>
                
                {/* Slots do período */}
                {period.slots.map((timeSlot) => (
                  <tr key={`${period.key}${timeSlot.slot}`} className="hover:bg-gray-50">
                    <td className="border p-1 text-xs text-gray-600 text-center bg-gray-50 sticky left-0 z-10">
                      <div className="font-semibold text-xs">{period.key}{timeSlot.slot}</div>
                      <div className="text-[9px] sm:text-[10px] leading-tight">{timeSlot.time}</div>
                    </td>
                    {DAYS.map((day) => {
                      const disciplinesInCell = getDisciplinesForCell(day.key, period.key, timeSlot.slot)
                      return (
                        <td key={`${day.key}-${period.key}-${timeSlot.slot}`} className="border p-0.5">
                          {disciplinesInCell.length > 0 ? (
                            <div className="space-y-0.5">
                              {disciplinesInCell.map((disc) => (
                                <Link
                                  key={disc.id}
                                  to={`/home/discipline/${disc.id}`}
                                  className="block bg-blue-100 text-blue-800 rounded px-1.5 py-0.5 text-[10px] hover:bg-blue-200 transition-colors cursor-pointer"
                                  title={`${disc.name}\nProfessor: ${disc.teacher.firstName} ${disc.teacher.lastName}\nClique para ver detalhes`}
                                >
                                  <div className="font-semibold truncate leading-tight">{disc.name}</div>
                                  <div className="text-[9px] opacity-75 truncate leading-tight">
                                    {disc.teacher.firstName} {disc.teacher.lastName[0]}.
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="h-8"></div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda */}
      <div className="p-2 bg-gray-50 border-t text-[10px] text-gray-600">
        <p className="font-semibold mb-0.5">📖 Como ler:</p>
        <p><strong>Exemplo:</strong> "2M34" = Segunda-feira (2), Manhã (M), das 10h10 às 12h00 (slots 3 e 4)</p>
      </div>
    </div>
  )
}

export default ScheduleGrid
