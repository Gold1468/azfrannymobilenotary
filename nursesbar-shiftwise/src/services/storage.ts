import { openDB, type IDBPDatabase, type DBSchema } from 'idb'
import type { Patient, SBAR, Task, PatientSnapshot, UserSettings } from '@/models/types'

interface ShiftWiseDB extends DBSchema {
  patients: { key: string; value: Patient; indexes: { 'by-room': string } }
  sbars: { key: string; value: SBAR; indexes: { 'by-patient': string } }
  tasks: { key: string; value: Task; indexes: { 'by-patient': string; 'by-time': string } }
  snapshots: { key: string; value: PatientSnapshot; indexes: { 'by-patient': string } }
  settings: { key: string; value: { key: string; data: UserSettings } }
}

const DB_NAME = 'shiftwise-db'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<ShiftWiseDB> | null = null

export async function getDB(): Promise<IDBPDatabase<ShiftWiseDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<ShiftWiseDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const patients = db.createObjectStore('patients', { keyPath: 'id' })
      patients.createIndex('by-room', 'room')

      const sbars = db.createObjectStore('sbars', { keyPath: 'id' })
      sbars.createIndex('by-patient', 'patientId')

      const tasks = db.createObjectStore('tasks', { keyPath: 'id' })
      tasks.createIndex('by-patient', 'patientId')
      tasks.createIndex('by-time', 'time')

      const snapshots = db.createObjectStore('snapshots', { keyPath: 'id' })
      snapshots.createIndex('by-patient', 'patientId')

      db.createObjectStore('settings', { keyPath: 'key' })
    },
  })
  return dbInstance
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function savePatient(patient: Patient): Promise<void> {
  const db = await getDB()
  await db.put('patients', patient)
}

export async function getPatients(): Promise<Patient[]> {
  const db = await getDB()
  return db.getAll('patients')
}

export async function getPatient(id: string): Promise<Patient | undefined> {
  const db = await getDB()
  return db.get('patients', id)
}

export async function deletePatient(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['patients', 'sbars', 'tasks', 'snapshots'], 'readwrite')
  await tx.objectStore('patients').delete(id)

  // Cascade delete
  const sbarStore = tx.objectStore('sbars')
  const sbarsForPatient = await sbarStore.index('by-patient').getAll(id)
  for (const s of sbarsForPatient) await sbarStore.delete(s.id)

  const taskStore = tx.objectStore('tasks')
  const tasksForPatient = await taskStore.index('by-patient').getAll(id)
  for (const t of tasksForPatient) await taskStore.delete(t.id)

  const snapshotStore = tx.objectStore('snapshots')
  const snapsForPatient = await snapshotStore.index('by-patient').getAll(id)
  for (const sn of snapsForPatient) await snapshotStore.delete(sn.id)

  await tx.done
}

// ─── SBARs ────────────────────────────────────────────────────────────────────

export async function saveSBAR(sbar: SBAR): Promise<void> {
  const db = await getDB()
  await db.put('sbars', sbar)
}

export async function getSBARForPatient(patientId: string): Promise<SBAR | undefined> {
  const db = await getDB()
  const sbars = await db.getAllFromIndex('sbars', 'by-patient', patientId)
  return sbars.sort((a, b) => b.version - a.version)[0]
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function saveTask(task: Task): Promise<void> {
  const db = await getDB()
  await db.put('tasks', task)
}

export async function getTasksForPatient(patientId: string): Promise<Task[]> {
  const db = await getDB()
  return db.getAllFromIndex('tasks', 'by-patient', patientId)
}

export async function deleteTask(taskId: string): Promise<void> {
  const db = await getDB()
  await db.delete('tasks', taskId)
}

export async function saveTasksBulk(tasks: Task[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('tasks', 'readwrite')
  await Promise.all(tasks.map(t => tx.store.put(t)))
  await tx.done
}

// ─── Snapshots ───────────────────────────────────────────────────────────────

export async function saveSnapshot(snapshot: PatientSnapshot): Promise<void> {
  const db = await getDB()
  await db.put('snapshots', snapshot)
}

export async function getSnapshotForPatient(patientId: string): Promise<PatientSnapshot | undefined> {
  const db = await getDB()
  const snaps = await db.getAllFromIndex('snapshots', 'by-patient', patientId)
  return snaps[0]
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key: 'user', data: settings })
}

export async function loadSettings(): Promise<UserSettings | undefined> {
  const db = await getDB()
  const record = await db.get('settings', 'user')
  return record?.data
}

// ─── Clear All ───────────────────────────────────────────────────────────────

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['patients', 'sbars', 'tasks', 'snapshots', 'settings'], 'readwrite')
  await Promise.all([
    tx.objectStore('patients').clear(),
    tx.objectStore('sbars').clear(),
    tx.objectStore('tasks').clear(),
    tx.objectStore('snapshots').clear(),
    tx.objectStore('settings').clear(),
  ])
  await tx.done
}
