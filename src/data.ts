export const habitColors = [
  { name: 'Roxo', value: '#9a7cff' },
  { name: 'Azul', value: '#4ab8f0' },
  { name: 'Verde', value: '#43c985' },
  { name: 'Rosa', value: '#f06f9b' },
  { name: 'Laranja', value: '#f3a44e' },
  { name: 'Amarelo', value: '#e4cb54' },
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
