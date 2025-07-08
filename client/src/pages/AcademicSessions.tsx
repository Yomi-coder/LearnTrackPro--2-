import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertAcademicSessionSchema, type InsertAcademicSession, type AcademicSession } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Calendar, Plus, Edit, Trash } from "lucide-react"
import { Switch } from "@/components/ui/switch"

export default function AcademicSessions() {
  const [isCreateMode, setIsCreateMode] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Only admins can access this page
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access academic sessions management.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["/api/sessions"],
  })

  const sessionForm = useForm<InsertAcademicSession>({
    resolver: zodResolver(insertAcademicSessionSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: false,
    },
  })

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: InsertAcademicSession) => {
      await apiRequest("POST", "/api/sessions", sessionData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] })
      toast({
        title: "Success",
        description: "Academic session created successfully",
      })
      sessionForm.reset()
      setIsCreateMode(false)
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create academic session",
        variant: "destructive",
      })
    },
  })

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAcademicSession> }) => {
      await apiRequest("PATCH", `/api/sessions/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] })
      toast({
        title: "Success",
        description: "Academic session updated successfully",
      })
    },
  })

  const onSubmitSession = (data: InsertAcademicSession) => {
    createSessionMutation.mutate(data)
  }

  const toggleSessionStatus = (session: AcademicSession) => {
    updateSessionMutation.mutate({
      id: session.id,
      data: { isActive: !session.isActive }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading academic sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Sessions</h1>
          <p className="text-muted-foreground">
            Manage academic sessions, semesters, and terms
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateMode(!isCreateMode)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreateMode ? "Cancel" : "Add Session"}
        </Button>
      </div>

      {/* Create Session Form */}
      {isCreateMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Create New Academic Session
            </CardTitle>
            <CardDescription>
              Add a new academic session, semester, or term
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...sessionForm}>
              <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={sessionForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Fall 2025, Spring 2026" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={sessionForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active Session</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Set as the current active session
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={sessionForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={sessionForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={createSessionMutation.isPending}
                    className="gap-2"
                  >
                    {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateMode(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold">Existing Sessions</h2>
        {sessions && sessions.length > 0 ? (
          <div className="grid gap-4">
            {sessions.map((session: AcademicSession) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <Badge variant={session.isActive ? "default" : "secondary"}>
                          {session.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSessionStatus(session)}
                        disabled={updateSessionMutation.isPending}
                      >
                        {session.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Academic Sessions</h3>
              <p className="text-muted-foreground mb-4">
                Create your first academic session to get started
              </p>
              <Button onClick={() => setIsCreateMode(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}