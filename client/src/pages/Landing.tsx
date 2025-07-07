import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Users, Award } from "lucide-react"

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-primary text-white rounded-lg p-3">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-primary">EduMaster</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive Learning Management System designed to streamline education 
            with course management, assessment tracking, and administrative tools.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            className="bg-primary hover:bg-primary/90"
          >
            Sign In to Continue
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Course Management</CardTitle>
              <CardDescription>
                Create, manage, and organize courses with comprehensive tools for educators
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-secondary mb-2" />
              <CardTitle>Multi-Role System</CardTitle>
              <CardDescription>
                Support for administrators, lecturers, students, and guests with role-based access
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Award className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle>Assessment & Grading</CardTitle>
              <CardDescription>
                Automated grade calculations, quiz system, and comprehensive reporting
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Public News Section */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Latest News & Announcements</CardTitle>
            <CardDescription>
              Stay updated with the latest happenings in our institution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold">Fall Semester 2024 Registration Open</h3>
                <p className="text-sm text-muted-foreground">
                  Registration for Fall Semester 2024 is now open. Students can enroll in courses
                  through the student portal.
                </p>
                <span className="text-xs text-muted-foreground">Posted 2 days ago</span>
              </div>
              
              <div className="border-l-4 border-secondary pl-4">
                <h3 className="font-semibold">New Learning Resources Available</h3>
                <p className="text-sm text-muted-foreground">
                  Additional learning materials and video lectures have been added to the 
                  course library.
                </p>
                <span className="text-xs text-muted-foreground">Posted 1 week ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
