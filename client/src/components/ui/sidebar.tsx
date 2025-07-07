import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart3, 
  BookOpen, 
  Calendar,
  ClipboardCheck,
  Cog,
  GraduationCap,
  LogOut,
  Newspaper,
  PieChart,
  MessageCircleQuestion,
  Users,
  UserCheck
} from "lucide-react"
import { Link, useLocation } from "wouter"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  userRole?: string
}

const adminMenuItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: BarChart3 },
      { title: "News & Events", href: "/news-events", icon: Newspaper },
    ]
  },
  {
    title: "Management", 
    items: [
      { title: "Students", href: "/students", icon: Users },
      { title: "Lecturers", href: "/lecturers", icon: UserCheck },
      { title: "Courses", href: "/courses", icon: BookOpen },
      { title: "Academic Sessions", href: "/sessions", icon: Calendar },
    ]
  },
  {
    title: "Assessment",
    items: [
      { title: "Assessments", href: "/assessments", icon: ClipboardCheck },
      { title: "Quiz System", href: "/quiz-system", icon: MessageCircleQuestion },
      { title: "Grade Reports", href: "/grade-reports", icon: PieChart },
    ]
  },
  {
    title: "System",
    items: [
      { title: "Settings", href: "/settings", icon: Cog },
    ]
  }
]

const lecturerMenuItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: BarChart3 },
      { title: "News & Events", href: "/news-events", icon: Newspaper },
    ]
  },
  {
    title: "Teaching",
    items: [
      { title: "My Courses", href: "/courses", icon: BookOpen },
      { title: "Assessments", href: "/assessments", icon: ClipboardCheck },
      { title: "Quiz System", href: "/quiz-system", icon: MessageCircleQuestion },
    ]
  }
]

const studentMenuItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", href: "/", icon: BarChart3 },
      { title: "News & Events", href: "/news-events", icon: Newspaper },
    ]
  },
  {
    title: "Learning",
    items: [
      { title: "My Courses", href: "/courses", icon: BookOpen },
      { title: "My Grades", href: "/grade-reports", icon: PieChart },
      { title: "Quizzes", href: "/quiz-system", icon: MessageCircleQuestion },
    ]
  }
]

export function Sidebar({ className, userRole = "student", ...props }: SidebarProps) {
  const [location] = useLocation()
  
  const getMenuItems = () => {
    switch (userRole) {
      case "admin":
        return adminMenuItems
      case "lecturer":
        return lecturerMenuItems
      case "student":
        return studentMenuItems
      default:
        return studentMenuItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <div className={cn("pb-12", className)} {...props}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-primary text-white rounded-lg p-2">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-primary">EduMaster</h2>
          </div>
          
          <ScrollArea className="h-[calc(100vh-10rem)] px-1">
            <div className="space-y-6">
              {menuItems.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={location === item.href ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            location === item.href && "bg-primary text-white"
                          )}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="mt-6 pt-6 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
