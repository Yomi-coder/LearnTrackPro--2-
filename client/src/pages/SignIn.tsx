import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { GraduationCap, LogIn, ArrowLeft, UserPlus } from "lucide-react"
import { Link } from "wouter"
import { z } from "zod"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

type SignInForm = z.infer<typeof signInSchema>

export default function SignIn() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const signInMutation = useMutation({
    mutationFn: async (credentials: SignInForm) => {
      const response = await apiRequest("POST", "/api/auth/signin", credentials)
      return response
    },
    onSuccess: () => {
      toast({
        title: "Sign In Successful",
        description: "Welcome back to EduMaster!",
      })
      window.location.href = "/"
    },
    onError: (error: any) => {
      toast({
        title: "Sign In Failed", 
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: SignInForm) => {
    setIsLoading(true)
    signInMutation.mutate(data)
    setIsLoading(false)
  }

  const handleReplitSignIn = () => {
    window.location.href = "/api/login"
  }

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
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </CardTitle>
            <CardDescription>
              Access your Learning Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Replit OAuth Sign-In */}
            <div>
              <Button 
                onClick={handleReplitSignIn}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                <GraduationCap className="mr-2 h-5 w-5" />
                Continue with Replit
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Recommended: Use your Replit account for secure authentication
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Sign-In */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading || signInMutation.isPending}
                >
                  {isLoading || signInMutation.isPending ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Create Account
                </Link>
              </p>
              
              <Link href="/">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}