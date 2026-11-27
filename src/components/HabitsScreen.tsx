import { useEffect, useState } from 'react'
import {
  ArrowDownUp,
  Check,
  CircleCheck,
  Clock3,
  Play,
  Square,
  X,
} from 'lucide-react'

import { habitColors, todayKey } from '../data'
import type { Entry, Habit } from '../types'

type Props = {
  mode: 'activity' | 'habits'
  uid: string
  habits: Habit[]
  onAddHabit: (habit: Omit<Habit, 'id'>) => Promise<boolean>
  onAddEntry: (entry: Omit<Entry, 'id'>) => Promise<void>
}

type TimerSession = {
  uid: string
  habitId: string
  date: string
  startedAt: number
  stoppedAt?: number
  note: string
}

type DurationUnit = 'minutes' | 'hours'
type ActivityMode = 'manual' | 'timer'

function timerStorageKey(uid: string) {
  return `ritmo-active-timer:${uid}`
}

function readTimerSession(uid: string): TimerSession | null {
  try {
    const stored = localStorage.getItem(timerStorageKey(uid))
    if (!stored) return null

    const session = JSON.parse(stored) as TimerSession
    if (
      session.uid !== uid ||
      typeof session.habitId !== 'string' ||
      typeof session.date !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(session.date) ||
      !Number.isFinite(session.startedAt) ||
      (session.stoppedAt !== undefined && !Number.isFinite(session.stoppedAt)) ||
      typeof session.note !== 'string'
    ) {
      return null
    }

    return session
  } catch {
    return null
  }
}

function formatElapsed(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, '0'))
    .join(':')
}

export default function HabitsScreen({ mode, uid, habits, onAddHabit, onAddEntry }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(habitColors[0].value)
  const [habitError, setHabitError] = useState('')
  const [entryHabit, setEntryHabit] = useState('')
  const [entryDate, setEntryDate] = useState(todayKey())
  const [duration, setDuration] = useState('25')
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('minutes')
  const [note, setNote] = useState('')
  const [activityMode, setActivityMode] = useState<ActivityMode>(() =>
    readTimerSession(uid) ? 'timer' : 'manual',
  )
  const [timerSession, setTimerSession] = useState<TimerSession | null>(() =>
    readTimerSession(uid),
  )
  const [timerNow, setTimerNow] = useState(Date.now())
  const [confirmation, setConfirmation] = useState('')
  const [entryError, setEntryError] = useState('')
  const [timerError, setTimerError] = useState('')
  const [savingHabit, setSavingHabit] = useState(false)
  const [savingEntry, setSavingEntry] = useState(false)
  const [savingTimer, setSavingTimer] = useState(false)

  const timerIsRunning = Boolean(timerSession && !timerSession.stoppedAt)

  useEffect(() => {
    const key = timerStorageKey(uid)

    if (timerSession) {
      localStorage.setItem(key, JSON.stringify(timerSession))
    } else {
      localStorage.removeItem(key)
    }
  }, [timerSession, uid])

  useEffect(() => {
    if (!timerIsRunning) return

    const updateTimer = () => setTimerNow(Date.now())
    updateTimer()

    const interval = window.setInterval(updateTimer, 1000)
    document.addEventListener('visibilitychange', updateTimer)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', updateTimer)
    }
  }, [timerIsRunning])

  const submitHabit = async (event: React.FormEvent) => {
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

    try {
      setSavingHabit(true)
      const created = await onAddHabit({ name: trimmedName, color })
      if (!created) {
        setHabitError('Esse hábito já existe.')
        return
      }

      setName('')
      setHabitError('')
      setConfirmation('Hábito criado!')
    } catch {
      setHabitError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSavingHabit(false)
    }
  }

  const saveManualActivity = async (event: React.FormEvent) => {
    event.preventDefault()

    const value = Number(duration)
    const minutes =
      durationUnit === 'hours' ? Math.round(value * 60) : Math.round(value)
    const selectedHabit = entryHabit || habits[0]?.id

    if (
      !selectedHabit ||
      !entryDate ||
      !Number.isFinite(minutes) ||
      minutes < 1 ||
      minutes > 1440
    ) {
      setEntryError('Informe um tempo entre 1 minuto e 24 horas.')
      return
    }

    try {
      setSavingEntry(true)
      await onAddEntry({
        habitId: selectedHabit,
        date: entryDate,
        minutes,
        note: note.trim(),
      })
      setNote('')
      setDuration('25')
      setDurationUnit('minutes')
      setEntryError('')
      setConfirmation('Atividade salva!')
    } catch {
      setEntryError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSavingEntry(false)
    }
  }

  const toggleDurationUnit = () => {
    const value = Number(duration)

    if (Number.isFinite(value)) {
      if (durationUnit === 'minutes') {
        setDuration(String(Number((value / 60).toFixed(2))))
        setDurationUnit('hours')
      } else {
        setDuration(String(Math.round(value * 60)))
        setDurationUnit('minutes')
      }
    } else {
      setDurationUnit(durationUnit === 'minutes' ? 'hours' : 'minutes')
    }

    setEntryError('')
  }

  const startTimer = () => {
    const selectedHabit = entryHabit || habits[0]?.id
    if (!selectedHabit) return

    setTimerSession({
      uid,
      habitId: selectedHabit,
      date: entryDate,
      startedAt: Date.now(),
      note: note.trim(),
    })
    setTimerNow(Date.now())
    setActivityMode('timer')
    setTimerError('')
  }

  const saveTimerActivity = async () => {
    if (!timerSession) return

    const stoppedAt = timerSession.stoppedAt ?? Date.now()
    const stoppedSession = { ...timerSession, stoppedAt }
    const elapsedSeconds = Math.max(
      0,
      Math.floor((stoppedAt - stoppedSession.startedAt) / 1000),
    )
    const minutes = Math.max(1, Math.round(elapsedSeconds / 60))

    setTimerSession(stoppedSession)
    setTimerError('')

    if (minutes > 1440) {
      setTimerError('O cronômetro passou de 24 horas. Descarte-o e registre o tempo manualmente.')
      return
    }

    try {
      setSavingTimer(true)
      await onAddEntry({
        habitId: stoppedSession.habitId,
        date: stoppedSession.date,
        minutes,
        note: stoppedSession.note.trim(),
      })
      setTimerSession(null)
      setNote('')
      setTimerError('')
      setConfirmation('Atividade salva!')
    } catch {
      setTimerError('Não foi possível salvar. Tente novamente.')
    } finally {
      setSavingTimer(false)
    }
  }

  const stopTimer = () => {
    if (!timerSession) return

    setTimerSession({ ...timerSession, stoppedAt: Date.now() })
    setTimerNow(Date.now())
    setTimerError('')
  }

  const discardTimer = () => {
    setTimerSession(null)
    setTimerError('')
  }

  const updateTimerNote = (value: string) => {
    if (timerSession) {
      setTimerSession({ ...timerSession, note: value })
    } else {
      setNote(value)
    }
  }

  const elapsedSeconds = timerSession
    ? Math.max(
        0,
        Math.floor(
          ((timerSession.stoppedAt ?? timerNow) - timerSession.startedAt) / 1000,
        ),
      )
    : 0
  const timerHabit = habits.find((habit) => habit.id === timerSession?.habitId)

  return (
    <section className="screen-section habits-screen">
      <div className="screen-title-row">
        <h1>{mode === 'activity' ? 'Atividade' : 'Hábitos'}</h1>
      </div>

      {mode === 'habits' && (
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
          <button className="primary-button" type="submit" disabled={savingHabit}>
            {savingHabit ? 'Salvando…' : 'Criar hábito'}
          </button>
        </form>
      </section>
      )}

      {mode === 'activity' && (
      <section className="content-card add-activity-card">
        <div className="form-section-title">Registrar atividade</div>
        {habits.length === 0 ? (
          <p className="form-hint">Crie um hábito para começar.</p>
        ) : (
          <form className="inline-form activity-form" onSubmit={saveManualActivity}>
            <div className="activity-mode-switch" role="group" aria-label="Como adicionar o tempo">
              <button
                type="button"
                className={activityMode === 'manual' ? 'mode-selected' : ''}
                onClick={() => setActivityMode('manual')}
                disabled={Boolean(timerSession)}
                aria-pressed={activityMode === 'manual'}
              >
                Manual
              </button>
              <button
                type="button"
                className={activityMode === 'timer' ? 'mode-selected' : ''}
                onClick={() => setActivityMode('timer')}
                aria-pressed={activityMode === 'timer'}
              >
                <Clock3 size={15} />
                Cronômetro
              </button>
            </div>

            {activityMode === 'manual' ? (
              <>
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
                    Tempo
                    <span className="duration-input-row">
                      <input
                        type="number"
                        min={durationUnit === 'hours' ? '0.02' : '1'}
                        max={durationUnit === 'hours' ? '24' : '1440'}
                        step={durationUnit === 'hours' ? '0.01' : '1'}
                        value={duration}
                        onChange={(event) => setDuration(event.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="unit-toggle"
                        onClick={toggleDurationUnit}
                        aria-label={`Trocar para ${durationUnit === 'minutes' ? 'horas' : 'minutos'}`}
                        title={`Trocar para ${durationUnit === 'minutes' ? 'horas' : 'minutos'}`}
                      >
                        <ArrowDownUp size={16} />
                        {durationUnit === 'minutes' ? 'min' : 'h'}
                      </button>
                    </span>
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

                {entryError && <p className="form-error">{entryError}</p>}

                <button className="primary-button" type="submit" disabled={savingEntry}>
                  <Check size={16} />
                  {savingEntry ? 'Salvando…' : 'Salvar atividade'}
                </button>
              </>
            ) : (
              <>
                {!timerSession ? (
                  <>
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

                    <label className="field-label">
                      Data
                      <input
                        type="date"
                        value={entryDate}
                        onChange={(event) => setEntryDate(event.target.value)}
                        required
                      />
                    </label>
                  </>
                ) : (
                  <div className="timer-context">
                    <strong>{timerHabit?.name ?? 'Hábito indisponível'}</strong>
                    <span>{timerSession.date}</span>
                  </div>
                )}

                <div className={`timer-display ${timerSession?.stoppedAt ? 'timer-stopped' : ''}`}>
                  <Clock3 size={20} />
                  <strong>{formatElapsed(elapsedSeconds)}</strong>
                </div>

                <label className="field-label">
                  Nota <span className="optional">opcional</span>
                  <input
                    value={timerSession?.note ?? note}
                    onChange={(event) => updateTimerNote(event.target.value)}
                    placeholder="Adicionar nota"
                    maxLength={120}
                  />
                </label>

                {timerError && <p className="form-error">{timerError}</p>}

                {timerSession?.stoppedAt ? (
                  <div className="timer-actions">
                    <button
                      className="primary-button"
                      type="button"
                      onClick={saveTimerActivity}
                      disabled={savingTimer}
                    >
                      <Check size={16} />
                      {savingTimer ? 'Salvando…' : 'Salvar atividade'}
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={discardTimer}
                      disabled={savingTimer}
                    >
                      Descartar
                    </button>
                  </div>
                ) : timerSession ? (
                  <div className="timer-actions">
                    <button
                      className="primary-button timer-stop-button"
                      type="button"
                      onClick={stopTimer}
                    >
                      <Square size={15} />
                      Parar cronômetro
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={discardTimer}
                    >
                      Descartar
                    </button>
                  </div>
                ) : (
                  <button className="primary-button" type="button" onClick={startTimer}>
                    <Play size={16} />
                    Iniciar cronômetro
                  </button>
                )}
              </>
            )}
          </form>
        )}
      </section>
      )}

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
