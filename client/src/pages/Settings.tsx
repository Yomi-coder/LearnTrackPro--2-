import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import { Settings as SettingsIcon, Database, Users, Shield, Bell, Mail, Globe, Lock, Server } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("general")
  const { toast } = useToast()
  const { user } = useAuth()

  // Only admins can access settings
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access system settings.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const handleSave = (section: string) => {
    toast({
      title: "Settings Updated",
      description: `${section} settings have been saved successfully`,
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic system settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="system-name">System Name</Label>
                <Input 
                  id="system-name" 
                  defaultValue="EduMaster Learning Management System"
                  placeholder="Enter system name" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="institution-name">Institution Name</Label>
                <Input 
                  id="institution-name" 
                  defaultValue="Sample University"
                  placeholder="Enter institution name" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-email">Administrator Email</Label>
                <Input 
                  id="admin-email" 
                  type="email"
                  defaultValue="admin@edumaster.dev"
                  placeholder="Enter admin email" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <div className="text-sm text-muted-foreground">
                    Enable maintenance mode to restrict system access
                  </div>
                </div>
                <Switch />
              </div>

              <Button onClick={() => handleSave("General")}>
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  defaultValue="1440"
                  placeholder="Enter session timeout in minutes" 
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <div className="text-sm text-muted-foreground">
                    Require 2FA for admin accounts
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Password Complexity</Label>
                  <div className="text-sm text-muted-foreground">
                    Enforce strong password requirements
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Login Attempt Limits</Label>
                  <div className="text-sm text-muted-foreground">
                    Lock accounts after failed login attempts
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={() => handleSave("Security")}>
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Grade Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Notify students when grades are posted
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Reminders</Label>
                  <div className="text-sm text-muted-foreground">
                    Send reminders for upcoming assignments
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp-server">SMTP Server</Label>
                <Input 
                  id="smtp-server" 
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">SMTP Port</Label>
                  <Input 
                    id="smtp-port" 
                    type="number"
                    defaultValue="587"
                    placeholder="587" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">SMTP Username</Label>
                  <Input 
                    id="smtp-username" 
                    placeholder="username@example.com" 
                  />
                </div>
              </div>

              <Button onClick={() => handleSave("Notifications")}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Information
              </CardTitle>
              <CardDescription>
                View system status and configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">System Version</Label>
                    <p className="text-sm text-muted-foreground">EduMaster v1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Database Status</Label>
                    <p className="text-sm text-green-600">Connected</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Backup</Label>
                    <p className="text-sm text-muted-foreground">Never</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Storage Used</Label>
                    <p className="text-sm text-muted-foreground">2.3 GB / 10 GB</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Active Users</Label>
                    <p className="text-sm text-muted-foreground">4 users</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Uptime</Label>
                    <p className="text-sm text-muted-foreground">Running</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Backup Database
                  </Button>
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}