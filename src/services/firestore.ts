import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'

import { db } from '../firebase'
import type { Entry, Habit, Store } from '../types'

function userCollection(uid: string, collectionName: 'habits' | 'activities') {
  return collection(db, 'users', uid, collectionName)
}

function readHabits(documents: DocumentData[]): Habit[] {
  return documents.flatMap((data) => {
    if (typeof data.id !== 'string' || typeof data.name !== 'string') return []

    return [{
      id: data.id,
      name: data.name,
      color: typeof data.color === 'string' ? data.color : '#9a7cff',
    }]
  })
}

function readActivities(documents: DocumentData[]): Entry[] {
  return documents.flatMap((data) => {
    if (
      typeof data.id !== 'string' ||
      typeof data.habitId !== 'string' ||
      typeof data.date !== 'string'
    ) {
      return []
    }

    return [{
      id: data.id,
      habitId: data.habitId,
      date: data.date,
      minutes: Number(data.minutes) || 0,
      note: typeof data.note === 'string' ? data.note : '',
    }]
  })
}

export function subscribeToUserData(
  uid: string,
  onData: (store: Store) => void,
  onError: (error: Error) => void,
) {
  let habits: Habit[] = []
  let entries: Entry[] = []
  let receivedHabits = false
  let receivedActivities = false

  const publishData = () => {
    if (receivedHabits && receivedActivities) {
      onData({ habits, entries })
    }
  }

  const unsubscribeHabits = onSnapshot(
    userCollection(uid, 'habits'),
    (snapshot) => {
      habits = readHabits(
        snapshot.docs.map((document) => ({ ...document.data(), id: document.id })),
      )
      receivedHabits = true
      publishData()
    },
    onError,
  )

  const unsubscribeActivities = onSnapshot(
    userCollection(uid, 'activities'),
    (snapshot) => {
      entries = readActivities(
        snapshot.docs.map((document) => ({ ...document.data(), id: document.id })),
      )
      receivedActivities = true
      publishData()
    },
    onError,
  )

  return () => {
    unsubscribeHabits()
    unsubscribeActivities()
  }
}

export async function createHabit(
  uid: string,
  habit: Omit<Habit, 'id'>,
) {
  const reference = await addDoc(userCollection(uid, 'habits'), {
    ...habit,
    createdAt: serverTimestamp(),
  })

  return { ...habit, id: reference.id }
}

export async function createActivity(
  uid: string,
  entry: Omit<Entry, 'id'>,
) {
  const reference = await addDoc(userCollection(uid, 'activities'), {
    ...entry,
    createdAt: serverTimestamp(),
  })

  return { ...entry, id: reference.id }
}

export function deleteActivity(uid: string, activityId: string) {
  return deleteDoc(doc(db, 'users', uid, 'activities', activityId))
}

export function saveUserProfile(uid: string, displayName: string) {
  return setDoc(doc(db, 'users', uid), { displayName }, { merge: true })
}
