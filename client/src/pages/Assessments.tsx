import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertAssessmentSchema, type InsertAssessment } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Plus, Search, Edit, Calculator } from "lucide-react"

export default function Assessments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: assessments, isLoading } = useQuery({
    queryKey: ["/api/assessments"],
  })

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  })

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  })

  const { data: sessions } = useQuery({
    queryKey: ["/api/sessions"],
  })

  const form = useForm<InsertAssessment>({
    resolver: zodResolver(insertAssessmentSchema),
    defaultValues: {
      studentId: "",
      courseId: undefined,
      sessionId: undefined,
      attendance: undefined,
      midExam: undefined,
      finalExam: undefined,
      assignment: undefined,
    },
  })

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: InsertAssessment) => {
      await apiRequest("POST", "/api/assessments", assessmentData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] })
      toast({
        title: "Success",
        description: "Assessment created successfully",
      })
      setIsAddDialogOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAssessment> }) => {
      await apiRequest("PUT", `/api/assessments/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] })
      toast({
        title: "Success",
        description: "Assessment updated successfully",
      })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const students = users?.filter((user: any) => user.role === "student") || []
  const lecturerCourses = user?.role === "lecturer" 
    ? courses?.filter((course: any) => course.lecturerId === user.id) || []
    : courses || []

  const filteredAssessments = assessments?.filter((assessment: any) => {
    const student = students.find((s: any) => s.id === assessment.studentId)
    const course = courses?.find((c: any) => c.id === assessment.courseId)
    
    const matchesSearch = student && (
      student.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesCourse = selectedCourse === "all" || assessment.courseId.toString() === selectedCourse
    
    // If user is lecturer, only show assessments for their courses
    if (user?.role === "lecturer") {
      const isLecturerCourse = lecturerCourses.some((c: any) => c.id === assessment.courseId)
      return matchesSearch && matchesCourse && isLecturerCourse
    }
    
    return matchesSearch && matchesCourse
  }) || []

  const calculateGrade = (assessment: any) => {
    const { attendance = 0, midExam = 0, finalExam = 0, assignment = 0 } = assessment
    const total = (attendance * 0.1) + (midExam * 0.3) + (finalExam * 0.4) + (assignment * 0.2)
    
    if (total >= 90) return "A"
    if (total >= 80) return "B"
    if (total >= 70) return "C"
    if (total >= 60) return "D"
    return "F"
  }

  const getStudentName = (studentId: string) => {
    const student = students.find((s: any) => s.id === studentId)
    return student ? `${student.firstName} ${student.lastName}` : "Unknown"
  }

  const getCourseName = (courseId: number) => {
    const course = courses?.find((c: any) => c.id === courseId)
    return course ? `${course.code} - ${course.name}` : "Unknown"
  }

  const onSubmit = (data: InsertAssessment) => {
    // Calculate total and grade
    const total = 
      (parseFloat(data.attendance?.toString() || "0") * 0.1) +
      (parseFloat(data.midExam?.toString() || "0") * 0.3) +
      (parseFloat(data.finalExam?.toString() || "0") * 0.4) +
      (parseFloat(data.assignment?.toString() || "0") * 0.2)
    
    const grade = total >= 90 ? "A" : total >= 80 ? "B" : total >= 70 ? "C" : total >= 60 ? "D" : "F"
    const gradeComment = total >= 60 ? "Pass" : "Fail"
    
    createAssessmentMutation.mutate({
      ...data,
      totalScore: total.toString(),
      grade,
      gradeComment,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assessments</h1>
          <p className="text-muted-foreground">
            {user?.role === "lecturer" 
              ? "Manage student assessments and grades for your courses"
              : "View and manage all student assessments"
            }
          </p>
        </div>
        
        {(user?.role === "admin" || user?.role === "lecturer") && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add Assessment</DialogTitle>
                <DialogDescription>
                  Enter assessment scores for a student.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student: any) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName} ({student.studentId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {lecturerCourses.map((course: any) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.code} - {course.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Session</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select session" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sessions?.map((session: any) => (
                              <SelectItem key={session.id} value={session.id.toString()}>
                                {session.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="attendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendance (10%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0-100" 
                              min="0" 
                              max="100"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="assignment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assignment (20%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0-100" 
                              min="0" 
                              max="100"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="midExam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mid Exam (30%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0-100" 
                              min="0" 
                              max="100"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="finalExam"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Final Exam (40%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0-100" 
                              min="0" 
                              max="100"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createAssessmentMutation.isPending}
                    >
                      {createAssessmentMutation.isPending ? "Creating..." : "Create Assessment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Filters</CardTitle>
          <CardDescription>Search and filter assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, ID, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {lecturerCourses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assessments ({filteredAssessments.length})</CardTitle>
          <CardDescription>Student assessment records and grades</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Mid Exam</TableHead>
                  <TableHead>Final Exam</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssessments.map((assessment: any) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getStudentName(assessment.studentId)}</div>
                        <div className="text-sm text-muted-foreground">
                          {students.find((s: any) => s.id === assessment.studentId)?.studentId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{getCourseName(assessment.courseId)}</div>
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
                        variant={assessment.grade === "A" || assessment.grade === "B" ? "default" : 
                               assessment.grade === "C" ? "secondary" : "destructive"}
                      >
                        {assessment.grade || calculateGrade(assessment)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAssessments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No assessments found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
