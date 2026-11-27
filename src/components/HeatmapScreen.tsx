import { useMemo } from 'react'

import { dateKey, parseDate } from '../data'
import type { Entry, Habit } from '../types'

type Props = {
  habits: Habit[]
  entries: Entry[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

type HabitHeatmapProps = {
  habit: Habit
  entries: Entry[]
  days: Date[]
  selectedDate: string
  onSelectDate: (date: string) => void
}

function yearDays() {
  const end = new Date()
  end.setHours(0, 0, 0, 0)

  const year = end.getFullYear()
  const start = new Date(year, 0, 1)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  end.setFullYear(year, 11, 31)
  end.setDate(end.getDate() + (7 - end.getDay()) % 7)

  const days: Date[] = []
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day))
  }

  return days
}

function focusLabel(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (hours === 0) return `${minutes}m`
  return `${hours}h${remainder ? ` ${remainder}m` : ''}`
}

function HabitHeatmap({
  habit,
  entries,
  days,
  selectedDate,
  onSelectDate,
}: HabitHeatmapProps) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1)
  const nextYearStart = new Date(yearStart.getFullYear() + 1, 0, 1)
  const entriesByDate = new Map<string, Entry[]>()
  for (const entry of entries) {
    const dayEntries = entriesByDate.get(entry.date) ?? []
    dayEntries.push(entry)
    entriesByDate.set(entry.date, dayEntries)
  }

  const activeDates = new Set(entries.map((entry) => entry.date))
  const totalMinutes = entries.reduce((total, entry) => total + entry.minutes, 0)

  return (
    <article
      className="content-card habit-heatmap-card"
      style={{ '--habit-color': habit.color } as React.CSSProperties}
    >
      <div className="habit-heatmap-heading">
        <span className="habit-title">
          <i className="habit-color" style={{ background: habit.color }} />
          {habit.name}
        </span>
        <div className="habit-heatmap-stats">
          <strong>{activeDates.size}</strong> dias <b>·</b> {focusLabel(totalMinutes)}
        </div>
      </div>

      <div className="habit-heatmap-scroll">
        <div className="habit-heatmap-months">
          {days.map((day, index) => {
            if (day < yearStart || day >= nextYearStart) return null
            if (day.getDate() !== 1) return null

            const month = day
              .toLocaleDateString('pt-BR', { month: 'short' })
              .replace('.', '')

            return (
              <span
                key={`${dateKey(day)}-month`}
                style={{ gridColumn: Math.floor(index / 7) + 1 }}
              >
                {month}
              </span>
            )
          })}
        </div>

        <div className="habit-heatmap-cells">
          {days.map((day) => {
            if (day < yearStart || day >= nextYearStart) {
              return <span key={dateKey(day)} className="mini-heat-cell heatmap-placeholder" aria-hidden="true" />
            }
            const key = dateKey(day)
            const dayEntries = entriesByDate.get(key) ?? []
            const minutes = dayEntries.reduce(
              (total, entry) => total + entry.minutes,
              0,
            )
            const dateLabel = parseDate(key).toLocaleDateString('pt-BR')

            return (
              <button
                type="button"
                key={key}
                className={`mini-heat-cell ${minutes > 0 ? 'has-activity' : ''} ${selectedDate === key ? 'heat-selected' : ''}`}
                aria-label={`${key}: ${minutes} minutos`}
                title={`${dateLabel}: ${minutes} min`}
                onClick={() => onSelectDate(key)}
              />
            )
          })}
        </div>
      </div>
    </article>
  )
}

export default function HeatmapScreen({
  habits,
  entries,
  selectedDate,
  onSelectDate,
}: Props) {
  const days = useMemo(yearDays, [])

  return (
    <section className="screen-section heatmap-screen">
      <div className="screen-title-row">
        <h1>Heatmap</h1>
        <span className="heatmap-period">Desde janeiro</span>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">Crie um hábito para ver seu heatmap</div>
      ) : (
        <div className="habit-heatmap-list">
          {habits.map((habit) => (
            <HabitHeatmap
              key={habit.id}
              habit={habit}
              entries={entries.filter((entry) => entry.habitId === habit.id)}
              days={days}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          ))}
        </div>
      )}
    </section>
  )
}
