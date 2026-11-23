import type { Entry, Habit, Store } from './types'

export const STORAGE_KEY = 'ritmo-habit-tracker-v1'
export const habitColors = ['#8b7aff', '#46b8df', '#f0a153', '#f06483', '#52c995', '#e2c34f']
export const starterHabits: Habit[] = [
  { id: 'h1', name: 'Leitura', category: 'Pessoal', color: '#8b7aff' },
  { id: 'h2', name: 'Estudar inglês', category: 'Estudos', color: '#46b8df' },
  { id: 'h3', name: 'Caminhada', category: 'Saúde', color: '#52c995' },
]
export const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
export const shortMonths = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.']
export const weekDays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function todayKey() { return dateKey(new Date()) }
export function parseDate(key: string) { return new Date(`${key}T12:00:00`) }
export function formatDate(key: string) { return parseDate(key).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', weekday: 'long' }) }

function createDemoEntries(): Entry[] {
  const result: Entry[] = []
  const today = new Date()
  for (let offset = 0; offset < 365; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const seed = (offset * 37 + date.getDate() * 13) % 11
    if (seed < 5 && offset !== 0) continue
    for (let n = 0; n < 1 + (seed % 3); n++) {
      const habit = starterHabits[(seed + n * 2 + offset) % starterHabits.length]
      result.push({ id: `demo-${offset}-${n}`, habitId: habit.id, date: dateKey(date), minutes: [15, 20, 25, 30, 40, 50][(seed + n) % 6], note: '' })
    }
  }
  return result
}

export function readStore(): Store {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as Store
  } catch { /* start with sample data */ }
  return { habits: starterHabits, entries: createDemoEntries() }
}

export function calendarDates(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - offset)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}
