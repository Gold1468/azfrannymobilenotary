import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomeScreen } from '@/screens/HomeScreen'
import { SBARScreen } from '@/screens/SBARScreen'
import { SnapshotScreen } from '@/screens/SnapshotScreen'
import { TimelineScreen } from '@/screens/TimelineScreen'
import { GamePlanScreen } from '@/screens/GamePlanScreen'
import { GlossaryScreen } from '@/screens/GlossaryScreen'
import { EducationScreen } from '@/screens/EducationScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { MedDetailScreen } from '@/screens/MedDetailScreen'
import { useSettingsStore } from '@/store/settingsStore'
import { scheduleChartingNotifications } from '@/services/notifications'

export default function App() {
  const settings = useSettingsStore(s => s.settings)

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale))
  }, [settings.fontScale])

  useEffect(() => {
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }, [settings.highContrast])

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  useEffect(() => {
    if (settings.chartingNotificationTimes.length > 0) {
      scheduleChartingNotifications(settings.chartingNotificationTimes, settings.shiftStart)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomeScreen />} />
          <Route path="sbar" element={<SBARScreen />} />
          <Route path="snapshot" element={<SnapshotScreen />} />
          <Route path="timeline" element={<TimelineScreen />} />
          <Route path="gameplan" element={<GamePlanScreen />} />
          <Route path="glossary" element={<GlossaryScreen />} />
          <Route path="education" element={<EducationScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="med/:medId" element={<MedDetailScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
