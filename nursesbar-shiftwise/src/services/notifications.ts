import { milToDate } from '@/utils/militaryTime'

const scheduledTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

export function showNotification(title: string, body: string, icon?: string): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return
  new Notification(title, { body, icon: icon ?? '/icons/icon-192.png' })
}

export function scheduleChartingNotifications(
  times: string[],
  _shiftStart: string
): void {
  cancelAllNotifications()
  const now = new Date()

  for (const milTime of times) {
    const target = milToDate(milTime)
    let ms = target.getTime() - now.getTime()
    // If time has already passed today, schedule for tomorrow
    if (ms < 0) ms += 24 * 60 * 60 * 1000

    const id = setTimeout(() => {
      showNotification(
        '📋 Charting Reminder',
        `Time to chart! Shift checkpoint: ${milTime}`,
        '/icons/icon-192.png'
      )
      scheduledTimeouts.delete(milTime)
    }, ms)

    scheduledTimeouts.set(milTime, id)
  }
}

export function cancelAllNotifications(): void {
  for (const [, id] of scheduledTimeouts) clearTimeout(id)
  scheduledTimeouts.clear()
}
