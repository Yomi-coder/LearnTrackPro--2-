import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { isUnauthorizedError } from "@/lib/authUtils"
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  GraduationCap,
  Calendar,
  TrendingUp,
  FileText,
  Settings,
  Plus,
  Newspaper
} from "lucide-react"
import { EnrollmentChart } from "@/components/charts/EnrollmentChart"

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { toast } = useToast()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      })
      setTimeout(() => {
        window.location.href = "/api/login"
      }, 500)
      return
    }
  }, [isAuthenticated, isLoading, user?.role, toast])

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    enabled: isAuthenticated && user?.role === "admin",
  })

  const { data: gradeDistribution } = useQuery({
    queryKey: ["/api/dashboard/grade-distribution"],
    enabled: isAuthenticated && user?.role === "admin",
  })

  const { data: topCourses } = useQuery({
    queryKey: ["/api/dashboard/top-courses"],
    enabled: isAuthenticated && user?.role === "admin",
  })

  const { data: activeSessions } = useQuery({
    queryKey: ["/api/sessions"],
    enabled: isAuthenticated,
  })

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const activeSession = activeSessions?.find((session: any) => session.isActive)

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500'
      case 'B': return 'bg-blue-500'
      case 'C': return 'bg-orange-500'
      case 'D': return 'bg-red-500'
      case 'F': return 'bg-gray-500'
      default: return 'bg-gray-300'
    }
  }

  const getGradePercentage = (grade: string, total: number) => {
    const gradeData = gradeDistribution?.find((g: any) => g.grade === grade)
    return gradeData ? Math.round((gradeData.count / total) * 100) : 0
  }

  const totalGrades = gradeDistribution?.reduce((sum: number, g: any) => sum + g.count, 0) || 1

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-foreground">
          {user?.role === 'admin' ? 'Admin Dashboard' : 
           user?.role === 'lecturer' ? 'Lecturer Dashboard' : 
           'Student Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {user?.role === 'admin' ? 'Overview of your learning management system' :
           user?.role === 'lecturer' ? 'Manage your courses and track student progress' :
           'Track your academic progress and upcoming assignments'}
        </p>
        
        {/* Active Semester Banner */}
        {activeSession && (
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold">{activeSession.name}</h3>
                  <p className="text-sm opacity-90">
                    {new Date(activeSession.startDate).toLocaleDateString()} - {new Date(activeSession.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <Button variant="secondary" size="sm">
                  Manage Sessions
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Key Metrics Grid */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 text-primary rounded-lg p-3">
                  <Users className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-green-600">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metricsLoading ? "..." : metrics?.totalStudents?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Total Students</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 text-green-600 rounded-lg p-3">
                  <UserCheck className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-green-600">
                  +5%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metricsLoading ? "..." : metrics?.totalLecturers?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Active Lecturers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 text-orange-600 rounded-lg p-3">
                  <BookOpen className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-green-600">
                  +8%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metricsLoading ? "..." : metrics?.totalCourses?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Active Courses</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 text-purple-600 rounded-lg p-3">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="text-green-600">
                  +15%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {metricsLoading ? "..." : metrics?.totalEnrollments?.toLocaleString() || "0"}
              </div>
              <div className="text-sm text-muted-foreground">Total Enrollments</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollment Trends Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Enrollment Trends</CardTitle>
              <CardDescription>Student enrollment over time</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">6M</Button>
              <Button variant="default" size="sm">1Y</Button>
            </div>
          </CardHeader>
          <CardContent>
            <EnrollmentChart />
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>Current semester grades</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {['A', 'B', 'C', 'D', 'F'].map((grade) => {
              const percentage = getGradePercentage(grade, totalGrades)
              return (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${getGradeColor(grade)}`}></div>
                    <span className="text-sm font-medium">{grade} Grade</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={percentage} className="w-24" />
                    <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </div>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="bg-primary/10 text-primary rounded-full p-2">
                  <Plus className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">Sarah Martinez</span> enrolled in 
                    <span className="font-medium"> Advanced Mathematics</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="bg-green-100 text-green-600 rounded-full p-2">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">Prof. Wilson</span> uploaded grades for 
                    <span className="font-medium"> Midterm Exam</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="bg-orange-100 text-orange-600 rounded-full p-2">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    New quiz <span className="font-medium">Chapter 5 Review</span> created for 
                    <span className="font-medium"> Biology 101</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">1 hour ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user?.role === 'admin' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Add Student</div>
                    <div className="text-xs text-muted-foreground">Register new student</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Create Course</div>
                    <div className="text-xs text-muted-foreground">Add new course</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Generate Reports</div>
                    <div className="text-xs text-muted-foreground">Academic reports</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Newspaper className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Post News</div>
                    <div className="text-xs text-muted-foreground">Create announcement</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">System Settings</div>
                    <div className="text-xs text-muted-foreground">Configure system</div>
                  </div>
                </Button>
              </>
            )}

            {user?.role === 'lecturer' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">My Courses</div>
                    <div className="text-xs text-muted-foreground">Manage courses</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Grade Students</div>
                    <div className="text-xs text-muted-foreground">Input assessments</div>
                  </div>
                </Button>
              </>
            )}

            {user?.role === 'student' && (
              <>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">Enroll Courses</div>
                    <div className="text-xs text-muted-foreground">Find new courses</div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-3 h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium text-sm">View Grades</div>
                    <div className="text-xs text-muted-foreground">Check performance</div>
                  </div>
                </Button>
              </>
            )}

            {/* System Status */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="text-sm font-semibold mb-3">System Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Database</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Auth Service</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">File Storage</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-orange-600">Maintenance</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Courses */}
      {user?.role === 'admin' && topCourses && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Performing Courses</CardTitle>
              <CardDescription>Courses with highest average GPA</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((item: any, index: number) => (
                <div key={item.course.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary text-white rounded-lg p-2 text-sm font-bold">
                      {item.course.code}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{item.course.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.course.department}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{item.avgGPA?.toFixed(1) || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{item.studentCount} students</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
