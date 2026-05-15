import type { TimeFormat, Task } from '@/models/types'

export function parseMilTime(mil: string): { hours: number; minutes: number } {
  const clean = mil.replace(':', '').padStart(4, '0')
  return {
    hours: parseInt(clean.slice(0, 2), 10),
    minutes: parseInt(clean.slice(2, 4), 10),
  }
}

export function formatTime(mil: string, format: TimeFormat): string {
  const { hours, minutes } = parseMilTime(mil)
  const milStr = `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`
  if (format === 'military') return milStr

  const period = hours >= 12 ? 'PM' : 'AM'
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  const minStr = String(minutes).padStart(2, '0')
  const regular = `${h12}:${minStr} ${period}`

  if (format === 'regular') return regular
  return `${milStr} / ${regular}`
}

export function toMinutes(mil: string): number {
  const { hours, minutes } = parseMilTime(mil)
  return hours * 60 + minutes
}

export function fromMinutes(totalMin: number): string {
  const wrapped = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`
}

export function getAllHourSlots(): string[] {
  return Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}00`)
}

export function getShiftSlots(start: string, end: string): string[] {
  const slots = getAllHourSlots()
  const startMin = toMinutes(start)
  const endMin = toMinutes(end)
  if (startMin < endMin) {
    return slots.filter(s => {
      const m = toMinutes(s)
      return m >= startMin && m <= endMin
    })
  }
  // Overnight shift
  return slots.filter(s => {
    const m = toMinutes(s)
    return m >= startMin || m <= endMin
  })
}

export function isInShift(time: string, start: string, end: string): boolean {
  const t = toMinutes(time)
  const s = toMinutes(start)
  const e = toMinutes(end)
  if (s < e) return t >= s && t <= e
  return t >= s || t <= e
}

export function sortByTime(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
}

export function milToDate(mil: string): Date {
  const { hours, minutes } = parseMilTime(mil)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return d
}

export function getCurrentMilTime(): string {
  const now = new Date()
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}${m}`
}

export function nextChartingTime(
  current: string,
  checkpoints: string[]
): string | null {
  if (checkpoints.length === 0) return null
  const currentMin = toMinutes(current)
  const sorted = [...checkpoints].sort((a, b) => toMinutes(a) - toMinutes(b))
  const next = sorted.find(cp => toMinutes(cp) > currentMin)
  return next ?? sorted[0]
}

export function humanizeTime(mil: string): string {
  return formatTime(mil, 'regular')
}

export function validateMilTime(input: string): boolean {
  const clean = input.replace(':', '').replace(' ', '')
  if (!/^\d{4}$/.test(clean)) return false
  const h = parseInt(clean.slice(0, 2), 10)
  const m = parseInt(clean.slice(2, 4), 10)
  return h >= 0 && h <= 23 && m >= 0 && m <= 59
}
