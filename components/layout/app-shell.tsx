import { Sidebar } from './sidebar'
import { TopHeader } from './top-header'
import { ProjectBanner } from './project-banner'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto">
          <ProjectBanner />
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
