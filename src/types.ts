export type Habit = {
  id: string
  name: string
  color: string
}

export type Entry = {
  id: string
  habitId: string
  date: string
  minutes: number
  note: string
}

export type Store = {
  habits: Habit[]
  entries: Entry[]
}

export type Screen = 'today' | 'heatmap' | 'activity' | 'habits'
