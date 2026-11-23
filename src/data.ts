import type { Entry, Habit, Store } from './types'

export const STORAGE_KEY = 'ritmo-habit-tracker-v1'

export const habitColors = [
  { name: 'Roxo', value: '#9a7cff' },
  { name: 'Azul', value: '#4ab8f0' },
  { name: 'Verde', value: '#43c985' },
  { name: 'Rosa', value: '#f06f9b' },
  { name: 'Laranja', value: '#f3a44e' },
  { name: 'Amarelo', value: '#e4cb54' },
]

export const starterHabits: Habit[] = [
  { id: 'h1', name: 'Leitura', color: '#43c985' },
  { id: 'h2', name: 'Estudar inglês', color: '#f06f9b' },
  { id: 'h3', name: 'Caminhada', color: '#4ab8f0' },
]

export const monthNames = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function dateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function todayKey() {
  return dateKey(new Date())
}

export function parseDate(key: string) {
  return new Date(`${key}T12:00:00`)
}

export function formatDate(key: string) {
  return parseDate(key).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  })
}

function createDemoEntries(): Entry[] {
  const entries: Entry[] = []
  const today = new Date()
  const sampleMinutes = [15, 20, 25, 30, 40, 50]

  for (let offset = 0; offset < 365; offset += 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - offset,
    )
    const seed = (offset * 37 + date.getDate() * 13) % 11

    if (seed < 5 && offset !== 0) continue

    const count = 1 + (seed % 3)
    for (let index = 0; index < count; index += 1) {
      const habitIndex = (seed + index * 2 + offset) % starterHabits.length
      const habit = starterHabits[habitIndex]
      const minutes = sampleMinutes[(seed + index) % sampleMinutes.length]

      entries.push({
        id: `demo-${offset}-${index}`,
        habitId: habit.id,
        date: dateKey(date),
        minutes,
        note: '',
      })
    }
  }

  return entries
}

export function readStore(): Store {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved) {
      const parsed = JSON.parse(saved) as Store
      const habits = parsed.habits.map((habit, index) => {
        const hasValidColor = habitColors.some(
          (option) => option.value === habit.color,
        )

        return {
          id: habit.id,
          name: habit.name,
          color: hasValidColor
            ? habit.color
            : habitColors[index % habitColors.length].value,
        }
      })

      return { habits, entries: parsed.entries }
    }
  } catch {
    // Start with the sample data if saved data cannot be read.
  }

  return {
    habits: starterHabits,
    entries: createDemoEntries(),
  }
}

export function calendarDates(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (firstDay.getDay() + 6) % 7
  const start = new Date(firstDay)
  start.setDate(firstDay.getDate() - offset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}
