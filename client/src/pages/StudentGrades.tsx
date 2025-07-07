import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { Download, FileText, TrendingUp, TrendingDown, Award } from "lucide-react"

export default function StudentGrades() {
  const [selectedSession, setSelectedSession] = useState<string>("all")
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

  // Filter assessments by session
  const filteredAssessments = assessments?.filter((assessment: any) => {
    if (selectedSession === "all") return true
    return assessment.sessionId.toString() === selectedSession
  }) || []

  // Group assessments by session
  const groupedAssessments = filteredAssessments.reduce((acc: any, assessment: any) => {
    const sessionId = assessment.sessionId
    if (!acc[sessionId]) {
      acc[sessionId] = []
    }
    acc[sessionId].push(assessment)
    return acc
  }, {})

  const calculateGPA = (sessionAssessments: any[]) => {
    const gradePoints: { [key: string]: number } = {
      'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
    }
    const total = sessionAssessments.reduce((sum, assessment) => {
      return sum + (gradePoints[assessment.grade] || 0)
    }, 0)
    return sessionAssessments.length > 0 ? total / sessionAssessments.length : 0
  }

  const overallGPA = calculateGPA(assessments || [])

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/students/${user?.id}/grade-report`)
      const pdfData = await response.json()
      
      // Create a simple text-based report (in a real app, you'd use a PDF library)
      const reportContent = `
GRADE REPORT
Student: ${pdfData.student?.firstName} ${pdfData.student?.lastName}
Student ID: ${pdfData.student?.studentId}
Generated: ${new Date(pdfData.generatedAt).toLocaleDateString()}
Overall GPA: ${pdfData.gpa.toFixed(2)}

ASSESSMENTS:
${pdfData.assessments.map((assessment: any) => `
Course: ${getCourseName(assessment.courseId)}
Grade: ${assessment.grade} (${assessment.totalScore}%)
Comment: ${assessment.gradeComment}
`).join('')}
      `
      
      const blob = new Blob([reportContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `grade-report-${user?.studentId || user?.id}.txt`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading grade report:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your grade reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Grade Reports</h1>
          <p className="text-muted-foreground">
            View your final grades and academic performance summary
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Overall GPA Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Academic Performance Summary</span>
            <Award className="h-6 w-6 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallGPA.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Overall GPA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{filteredAssessments.length}</div>
              <div className="text-sm text-muted-foreground">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredAssessments.filter((a: any) => a.gradeComment === "Pass").length}
              </div>
              <div className="text-sm text-muted-foreground">Courses Passed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Grades</CardTitle>
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

      {/* Grade Reports by Session */}
      <div className="space-y-6">
        {Object.entries(groupedAssessments).map(([sessionId, sessionAssessments]: [string, any]) => (
          <Card key={sessionId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{getSessionName(parseInt(sessionId))}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span>GPA: {calculateGPA(sessionAssessments).toFixed(2)}</span>
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
                    <TableHead>Total Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Grade Points</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessionAssessments.map((assessment: any) => {
                    const gradePoints: { [key: string]: number } = {
                      'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
                    }
                    return (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">
                          {getCourseName(assessment.courseId)}
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
                          <span className="font-medium">
                            {gradePoints[assessment.grade]?.toFixed(1) || '0.0'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getCommentColor(assessment.gradeComment)}`}>
                            {assessment.gradeComment}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No grades */}
      {filteredAssessments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Grade Reports</h3>
            <p className="text-muted-foreground">
              You don't have any grade reports yet for the selected session.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}