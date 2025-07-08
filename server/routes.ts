import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCourseSchema,
  insertEnrollmentSchema,
  insertAssessmentSchema,
  insertNewsEventSchema,
  insertQuizSchema,
  insertQuizQuestionSchema,
  insertAcademicSessionSchema,
  insertUserSchema,
  insertQuizAttemptSchema,
  insertCourseMaterialSchema,
} from "@shared/schema";

// Helper function to calculate GPA
function calculateGPA(assessments: any[]): number {
  if (!assessments || assessments.length === 0) return 0;
  
  const gradePoints: { [key: string]: number } = {
    'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
  };
  
  const total = assessments.reduce((sum, assessment) => {
    return sum + (gradePoints[assessment.grade] || 0);
  }, 0);
  
  return total / assessments.length;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Replit OAuth login (original functionality)
  app.get("/api/login", async (req: any, res) => {
    try {
      // Redirect to Replit OAuth (simplified for development)
      req.session.user = {
        id: "44705117", 
        email: "admin@edumaster.dev",
        firstName: "Admin",
        lastName: "User",
        role: "admin"
      };
      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Sign up route
  app.post("/api/auth/signup", async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const users = await storage.getAllUsers();
      const existingUser = users.find(u => u.email === userData.email);
      
      if (existingUser) {
        return res.status(400).json({ 
          message: "An account with this email already exists. Please use a different email or sign in instead." 
        });
      }
      
      // Generate a unique ID for the user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser = await storage.createUser({
        ...userData,
        id: userId
      });
      
      res.json({ 
        message: "Account created successfully", 
        user: { id: newUser.id, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle Zod validation errors
      if (error.name === 'ZodError') {
        const firstError = error.errors[0];
        if (firstError.path.includes('role')) {
          return res.status(400).json({ 
            message: "Invalid role selected. Please choose Admin, Lecturer, or Student." 
          });
        }
        return res.status(400).json({ 
          message: `Validation error: ${firstError.message}` 
        });
      }
      
      // Handle specific database constraint errors
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        return res.status(400).json({ 
          message: "An account with this email already exists. Please use a different email or sign in instead." 
        });
      }
      
      res.status(400).json({ message: "Failed to create account. Please try again." });
    }
  });

  // Sign in route  
  app.post("/api/auth/signin", async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email (simplified - in production, use proper password hashing)
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set user session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      };
      
      res.json({ 
        message: "Sign in successful", 
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ message: "Sign in failed" });
    }
  });

  app.get("/api/logout", (req: any, res) => {
    req.session.destroy();
    res.redirect("/");
  });

  // Auth routes
  app.get('/api/auth/user', (req: any, res) => {
    try {
      // Check if user is in session (fallback for dev mode)
      if (req.session?.user) {
        return res.json(req.session.user);
      }
      
      // Normal authenticated flow
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        storage.getUser(userId).then(user => {
          res.json(user);
        }).catch(error => {
          console.error("Error fetching user:", error);
          res.status(500).json({ message: "Failed to fetch user" });
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin-only middleware
  const adminOnly = async (req: any, res: any, next: any) => {
    try {
      // Check session-based user first
      if (req.session?.user?.role === "admin") {
        return next();
      }
      
      // Check Replit auth user
      if (req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        if (user && user.role === "admin") {
          return next();
        }
      }
      
      res.status(403).json({ message: "Admin access required" });
    } catch (error) {
      res.status(500).json({ message: "Authorization check failed" });
    }
  };

  // Dashboard routes (admin only)
  app.get("/api/dashboard/metrics", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  app.get("/api/dashboard/grade-distribution", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const distribution = await storage.getGradeDistribution();
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching grade distribution:", error);
      res.status(500).json({ message: "Failed to fetch grade distribution" });
    }
  });

  app.get("/api/dashboard/top-courses", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const topCourses = await storage.getTopPerformingCourses();
      res.json(topCourses);
    } catch (error) {
      console.error("Error fetching top courses:", error);
      res.status(500).json({ message: "Failed to fetch top courses" });
    }
  });

  // Academic session routes
  app.get("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertAcademicSessionSchema.parse(req.body);
      const session = await storage.createAcademicSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Course routes
  app.get("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId) : undefined;
      const courses = await storage.getCourses(sessionId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const course = await storage.getCourseById(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", isAuthenticated, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      const courseData = insertCourseSchema.partial().parse(req.body);
      const course = await storage.updateCourse(parseInt(req.params.id), courseData);
      res.json(course);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCourse(parseInt(req.params.id));
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.query.studentId as string;
      const courseId = req.query.courseId ? parseInt(req.query.courseId) : undefined;
      const enrollments = await storage.getEnrollments(studentId, courseId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  app.post("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse(req.body);
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to create enrollment" });
    }
  });

  app.delete("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const { studentId, courseId } = req.body;
      await storage.dropEnrollment(studentId, parseInt(courseId));
      res.json({ message: "Enrollment dropped successfully" });
    } catch (error) {
      console.error("Error dropping enrollment:", error);
      res.status(500).json({ message: "Failed to drop enrollment" });
    }
  });

  // Assessment routes
  app.get("/api/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.query.studentId as string;
      const courseId = req.query.courseId ? parseInt(req.query.courseId) : undefined;
      const assessments = await storage.getAssessments(studentId, courseId);
      res.json(assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Failed to fetch assessments" });
    }
  });

  app.post("/api/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error creating assessment:", error);
      res.status(500).json({ message: "Failed to create assessment" });
    }
  });

  app.put("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const assessmentData = insertAssessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateAssessment(parseInt(req.params.id), assessmentData);
      res.json(assessment);
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ message: "Failed to update assessment" });
    }
  });

  // News and events routes
  app.get("/api/news-events", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const newsEvents = await storage.getNewsEvents(limit);
      res.json(newsEvents);
    } catch (error) {
      console.error("Error fetching news events:", error);
      res.status(500).json({ message: "Failed to fetch news events" });
    }
  });

  app.post("/api/news-events", isAuthenticated, async (req: any, res) => {
    try {
      const newsEventData = insertNewsEventSchema.parse(req.body);
      const newsEvent = await storage.createNewsEvent(newsEventData);
      res.json(newsEvent);
    } catch (error) {
      console.error("Error creating news event:", error);
      res.status(500).json({ message: "Failed to create news event" });
    }
  });

  app.put("/api/news-events/:id", isAuthenticated, async (req: any, res) => {
    try {
      const newsEventData = insertNewsEventSchema.partial().parse(req.body);
      const newsEvent = await storage.updateNewsEvent(parseInt(req.params.id), newsEventData);
      res.json(newsEvent);
    } catch (error) {
      console.error("Error updating news event:", error);
      res.status(500).json({ message: "Failed to update news event" });
    }
  });

  app.delete("/api/news-events/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteNewsEvent(parseInt(req.params.id));
      res.json({ message: "News event deleted successfully" });
    } catch (error) {
      console.error("Error deleting news event:", error);
      res.status(500).json({ message: "Failed to delete news event" });
    }
  });

  // Quiz routes
  app.get("/api/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
      const quizzes = await storage.getQuizzes(categoryId);
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const quiz = await storage.getQuizById(parseInt(req.params.id));
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post("/api/quizzes", isAuthenticated, async (req: any, res) => {
    try {
      const quizData = insertQuizSchema.parse(req.body);
      const quiz = await storage.createQuiz(quizData);
      res.json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ message: "Failed to create quiz" });
    }
  });

  // Quiz question routes
  app.get("/api/quizzes/:id/questions", isAuthenticated, async (req: any, res) => {
    try {
      const questions = await storage.getQuizQuestions(parseInt(req.params.id));
      res.json(questions);
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({ message: "Failed to fetch quiz questions" });
    }
  });

  app.post("/api/quizzes/:id/questions", isAuthenticated, async (req: any, res) => {
    try {
      const questionData = insertQuizQuestionSchema.parse({
        ...req.body,
        quizId: parseInt(req.params.id),
      });
      const question = await storage.createQuizQuestion(questionData);
      res.json(question);
    } catch (error) {
      console.error("Error creating quiz question:", error);
      res.status(500).json({ message: "Failed to create quiz question" });
    }
  });

  // Quiz attempt routes
  app.get("/api/quiz-attempts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.query.userId as string;
      const quizId = req.query.quizId ? parseInt(req.query.quizId) : undefined;
      const attempts = await storage.getQuizAttempts(userId, quizId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  app.post("/api/quiz-attempts", isAuthenticated, async (req: any, res) => {
    try {
      const attemptData = {
        ...req.body,
        userId: req.user.claims.sub,
      };
      const attempt = await storage.createQuizAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Failed to create quiz attempt" });
    }
  });

  app.put("/api/quiz-attempts/:id", isAuthenticated, async (req: any, res) => {
    try {
      const attempt = await storage.updateQuizAttempt(parseInt(req.params.id), req.body);
      res.json(attempt);
    } catch (error) {
      console.error("Error updating quiz attempt:", error);
      res.status(500).json({ message: "Failed to update quiz attempt" });
    }
  });

  // Course material routes
  app.get("/api/courses/:id/materials", isAuthenticated, async (req: any, res) => {
    try {
      const materials = await storage.getCourseMaterials(parseInt(req.params.id));
      res.json(materials);
    } catch (error) {
      console.error("Error fetching course materials:", error);
      res.status(500).json({ message: "Failed to fetch course materials" });
    }
  });

  app.post("/api/courses/:id/materials", isAuthenticated, async (req: any, res) => {
    try {
      const materialData = {
        ...req.body,
        courseId: parseInt(req.params.id),
        uploadedBy: req.user.claims.sub,
      };
      const material = await storage.createCourseMaterial(materialData);
      res.json(material);
    } catch (error) {
      console.error("Error creating course material:", error);
      res.status(500).json({ message: "Failed to create course material" });
    }
  });

  // User management routes (admin only)
  app.get("/api/users", isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(req.params.id, userData);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", isAuthenticated, adminOnly, async (req: any, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // PDF Generation routes
  app.get("/api/students/:id/registration-slip", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const enrollments = await storage.getEnrollments(studentId);
      
      // Generate PDF data structure for registration slip
      const pdfData = {
        student: await storage.getUser(studentId),
        enrollments,
        generatedAt: new Date().toISOString(),
      };
      
      res.json(pdfData);
    } catch (error) {
      console.error("Error generating registration slip:", error);
      res.status(500).json({ message: "Failed to generate registration slip" });
    }
  });

  app.get("/api/students/:id/grade-report", isAuthenticated, async (req: any, res) => {
    try {
      const studentId = req.params.id;
      const assessments = await storage.getAssessments(studentId);
      
      // Generate PDF data structure for grade report
      const pdfData = {
        student: await storage.getUser(studentId),
        assessments,
        gpa: calculateGPA(assessments),
        generatedAt: new Date().toISOString(),
      };
      
      res.json(pdfData);
    } catch (error) {
      console.error("Error generating grade report:", error);
      res.status(500).json({ message: "Failed to generate grade report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
