import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertAcademicSessionSchema, type InsertAcademicSession } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Settings as SettingsIcon, Calendar, Database, Users, Shield, Bell } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("academic")
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { data: sessions } = useQuery({
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
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertAcademicSession> }) => {
      await apiRequest("PUT", `/api/sessions/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] })
      toast({
        title: "Success",
        description: "Session updated successfully",
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

  const onSubmitSession = (data: InsertAcademicSession) => {
    createSessionMutation.mutate(data)
  }

  const handleActivateSession = (sessionId: number) => {
    // First deactivate all sessions, then activate the selected one
    updateSessionMutation.mutate({
      id: sessionId,
      data: { isActive: true }
    })
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access system settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Academic Session */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Create Academic Session</span>
                </CardTitle>
                <CardDescription>
                  Set up new academic sessions and semesters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...sessionForm}>
                  <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
                    <FormField
                      control={sessionForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Fall Semester 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
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

                    <FormField
                      control={sessionForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Session</FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Set this as the current active academic session
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

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={createSessionMutation.isPending}
                    >
                      {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Manage Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Sessions</CardTitle>
                <CardDescription>
                  Manage existing academic sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions?.map((session: any) => (
                    <div 
                      key={session.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium">{session.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Active
                          </span>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleActivateSession(session.id)}
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {(!sessions || sessions.length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No academic sessions created yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>User Management Settings</span>
              </CardTitle>
              <CardDescription>
                Configure user registration and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-approve">Auto-approve new registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve new user accounts without admin review
                  </p>
                </div>
                <Switch id="auto-approve" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-verification">Require email verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email address before accessing the system
                  </p>
                </div>
                <Switch id="email-verification" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="default-role">Default user role</Label>
                <Select defaultValue="student">
                  <SelectTrigger id="default-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch id="email-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="grade-notifications">Grade update notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify students when new grades are posted
                  </p>
                </div>
                <Switch id="grade-notifications" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enrollment-notifications">Enrollment notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify lecturers when students enroll in their courses
                  </p>
                </div>
                <Switch id="enrollment-notifications" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quiz-notifications">Quiz reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send reminders about upcoming quiz deadlines
                  </p>
                </div>
                <Switch id="quiz-notifications" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>System Configuration</span>
              </CardTitle>
              <CardDescription>
                General system settings and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input id="system-name" defaultValue="EduMaster LMS" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input id="admin-email" type="email" placeholder="admin@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum file upload size (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue="50" min="1" max="500" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Maintenance mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable access to the system for maintenance
                  </p>
                </div>
                <Switch id="maintenance-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="debug-mode">Debug mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable detailed error logging for troubleshooting
                  </p>
                </div>
                <Switch id="debug-mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>Data Backup & Export</span>
              </CardTitle>
              <CardDescription>
                Manage system backups and data exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Automatic daily backups</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create daily backups of system data
                  </p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Manual Backup</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create an immediate backup of all system data
                  </p>
                  <Button>Create Backup Now</Button>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export specific data sets for analysis or migration
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline">Export Users</Button>
                    <Button variant="outline">Export Courses</Button>
                    <Button variant="outline">Export Grades</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="backup-retention">Backup retention (days)</Label>
                <Input id="backup-retention" type="number" defaultValue="30" min="1" max="365" />
                <p className="text-sm text-muted-foreground">
                  Number of days to keep backup files before automatic deletion
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
