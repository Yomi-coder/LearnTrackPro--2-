import { ReactNode } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Sidebar } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-surface shadow-md fixed top-0 left-0 right-0 z-50 border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            {/* Logo is handled in sidebar */}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
            
            <div className="flex items-center space-x-3 border-l border-border pl-4">
              <div className="text-right">
                <div className="text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {user?.role || "Student"}
                </div>
              </div>
              <Avatar>
                <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
                <AvatarFallback>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-surface shadow-lg border-r border-border overflow-y-auto">
          <Sidebar userRole={user?.role} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 min-h-screen bg-background">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
