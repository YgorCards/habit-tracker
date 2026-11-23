import { useState } from 'react'
import { Check, CircleCheck, X } from 'lucide-react'

import { habitColors, todayKey } from '../data'
import type { Entry, Habit } from '../types'

type Props = {
  habits: Habit[]
  onAddHabit: (habit: Omit<Habit, 'id'>) => boolean
  onAddEntry: (entry: Omit<Entry, 'id'>) => void
}

export default function HabitsScreen({ habits, onAddHabit, onAddEntry }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(habitColors[0].value)
  const [habitError, setHabitError] = useState('')
  const [entryHabit, setEntryHabit] = useState('')
  const [entryDate, setEntryDate] = useState(todayKey())
  const [minutes, setMinutes] = useState('25')
  const [note, setNote] = useState('')
  const [confirmation, setConfirmation] = useState('')

  const submitHabit = (event: React.FormEvent) => {
    event.preventDefault()

    const trimmedName = name.trim()
    if (!trimmedName) {
      setHabitError('Informe o nome do hábito.')
      return
    }

    const alreadyExists = habits.some(
      (habit) => habit.name.toLowerCase() === trimmedName.toLowerCase(),
    )
    if (alreadyExists) {
      setHabitError('Esse hábito já existe.')
      return
    }

    const created = onAddHabit({ name: trimmedName, color })
    if (!created) return

    setName('')
    setHabitError('')
    setConfirmation('Hábito criado!')
  }

  const submitEntry = (event: React.FormEvent) => {
    event.preventDefault()

    const duration = Number(minutes)
    const selectedHabit = entryHabit || habits[0]?.id
    if (!selectedHabit || !entryDate || !Number.isFinite(duration) || duration < 1) {
      return
    }

    onAddEntry({
      habitId: selectedHabit,
      date: entryDate,
      minutes: duration,
      note: note.trim(),
    })
    setNote('')
    setMinutes('25')
    setConfirmation('Atividade salva!')
  }

  return (
    <section className="screen-section habits-screen">
      <div className="screen-title-row">
        <h1>Hábitos</h1>
      </div>

      <section className="content-card create-habit-card">
        <form className="inline-form" onSubmit={submitHabit}>
          <label className="field-label">
            Nome
            <input
              autoComplete="off"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setHabitError('')
              }}
              placeholder="Ex.: Meditar"
              maxLength={36}
            />
          </label>

          <fieldset className="color-picker">
            <legend>Cor</legend>
            <div className="color-options">
              {habitColors.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`color-option ${color === option.value ? 'color-selected' : ''}`}
                  style={{ '--swatch': option.value } as React.CSSProperties}
                  onClick={() => setColor(option.value)}
                  aria-label={option.name}
                  aria-pressed={color === option.value}
                  title={option.name}
                >
                  <span />
                </button>
              ))}
            </div>
          </fieldset>

          {habitError && <p className="form-error">{habitError}</p>}
          <button className="primary-button" type="submit">
            Criar hábito
          </button>
        </form>
      </section>

      <section className="content-card add-activity-card">
        <div className="form-section-title">Registrar atividade</div>
        {habits.length === 0 ? (
          <p className="form-hint">Crie um hábito para começar.</p>
        ) : (
          <form className="inline-form activity-form" onSubmit={submitEntry}>
            <label className="field-label">
              Hábito
              <select
                value={entryHabit || habits[0]?.id}
                onChange={(event) => setEntryHabit(event.target.value)}
              >
                {habits.map((habit) => (
                  <option key={habit.id} value={habit.id}>
                    {habit.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="form-columns">
              <label className="field-label">
                Data
                <input
                  type="date"
                  value={entryDate}
                  onChange={(event) => setEntryDate(event.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                Minutos
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={minutes}
                  onChange={(event) => setMinutes(event.target.value)}
                  required
                />
              </label>
            </div>

            <label className="field-label">
              Nota <span className="optional">opcional</span>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Adicionar nota"
                maxLength={120}
              />
            </label>

            <button className="primary-button" type="submit">
              <Check size={16} />
              Salvar atividade
            </button>
          </form>
        )}
      </section>

      {confirmation && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmation('')
          }}
        >
          <section
            className="success-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="success-title"
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setConfirmation('')}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
            <span className="success-icon">
              <CircleCheck size={30} />
            </span>
            <h2 id="success-title">{confirmation}</h2>
            <button
              type="button"
              className="primary-button"
              onClick={() => setConfirmation('')}
            >
              Continuar
            </button>
          </section>
        </div>
      )}
    </section>
  )
}
