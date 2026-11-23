import { useState } from 'react'
import { Activity } from 'lucide-react'

import BottomNav from './components/BottomNav'
import HabitsScreen from './components/HabitsScreen'
import HeatmapScreen from './components/HeatmapScreen'
import TodayScreen from './components/TodayScreen'
import { parseDate, readStore, STORAGE_KEY, todayKey } from './data'
import type { Entry, Habit, Screen, Store } from './types'

function App() {
  const [store, setStore] = useState<Store>(readStore)
  const [screen, setScreen] = useState<Screen>('today')
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const save = (next: Store) => {
    setStore(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const selectedEntries = store.entries.filter(
    (entry) => entry.date === selectedDate,
  )

  const addHabit = (habitData: Omit<Habit, 'id'>) => {
    const alreadyExists = store.habits.some(
      (habit) => habit.name.toLowerCase() === habitData.name.toLowerCase(),
    )

    if (alreadyExists) return false

    const habit = { ...habitData, id: crypto.randomUUID() }
    save({ ...store, habits: [...store.habits, habit] })
    return true
  }

  const addEntry = (entryData: Omit<Entry, 'id'>) => {
    const entry = { ...entryData, id: crypto.randomUUID() }
    const date = parseDate(entry.date)

    setSelectedDate(entry.date)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
    save({ ...store, entries: [...store.entries, entry] })
  }

  const removeEntry = (id: string) => {
    save({
      ...store,
      entries: store.entries.filter((entry) => entry.id !== id),
    })
  }

  const selectHeatmapDate = (date: string) => {
    const selected = parseDate(date)

    setSelectedDate(date)
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    setScreen('today')
  }

  const selectTodayDate = (date: string) => {
    const selected = parseDate(date)

    setSelectedDate(date)
    setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
  }

  const changeMonth = (direction: number) => {
    setMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + direction, 1),
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#home">
          <span className="brand-mark">
            <Activity size={17} />
          </span>
          ritmo<span className="brand-dot">.</span>
        </a>
        <span className="header-date">
          {new Date().toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
      </header>

      <main className="main-content">
        {screen === 'today' && (
          <TodayScreen
            date={selectedDate}
            month={month}
            entries={selectedEntries}
            allEntries={store.entries}
            habits={store.habits}
            onSelectDate={selectTodayDate}
            onMonthChange={changeMonth}
            onRemove={removeEntry}
            onAddActivity={() => setScreen('habits')}
          />
        )}

        {screen === 'heatmap' && (
          <HeatmapScreen
            habits={store.habits}
            entries={store.entries}
            selectedDate={selectedDate}
            onSelectDate={selectHeatmapDate}
          />
        )}

        {screen === 'habits' && (
          <HabitsScreen
            habits={store.habits}
            onAddHabit={addHabit}
            onAddEntry={addEntry}
          />
        )}
      </main>

      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  )
}

export default App
