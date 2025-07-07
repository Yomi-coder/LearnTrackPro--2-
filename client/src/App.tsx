import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Students from "@/pages/Students";
import Lecturers from "@/pages/Lecturers";
import Courses from "@/pages/Courses";
import NewsEvents from "@/pages/NewsEvents";
import Assessments from "@/pages/Assessments";
import QuizSystem from "@/pages/QuizSystem";
import GradeReports from "@/pages/GradeReports";
import Settings from "@/pages/Settings";
import StudentAssessments from "@/pages/StudentAssessments";
import StudentGrades from "@/pages/StudentGrades";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Show authenticated routes with layout
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/students" component={Students} />
        <Route path="/lecturers" component={Lecturers} />
        <Route path="/courses" component={Courses} />
        <Route path="/sessions" component={Settings} />
        <Route path="/news-events" component={NewsEvents} />
        <Route path="/assessments" component={Assessments} />
        <Route path="/quiz-system" component={QuizSystem} />
        <Route path="/grade-reports" component={GradeReports} />
        <Route path="/my-assessments" component={StudentAssessments} />
        <Route path="/my-grades" component={StudentGrades} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
