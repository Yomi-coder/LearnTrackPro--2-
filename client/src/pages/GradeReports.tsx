import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { FileText, Download, TrendingUp, TrendingDown, Award } from "lucide-react"

export default function GradeReports() {
  const [selectedSession, setSelectedSession] = useState<string>("all")
  const { user } = useAuth()

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["/api/assessments"],
  })

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  })

  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
  })

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  })

  // Filter assessments based on user role and selected session
  const filteredAssessments = assessments?.filter((assessment: any) => {
    const sessionMatch = selectedSession === "all" || assessment.sessionId.toString() === selectedSession
    
    if (user?.role === "student") {
      return assessment.studentId === user.id && sessionMatch
    } else if (user?.role === "lecturer") {
      const course = courses?.find((c: any) => c.id === assessment.courseId)
      return course?.lecturerId === user.id && sessionMatch
    }
    
    return sessionMatch
  }) || []

  const calculateGPA = (assessments: any[]) => {
    if (assessments.length === 0) return 0
    
    const gradePoints = assessments.map((assessment: any) => {
      switch (assessment.grade) {
        case "A": return 4.0
        case "B": return 3.0
        case "C": return 2.0
        case "D": return 1.0
        default: return 0.0
      }
    })
    
    return gradePoints.reduce((sum, gp) => sum + gp, 0) / gradePoints.length
  }

  const getSessionName = (sessionId: number) => {
    const session = sessions?.find((s: any) => s.id === sessionId)
    return session ? session.name : "Unknown Session"
  }

  const getCourseName = (courseId: number) => {
    const course = courses?.find((c: any) => c.id === courseId)
    return course ? `${course.code} - ${course.name}` : "Unknown Course"
  }

  const getStudentName = (studentId: string) => {
    const student = users?.find((u: any) => u.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student"
  }

  const groupedAssessments = filteredAssessments.reduce((groups: any, assessment: any) => {
    const sessionId = assessment.sessionId
    if (!groups[sessionId]) {
      groups[sessionId] = []
    }
    groups[sessionId].push(assessment)
    return groups
  }, {})

  const overallGPA = calculateGPA(filteredAssessments)
  const totalCredits = filteredAssessments.length * 3 // Assuming 3 credits per course
  const completedCourses = filteredAssessments.filter((a: any) => a.grade && a.grade !== "F").length
  const passRate = filteredAssessments.length > 0 
    ? (completedCourses / filteredAssessments.length) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Grade Reports</h1>
          <p className="text-muted-foreground">
            {user?.role === "student" 
              ? "View your academic performance and grade reports"
              : user?.role === "lecturer"
              ? "View grade reports for your courses"
              : "Comprehensive grade reports and analytics"
            }
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Reports</CardTitle>
          <CardDescription>Select academic session to view specific grade reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All sessions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                {sessions?.map((session: any) => (
                  <SelectItem key={session.id} value={session.id.toString()}>
                    {session.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {user?.role === "student" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-primary/10 text-primary rounded-lg p-3">
                  <Award className="h-6 w-6" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{overallGPA.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Overall GPA</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 text-green-600 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{completedCourses}</div>
              <div className="text-sm text-muted-foreground">Completed Courses</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 text-blue-600 rounded-lg p-3">
                  <FileText className="h-6 w-6" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{totalCredits}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 text-orange-600 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{passRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grade Reports by Session */}
      <div className="space-y-6">
        {Object.entries(groupedAssessments).map(([sessionId, assessments]: [string, any]) => (
          <Card key={sessionId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getSessionName(parseInt(sessionId))}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span>GPA: {calculateGPA(assessments).toFixed(2)}</span>
                  <Badge variant="outline">
                    {assessments.length} course{assessments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {user?.role !== "student" && <TableHead>Student</TableHead>}
                    <TableHead>Course</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Mid Exam</TableHead>
                    <TableHead>Final Exam</TableHead>
                    <TableHead>Total Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment: any) => (
                    <TableRow key={assessment.id}>
                      {user?.role !== "student" && (
                        <TableCell>
                          <div className="font-medium">{getStudentName(assessment.studentId)}</div>
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="font-medium">{getCourseName(assessment.courseId)}</div>
                      </TableCell>
                      <TableCell>{assessment.attendance || "—"}</TableCell>
                      <TableCell>{assessment.assignment || "—"}</TableCell>
                      <TableCell>{assessment.midExam || "—"}</TableCell>
                      <TableCell>{assessment.finalExam || "—"}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {assessment.totalScore ? parseFloat(assessment.totalScore).toFixed(1) : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            assessment.grade === "A" || assessment.grade === "B" ? "default" : 
                            assessment.grade === "C" ? "secondary" : 
                            assessment.grade === "D" || assessment.grade === "F" ? "destructive" : "outline"
                          }
                        >
                          {assessment.grade || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={
                          assessment.gradeComment === "Pass" ? "text-green-600" :
                          assessment.gradeComment === "Fail" ? "text-red-600" :
                          "text-orange-600"
                        }>
                          {assessment.gradeComment || "Pending"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {Object.keys(groupedAssessments).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No grade reports found</h3>
              <p className="text-muted-foreground">
                {isLoading 
                  ? "Loading grade reports..."
                  : "No assessments have been completed for the selected criteria."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
