import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <TopBar />
      <main className="flex-1 overflow-y-auto pb-20 px-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
