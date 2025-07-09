import { Link } from "wouter"
import { GraduationCap, UserX, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignUp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-primary text-white rounded-lg p-3">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-primary">EduMaster</h1>
            </div>
            <CardTitle className="flex items-center justify-center space-x-2">
              <UserX className="h-5 w-5" />
              <span>Account Creation</span>
            </CardTitle>
            <CardDescription>
              Contact Administrator for New Accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <UserX className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Administrator Access Required
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                New user accounts can only be created by system administrators for security and management purposes.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Contact Administrator
                  </span>
                </div>
                <p className="text-sm text-blue-800 font-medium">
                  admin@edumaster.com
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Please reach out to request a new account for students or lecturers.
                </p>
              </div>
              
              <div className="space-y-2">
                <Link href="/auth">
                  <Button className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}