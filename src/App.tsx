import { useEffect, useState } from 'react'
import { Activity, LogOut } from 'lucide-react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

import BottomNav from './components/BottomNav'
import HabitsScreen from './components/HabitsScreen'
import HeatmapScreen from './components/HeatmapScreen'
import SignInScreen from './components/SignInScreen'
import TodayScreen from './components/TodayScreen'
import { auth, googleProvider } from './firebase'
import { parseDate, todayKey } from './data'
import {
  createActivity,
  createHabit,
  deleteActivity,
  saveUserProfile,
  subscribeToUserData,
} from './services/firestore'
import type { Entry, Habit, Screen, Store } from './types'

const EMPTY_STORE: Store = { habits: [], entries: [] }

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Ocorreu um erro inesperado.'

  if ('code' in error && error.code === 'auth/unauthorized-domain') {
    return 'Este domínio não está autorizado no Firebase Authentication.'
  }

  if ('code' in error && error.code === 'auth/operation-not-allowed') {
    return 'Ative o login com Google no Firebase Authentication.'
  }

  if ('code' in error && error.code === 'permission-denied') {
    return 'O Firestore recusou o acesso. Confira as regras de segurança.'
  }

  return error.message
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [signInBusy, setSignInBusy] = useState(false)
  const [signInError, setSignInError] = useState('')
  const [store, setStore] = useState<Store>(EMPTY_STORE)
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [screen, setScreen] = useState<Screen>('today')
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
      setSignInError('')

      if (!currentUser) {
        setStore(EMPTY_STORE)
        setDataLoading(false)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) {
      setProfileError('')
      return
    }

    let isActive = true
    const displayName = (
      user.displayName || user.email?.split('@')[0] || 'Usuário'
    ).trim()

    setProfileError('')
    void saveUserProfile(user.uid, displayName).catch((error: unknown) => {
      if (isActive) setProfileError(getErrorMessage(error))
    })

    return () => {
      isActive = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    setStore(EMPTY_STORE)
    setDataLoading(true)
    setDataError('')

    return subscribeToUserData(
      user.uid,
      (nextStore) => {
        setStore(nextStore)
        setDataLoading(false)
        setDataError('')
      },
      (error) => {
        setDataLoading(false)
        setDataError(getErrorMessage(error))
      },
    )
  }, [user])

  const selectedEntries = store.entries.filter(
    (entry) => entry.date === selectedDate,
  )

  const handleGoogleSignIn = async () => {
    setSignInBusy(true)
    setSignInError('')

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      setSignInError(getErrorMessage(error))
    } finally {
      setSignInBusy(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setScreen('today')
    } catch (error) {
      setDataError(getErrorMessage(error))
    }
  }

  const handleAddHabit = async (habitData: Omit<Habit, 'id'>) => {
    if (!user) return false

    const alreadyExists = store.habits.some(
      (habit) => habit.name.toLowerCase() === habitData.name.toLowerCase(),
    )
    if (alreadyExists) return false

    await createHabit(user.uid, habitData)
    return true
  }

  const handleAddEntry = async (entryData: Omit<Entry, 'id'>) => {
    if (!user) throw new Error('Entre novamente para salvar a atividade.')

    await createActivity(user.uid, entryData)
    const date = parseDate(entryData.date)
    setSelectedDate(entryData.date)
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1))
  }

  const handleRemoveEntry = async (id: string) => {
    if (!user) return

    try {
      await deleteActivity(user.uid, id)
    } catch (error) {
      setDataError(getErrorMessage(error))
    }
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

  if (authLoading) {
    return <main className="app-loading">Carregando…</main>
  }

  if (!user) {
    return (
      <SignInScreen
        busy={signInBusy}
        error={signInError}
        onSignIn={handleGoogleSignIn}
      />
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
        <div className="user-controls">
          <span className="header-date">
            {user.displayName || user.email || 'Conta conectada'}
          </span>
          <button
            type="button"
            className="sign-out-button"
            onClick={handleSignOut}
            aria-label="Sair da conta"
            title="Sair"
          >
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {(dataError || profileError) && (
          <div className="data-error" role="alert">
            {dataError || profileError}
          </div>
        )}

        {dataLoading ? (
          <div className="app-loading inline-loading">Carregando seus dados…</div>
        ) : (
          <>
            {screen === 'today' && (
              <TodayScreen
                date={selectedDate}
                month={month}
                entries={selectedEntries}
                allEntries={store.entries}
                habits={store.habits}
                onSelectDate={selectTodayDate}
                onMonthChange={changeMonth}
                onRemove={handleRemoveEntry}
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
                onAddHabit={handleAddHabit}
                onAddEntry={handleAddEntry}
              />
            )}
          </>
        )}
      </main>

      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  )
}

export default App
