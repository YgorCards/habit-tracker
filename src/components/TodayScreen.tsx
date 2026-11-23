import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react'

import {
  calendarDates,
  dateKey,
  formatDate,
  monthNames,
  parseDate,
  todayKey,
  weekDays,
} from '../data'
import type { Entry, Habit } from '../types'

type Props = {
  date: string
  month: Date
  entries: Entry[]
  allEntries: Entry[]
  habits: Habit[]
  onSelectDate: (date: string) => void
  onMonthChange: (direction: number) => void
  onRemove: (id: string) => void
  onAddActivity: () => void
}

export default function TodayScreen({
  date,
  month,
  entries,
  allEntries,
  habits,
  onSelectDate,
  onMonthChange,
  onRemove,
  onAddActivity,
}: Props) {
  const totalMinutes = entries.reduce((total, entry) => total + entry.minutes, 0)
  const monthGrid = calendarDates(month)
  const daysWithActivity = new Set(allEntries.map((entry) => entry.date))
  const isToday = date === todayKey()

  return (
    <section className="screen-section today-screen">
      <div className="screen-title-row">
        <h1>Hoje</h1>
        <span className="screen-date">
          {isToday
            ? 'Hoje'
            : parseDate(date).toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'short',
              })}
        </span>
      </div>

      <div className="today-stats">
        <article className="stat-card">
          <span>FOCO</span>
          <strong>
            {totalMinutes}
            <small> min</small>
          </strong>
        </article>
        <article className="stat-card">
          <span>ATIVIDADES</span>
          <strong>{entries.length}</strong>
        </article>
      </div>

      <section className="day-activity">
        <div className="list-heading">
          <h2>{isToday ? 'Atividades de hoje' : formatDate(date)}</h2>
          <span>{entries.length}</span>
        </div>

        {entries.length === 0 ? (
          <button type="button" className="empty-state" onClick={onAddActivity}>
            Nenhuma atividade · Registrar
          </button>
        ) : (
          <div className="activity-list">
            {entries.map((entry) => {
              const habit = habits.find((item) => item.id === entry.habitId)

              return (
                <article className="activity-card" key={entry.id}>
                  <div className="activity-card-heading">
                    <span className="activity-name">
                      <i
                        className="habit-color"
                        style={{ background: habit?.color ?? '#9a7cff' }}
                      />
                      <strong>{habit?.name ?? 'Hábito removido'}</strong>
                    </span>
                    <span className="activity-duration">
                      <Clock3 size={15} />
                      {entry.minutes} min
                    </span>
                  </div>

                  {entry.note && <p className="activity-note">{entry.note}</p>}

                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    aria-label="Remover atividade"
                  >
                    ×
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="content-card calendar-card">
        <div className="card-heading">
          <h2>
            {monthNames[month.getMonth()]} <span>{month.getFullYear()}</span>
          </h2>
          <div className="month-controls">
            <button
              type="button"
              aria-label="Mês anterior"
              onClick={() => onMonthChange(-1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => onMonthChange(1)}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        <div className="calendar-grid calendar-weekdays">
          {weekDays.map((day, index) => (
            <span key={`${day}-${index}`}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid calendar-days">
          {monthGrid.map((day, index) => {
            const key = dateKey(day)
            const hasActivity = daysWithActivity.has(key)
            const classes = [
              'calendar-day',
              day.getMonth() !== month.getMonth() && 'outside-month',
              date === key && 'selected-day',
              key === todayKey() && 'is-today',
              hasActivity && 'has-activity',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                type="button"
                key={`${key}-${index}`}
                className={classes}
                onClick={() => onSelectDate(key)}
                aria-label={`${key}${hasActivity ? ', atividade registrada' : ''}`}
                aria-pressed={date === key}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>

        <div className="calendar-key">
          <i /> Dia com atividade
        </div>
        <CalendarDays className="calendar-accent" aria-hidden="true" />
      </section>
    </section>
  )
}
