import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { BookOpen, Clock, TrendingUp, Award } from "lucide-react"

export default function StudentAssessments() {
  const { user } = useAuth()

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["/api/assessments", user?.id],
    enabled: !!user?.id,
  })

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  })

  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
  })

  const getCourseName = (courseId: number) => {
    const course = courses?.find((c: any) => c.id === courseId)
    return course ? `${course.code} - ${course.name}` : "Unknown Course"
  }

  const getSessionName = (sessionId: number) => {
    const session = sessions?.find((s: any) => s.id === sessionId)
    return session?.name || "Unknown Session"
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500'
      case 'B': return 'bg-blue-500'
      case 'C': return 'bg-orange-500'
      case 'D': return 'bg-yellow-500'
      case 'F': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCommentColor = (comment: string) => {
    if (comment === "Pass") return "text-green-600"
    if (comment === "Pass with Warning") return "text-orange-600"
    return "text-red-600"
  }

  // Group assessments by session
  const groupedAssessments = assessments?.reduce((acc: any, assessment: any) => {
    const sessionId = assessment.sessionId
    if (!acc[sessionId]) {
      acc[sessionId] = []
    }
    acc[sessionId].push(assessment)
    return acc
  }, {}) || {}

  const calculateGPA = (sessionAssessments: any[]) => {
    const gradePoints: { [key: string]: number } = {
      'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
    }
    const total = sessionAssessments.reduce((sum, assessment) => {
      return sum + (gradePoints[assessment.grade] || 0)
    }, 0)
    return sessionAssessments.length > 0 ? total / sessionAssessments.length : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your assessment results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Assessment Results</h1>
          <p className="text-muted-foreground">
            View your detailed assessment breakdown and performance across all courses
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-medium">Overall GPA</div>
                <div className="text-2xl font-bold">
                  {calculateGPA(assessments || []).toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Assessment Results by Session */}
      <div className="space-y-6">
        {Object.entries(groupedAssessments).map(([sessionId, sessionAssessments]: [string, any]) => (
          <Card key={sessionId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getSessionName(parseInt(sessionId))}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span>Session GPA: {calculateGPA(sessionAssessments).toFixed(2)}</span>
                  <Badge variant="outline">
                    {sessionAssessments.length} course{sessionAssessments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {sessionAssessments.map((assessment: any) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {getCourseName(assessment.courseId)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{assessment.attendance || 0}%</span>
                          <Progress value={assessment.attendance || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{assessment.assignment || 0}%</span>
                          <Progress value={assessment.assignment || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{assessment.midExam || 0}%</span>
                          <Progress value={assessment.midExam || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{assessment.finalExam || 0}%</span>
                          <Progress value={assessment.finalExam || 0} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {parseFloat(assessment.totalScore || "0").toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getGradeColor(assessment.grade)} text-white`}>
                          {assessment.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${getCommentColor(assessment.gradeComment)}`}>
                          {assessment.gradeComment}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No assessments */}
      {(!assessments || assessments.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Assessment Results</h3>
            <p className="text-muted-foreground">
              You don't have any assessment results yet. Check back after your lecturers have graded your work.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}