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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertQuizSchema, insertQuizQuestionSchema, type InsertQuiz, type InsertQuizQuestion } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Plus, Search, Edit, Play, BarChart, Clock, Users } from "lucide-react"

export default function QuizSystem() {
  const [activeTab, setActiveTab] = useState("quizzes")
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false)
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: quizzes, isLoading: quizzesLoading } = useQuery({
    queryKey: ["/api/quizzes"],
  })

  const { data: quizAttempts } = useQuery({
    queryKey: ["/api/quiz-attempts"],
  })

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
  })

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  })

  const quizForm = useForm<InsertQuiz>({
    resolver: zodResolver(insertQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      passMark: 50,
      timeLimit: 60,
      attemptsAllowed: 1,
      randomizeQuestions: false,
      showAnswers: "after_completion",
      isActive: true,
    },
  })

  const createQuizMutation = useMutation({
    mutationFn: async (quizData: InsertQuiz) => {
      await apiRequest("POST", "/api/quizzes", quizData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] })
      toast({
        title: "Success",
        description: "Quiz created successfully",
      })
      setIsCreateQuizOpen(false)
      quizForm.reset()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const startQuizMutation = useMutation({
    mutationFn: async (quizId: number) => {
      await apiRequest("POST", "/api/quiz-attempts", { quizId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] })
      toast({
        title: "Success",
        description: "Quiz started successfully",
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

  const filteredQuizzes = quizzes?.filter((quiz: any) => 
    quiz.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getUserName = (userId: string) => {
    const user = users?.find((u: any) => u.id === userId)
    return user ? `${user.firstName} ${user.lastName}` : "Unknown"
  }

  const getQuizTitle = (quizId: number) => {
    const quiz = quizzes?.find((q: any) => q.id === quizId)
    return quiz ? quiz.title : "Unknown Quiz"
  }

  const onSubmitQuiz = (data: InsertQuiz) => {
    createQuizMutation.mutate(data)
  }

  const handleStartQuiz = (quizId: number) => {
    startQuizMutation.mutate(quizId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quiz System</h1>
          <p className="text-muted-foreground">
            {user?.role === "student" 
              ? "Take quizzes and view your results"
              : "Create and manage quizzes for your courses"
            }
          </p>
        </div>
        
        {(user?.role === "admin" || user?.role === "lecturer") && (
          <Dialog open={isCreateQuizOpen} onOpenChange={setIsCreateQuizOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
                <DialogDescription>
                  Set up a new quiz with questions and settings.
                </DialogDescription>
              </DialogHeader>
              <Form {...quizForm}>
                <form onSubmit={quizForm.handleSubmit(onSubmitQuiz)} className="space-y-4">
                  <FormField
                    control={quizForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quiz Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter quiz title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quizForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter quiz description" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={quizForm.control}
                      name="passMark"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pass Mark (%)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              min="0" 
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={quizForm.control}
                      name="timeLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="60" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={quizForm.control}
                    name="attemptsAllowed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attempts Allowed</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1" 
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={quizForm.control}
                    name="showAnswers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Show Answers</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select when to show answers" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="immediately">Immediately</SelectItem>
                            <SelectItem value="after_completion">After Completion</SelectItem>
                            <SelectItem value="never">Never</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={quizForm.watch("randomizeQuestions")}
                      onChange={(e) => quizForm.setValue("randomizeQuestions", e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <FormLabel>Randomize Questions</FormLabel>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateQuizOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createQuizMutation.isPending}
                    >
                      {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="attempts">Quiz Attempts</TabsTrigger>
          {(user?.role === "admin" || user?.role === "lecturer") && (
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="quizzes" className="space-y-4">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle>Available Quizzes</CardTitle>
              <CardDescription>Search and filter quizzes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzesLoading ? (
              <div className="col-span-full flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz: any) => (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{quiz.timeLimit} min</span>
                        </div>
                        <Badge variant="outline">
                          Pass: {quiz.passMark}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Attempts: {quiz.attemptsAllowed}</span>
                        <span>Questions: {quiz.randomizeQuestions ? "Random" : "Fixed"}</span>
                      </div>

                      <div className="pt-2">
                        {user?.role === "student" ? (
                          <Button 
                            className="w-full" 
                            onClick={() => handleStartQuiz(quiz.id)}
                            disabled={startQuizMutation.isPending}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Quiz
                          </Button>
                        ) : (
                          <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <BarChart className="mr-2 h-4 w-4" />
                              Stats
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <div className="text-muted-foreground mb-4">
                    <Play className="h-12 w-12 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">No quizzes available</h3>
                    <p>There are no quizzes created yet.</p>
                  </div>
                  {(user?.role === "admin" || user?.role === "lecturer") && (
                    <Button onClick={() => setIsCreateQuizOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Quiz
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Attempts</CardTitle>
              <CardDescription>
                {user?.role === "student" ? "Your quiz attempt history" : "All quiz attempts"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {user?.role !== "student" && <TableHead>Student</TableHead>}
                    <TableHead>Quiz</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizAttempts && quizAttempts.length > 0 ? (
                    quizAttempts
                      .filter((attempt: any) => user?.role === "student" ? attempt.userId === user.id : true)
                      .map((attempt: any) => (
                        <TableRow key={attempt.id}>
                          {user?.role !== "student" && (
                            <TableCell>{getUserName(attempt.userId)}</TableCell>
                          )}
                          <TableCell>{getQuizTitle(attempt.quizId)}</TableCell>
                          <TableCell>
                            {attempt.score ? `${parseFloat(attempt.score).toFixed(1)}%` : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={attempt.passed ? "default" : "destructive"}>
                              {attempt.passed ? "Passed" : "Failed"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(attempt.startedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {attempt.timeSpent ? `${Math.round(attempt.timeSpent / 60)} min` : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={user?.role === "student" ? 5 : 6} 
                        className="text-center text-muted-foreground py-8"
                      >
                        No quiz attempts found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {(user?.role === "admin" || user?.role === "lecturer") && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total Quizzes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizzes?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Active quizzes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Total Attempts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizAttempts?.length || 0}</div>
                  <p className="text-sm text-muted-foreground">Quiz attempts</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pass Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {quizAttempts && quizAttempts.length > 0 
                      ? `${Math.round((quizAttempts.filter((a: any) => a.passed).length / quizAttempts.length) * 100)}%`
                      : "0%"
                    }
                  </div>
                  <p className="text-sm text-muted-foreground">Overall success rate</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
