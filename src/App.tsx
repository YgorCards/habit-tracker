import { useMemo, useState } from 'react'
import { Activity, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Plus, X } from 'lucide-react'
import BottomNav from './components/BottomNav'
import { calendarDates, dateKey, formatDate, habitColors, monthNames, parseDate, readStore, shortMonths, STORAGE_KEY, todayKey, weekDays } from './data'
import type { Entry, Screen, Store } from './types'

function App() {
  const [store, setStore] = useState<Store>(readStore)
  const [screen, setScreen] = useState<Screen>('today')
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [heatFilter, setHeatFilter] = useState('all')
  const [habitName, setHabitName] = useState('')
  const [category, setCategory] = useState('Pessoal')
  const [habitError, setHabitError] = useState('')
  const [entryHabit, setEntryHabit] = useState('')
  const [entryDate, setEntryDate] = useState(todayKey())
  const [minutes, setMinutes] = useState('25')
  const [note, setNote] = useState('')

  const save = (next: Store) => {
    setStore(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const selectedEntries = store.entries.filter((entry) => entry.date === selectedDate)
  const selectedMinutes = selectedEntries.reduce((total, entry) => total + entry.minutes, 0)
  const monthGrid = useMemo(() => calendarDates(month), [month])
  const heatDays = useMemo(() => {
    const end = new Date(); end.setHours(0, 0, 0, 0)
    const start = new Date(end); start.setDate(start.getDate() - 363); start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    const days: { date: Date; key: string; minutes: number; count: number }[] = []
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const key = dateKey(date)
      const entries = store.entries.filter((entry) => entry.date === key && (heatFilter === 'all' || entry.habitId === heatFilter))
      days.push({ date: new Date(date), key, count: entries.length, minutes: entries.reduce((total, entry) => total + entry.minutes, 0) })
    }
    return days
  }, [store.entries, heatFilter])
  const filteredEntries = heatFilter === 'all' ? store.entries : store.entries.filter((entry) => entry.habitId === heatFilter)
  const activeDays = new Set(filteredEntries.map((entry) => entry.date)).size

  const addHabit = (event: React.FormEvent) => {
    event.preventDefault()
    const name = habitName.trim()
    if (!name) { setHabitError('Informe um nome.'); return }
    if (store.habits.some((habit) => habit.name.toLowerCase() === name.toLowerCase())) { setHabitError('Esse hábito já existe.'); return }
    const habit = { id: crypto.randomUUID(), name, category: category.trim() || 'Pessoal', color: habitColors[store.habits.length % habitColors.length] }
    save({ ...store, habits: [...store.habits, habit] })
    setHabitName(''); setCategory('Pessoal'); setHabitError('')
  }

  const addEntry = (event: React.FormEvent) => {
    event.preventDefault()
    const duration = Number(minutes)
    const selectedHabit = entryHabit || store.habits[0]?.id
    if (!selectedHabit || !entryDate || !Number.isFinite(duration) || duration < 1) return
    const entry: Entry = { id: crypto.randomUUID(), habitId: selectedHabit, date: entryDate, minutes: duration, note: note.trim() }
    save({ ...store, entries: [...store.entries, entry] })
    setSelectedDate(entryDate); setMonth(new Date(parseDate(entryDate).getFullYear(), parseDate(entryDate).getMonth(), 1))
    setMinutes('25'); setNote(''); setScreen('today')
  }

  const removeEntry = (id: string) => save({ ...store, entries: store.entries.filter((entry) => entry.id !== id) })
  const shiftMonth = (direction: number) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1))
  const selectCalendarDay = (date: Date) => { const key = dateKey(date); setSelectedDate(key); if (date.getMonth() !== month.getMonth()) setMonth(new Date(date.getFullYear(), date.getMonth(), 1)) }

  return <div className="app-shell">
    <header className="app-header"><a className="brand" href="#home"><span className="brand-mark"><Activity size={17} /></span>ritmo<span className="brand-dot">.</span></a><span className="header-date">{new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span></header>

    <main className="main-content">
      {screen === 'today' && <section className="screen-section">
        <div className="screen-title-row"><h1>Hoje</h1><span className="screen-date">{selectedDate === todayKey() ? 'Hoje' : parseDate(selectedDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span></div>
        <div className="today-stats"><article className="stat-card"><span>FOCO</span><strong>{selectedMinutes}<small> min</small></strong></article><article className="stat-card"><span>ATIVIDADES</span><strong>{selectedEntries.length}</strong></article></div>
        <section className="content-card calendar-card">
          <div className="card-heading"><h2>{monthNames[month.getMonth()]} <span>{month.getFullYear()}</span></h2><div className="month-controls"><button type="button" aria-label="Mês anterior" onClick={() => shiftMonth(-1)}><ChevronLeft size={17} /></button><button type="button" aria-label="Próximo mês" onClick={() => shiftMonth(1)}><ChevronRight size={17} /></button></div></div>
          <div className="calendar-grid calendar-weekdays">{weekDays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="calendar-grid calendar-days">{monthGrid.map((date, index) => { const key = dateKey(date); const hasActivity = store.entries.some((entry) => entry.date === key); return <button type="button" key={`${key}-${index}`} className={`calendar-day ${date.getMonth() !== month.getMonth() ? 'outside-month' : ''} ${selectedDate === key ? 'selected-day' : ''} ${key === todayKey() ? 'is-today' : ''} ${hasActivity ? 'has-activity' : ''}`} onClick={() => selectCalendarDay(date)} aria-label={`${key}${hasActivity ? ', atividade registrada' : ''}`} aria-pressed={selectedDate === key}>{date.getDate()}</button> })}</div>
        </section>
        <section className="day-activity"><div className="list-heading"><h2>{selectedDate === todayKey() ? 'Atividades' : formatDate(selectedDate)}</h2><span>{selectedEntries.length}</span></div>
          {selectedEntries.length === 0 ? <div className="empty-state">Nenhuma atividade registrada</div> : <div className="activity-list">{selectedEntries.map((entry) => { const habit = store.habits.find((item) => item.id === entry.habitId); return <article className="activity-row" key={entry.id}><i className="habit-color" style={{ background: habit?.color ?? '#8b7aff' }} /><div className="activity-name"><strong>{habit?.name ?? 'Hábito removido'}</strong>{entry.note && <small>{entry.note}</small>}</div><span className="activity-duration"><Clock3 size={14} />{entry.minutes} min</span><button className="remove-button" type="button" onClick={() => removeEntry(entry.id)} aria-label="Remover atividade"><X size={14} /></button></article> })}</div>}
        </section>
      </section>}

      {screen === 'heatmap' && <section className="screen-section">
        <div className="screen-title-row"><h1>Heatmap</h1><label className="compact-select"><span className="sr-only">Filtrar hábitos</span><select value={heatFilter} onChange={(event) => setHeatFilter(event.target.value)}><option value="all">Todos</option>{store.habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}</select><ChevronDown size={14} /></label></div>
        <div className="heat-summary"><strong>{activeDays}</strong><span>dias ativos</span><span className="heat-legend"><i /> menos <i /><i /><i /><i /> mais</span></div>
        <section className="content-card heatmap-card"><div className="heatmap-scroll"><div className="heat-months"><span>seg.</span>{heatDays.map((day, index) => (day.date.getDate() === 1 || index === 0) ? <span key={`m-${day.key}`} style={{ gridColumn: index + 2 }}>{shortMonths[day.date.getMonth()]}</span> : null)}</div><div className="heatmap-matrix"><div className="heat-weekdays"><span>S</span><span>Q</span><span>S</span></div><div className="heatmap-cells">{heatDays.map((day) => { const level = day.minutes === 0 ? 0 : day.minutes < 30 ? 1 : day.minutes < 60 ? 2 : day.minutes < 100 ? 3 : 4; const accent = store.habits.find((habit) => habit.id === heatFilter)?.color ?? '#718aff'; return <button key={day.key} type="button" className={`heat-cell heat-${level} ${selectedDate === day.key ? 'heat-selected' : ''}`} style={{ '--heat-accent': accent } as React.CSSProperties} title={`${parseDate(day.key).toLocaleDateString('pt-BR')}: ${day.count} atividades · ${day.minutes} min`} aria-label={`${day.key}: ${day.count} atividades, ${day.minutes} minutos`} onClick={() => { setSelectedDate(day.key); setScreen('today') }} /> })}</div></div></div></section>
        <div className="heat-detail"><CalendarDays size={16} /><span>Toque em um dia para ver as atividades</span></div>
      </section>}

      {screen === 'habits' && <section className="screen-section">
        <div className="screen-title-row"><h1>Hábitos</h1><span className="habit-total">{store.habits.length}</span></div>
        <section className="content-card habit-section"><div className="card-heading"><h2>Seus hábitos</h2></div>
          {store.habits.length === 0 ? <div className="empty-state">Crie seu primeiro hábito</div> : <div className="habit-list">{store.habits.map((habit) => <article className="habit-row" key={habit.id}><i className="habit-color" style={{ background: habit.color }} /><div className="habit-name"><strong>{habit.name}</strong><small>{habit.category}</small></div><span className="habit-total-min">{store.entries.filter((entry) => entry.habitId === habit.id).reduce((total, entry) => total + entry.minutes, 0)} min</span></article>)}</div>}
          <form className="inline-form" onSubmit={addHabit}><h3><Plus size={16} /> Novo hábito</h3><label className="field-label">Nome<input value={habitName} onChange={(event) => { setHabitName(event.target.value); setHabitError('') }} placeholder="Ex.: Meditar" maxLength={36} /></label><label className="field-label">Categoria<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Ex.: Bem-estar" maxLength={24} /></label>{habitError && <p className="form-error">{habitError}</p>}<button className="primary-button" type="submit">Criar hábito</button></form>
        </section>
        <section className="content-card add-activity-card"><div className="card-heading"><h2>Registrar atividade</h2></div>{store.habits.length === 0 ? <p className="form-hint">Crie um hábito para começar.</p> : <form className="inline-form activity-form" onSubmit={addEntry}><label className="field-label">Hábito<select value={entryHabit || store.habits[0]?.id} onChange={(event) => setEntryHabit(event.target.value)}>{store.habits.map((habit) => <option key={habit.id} value={habit.id}>{habit.name}</option>)}</select></label><div className="form-columns"><label className="field-label">Data<input type="date" value={entryDate} onChange={(event) => setEntryDate(event.target.value)} required /></label><label className="field-label">Minutos<input type="number" min="1" max="1440" value={minutes} onChange={(event) => setMinutes(event.target.value)} required /></label></div><label className="field-label">Nota <span className="optional">opcional</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Adicionar nota" maxLength={120} /></label><button className="primary-button" type="submit"><Check size={16} /> Salvar atividade</button></form>}</section>
      </section>}
    </main>
    <BottomNav screen={screen} onChange={setScreen} />
  </div>
}

export default App
