import {
  users,
  courses,
  enrollments,
  assessments,
  newsEvents,
  quizzes,
  quizQuestions,
  quizAttempts,
  academicSessions,
  courseMaterials,
  quizCategories,
  type User,
  type UpsertUser,
  type Course,
  type InsertCourse,
  type Enrollment,
  type InsertEnrollment,
  type Assessment,
  type InsertAssessment,
  type NewsEvent,
  type InsertNewsEvent,
  type Quiz,
  type InsertQuiz,
  type QuizQuestion,
  type InsertQuizQuestion,
  type QuizAttempt,
  type InsertQuizAttempt,
  type AcademicSession,
  type InsertAcademicSession,
  type CourseMaterial,
  type InsertCourseMaterial,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, count } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Academic session operations
  getActiveSessions(): Promise<AcademicSession[]>;
  createAcademicSession(session: InsertAcademicSession): Promise<AcademicSession>;
  updateAcademicSession(id: number, session: Partial<InsertAcademicSession>): Promise<AcademicSession>;
  
  // Course operations
  getCourses(sessionId?: number): Promise<Course[]>;
  getCourseById(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Enrollment operations
  getEnrollments(studentId?: string, courseId?: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  dropEnrollment(studentId: string, courseId: number): Promise<void>;
  
  // Assessment operations
  getAssessments(studentId?: string, courseId?: number): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  
  // News and events operations
  getNewsEvents(limit?: number): Promise<NewsEvent[]>;
  createNewsEvent(newsEvent: InsertNewsEvent): Promise<NewsEvent>;
  updateNewsEvent(id: number, newsEvent: Partial<InsertNewsEvent>): Promise<NewsEvent>;
  deleteNewsEvent(id: number): Promise<void>;
  
  // Quiz operations
  getQuizzes(categoryId?: number): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz>;
  
  // Quiz question operations
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  
  // Quiz attempt operations
  getQuizAttempts(userId?: string, quizId?: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt>;
  
  // Course material operations
  getCourseMaterials(courseId: number): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;
  
  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalStudents: number;
    totalLecturers: number;
    totalCourses: number;
    totalEnrollments: number;
  }>;
  
  getGradeDistribution(): Promise<Array<{ grade: string; count: number }>>;
  getTopPerformingCourses(limit?: number): Promise<Array<{ course: Course; avgGPA: number; studentCount: number }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Academic session operations
  async getActiveSessions(): Promise<AcademicSession[]> {
    return await db.select().from(academicSessions).where(eq(academicSessions.isActive, true));
  }

  async createAcademicSession(session: InsertAcademicSession): Promise<AcademicSession> {
    const [newSession] = await db.insert(academicSessions).values(session).returning();
    return newSession;
  }

  async updateAcademicSession(id: number, session: Partial<InsertAcademicSession>): Promise<AcademicSession> {
    const [updatedSession] = await db
      .update(academicSessions)
      .set(session)
      .where(eq(academicSessions.id, id))
      .returning();
    return updatedSession;
  }

  // Course operations
  async getCourses(sessionId?: number): Promise<Course[]> {
    const query = db.select().from(courses);
    if (sessionId) {
      return await query.where(eq(courses.sessionId, sessionId));
    }
    return await query;
  }

  async getCourseById(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(course)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Enrollment operations
  async getEnrollments(studentId?: string, courseId?: number): Promise<Enrollment[]> {
    let query = db.select().from(enrollments);
    
    if (studentId && courseId) {
      return await query.where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
    } else if (studentId) {
      return await query.where(eq(enrollments.studentId, studentId));
    } else if (courseId) {
      return await query.where(eq(enrollments.courseId, courseId));
    }
    
    return await query;
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    const [newEnrollment] = await db.insert(enrollments).values(enrollment).returning();
    return newEnrollment;
  }

  async dropEnrollment(studentId: string, courseId: number): Promise<void> {
    await db
      .update(enrollments)
      .set({ status: "dropped" })
      .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)));
  }

  // Assessment operations
  async getAssessments(studentId?: string, courseId?: number): Promise<Assessment[]> {
    let query = db.select().from(assessments);
    
    if (studentId && courseId) {
      return await query.where(and(eq(assessments.studentId, studentId), eq(assessments.courseId, courseId)));
    } else if (studentId) {
      return await query.where(eq(assessments.studentId, studentId));
    } else if (courseId) {
      return await query.where(eq(assessments.courseId, courseId));
    }
    
    return await query;
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    const [newAssessment] = await db.insert(assessments).values(assessment).returning();
    return newAssessment;
  }

  async updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    const [updatedAssessment] = await db
      .update(assessments)
      .set({ ...assessment, updatedAt: new Date() })
      .where(eq(assessments.id, id))
      .returning();
    return updatedAssessment;
  }

  // News and events operations
  async getNewsEvents(limit = 50): Promise<NewsEvent[]> {
    return await db
      .select()
      .from(newsEvents)
      .where(eq(newsEvents.isPublished, true))
      .orderBy(desc(newsEvents.createdAt))
      .limit(limit);
  }

  async createNewsEvent(newsEvent: InsertNewsEvent): Promise<NewsEvent> {
    const [newNewsEvent] = await db.insert(newsEvents).values(newsEvent).returning();
    return newNewsEvent;
  }

  async updateNewsEvent(id: number, newsEvent: Partial<InsertNewsEvent>): Promise<NewsEvent> {
    const [updatedNewsEvent] = await db
      .update(newsEvents)
      .set({ ...newsEvent, updatedAt: new Date() })
      .where(eq(newsEvents.id, id))
      .returning();
    return updatedNewsEvent;
  }

  async deleteNewsEvent(id: number): Promise<void> {
    await db.delete(newsEvents).where(eq(newsEvents.id, id));
  }

  // Quiz operations
  async getQuizzes(categoryId?: number): Promise<Quiz[]> {
    const query = db.select().from(quizzes).where(eq(quizzes.isActive, true));
    if (categoryId) {
      return await query.where(eq(quizzes.categoryId, categoryId));
    }
    return await query;
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const [newQuiz] = await db.insert(quizzes).values(quiz).returning();
    return newQuiz;
  }

  async updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz> {
    const [updatedQuiz] = await db
      .update(quizzes)
      .set(quiz)
      .where(eq(quizzes.id, id))
      .returning();
    return updatedQuiz;
  }

  // Quiz question operations
  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quizId))
      .orderBy(quizQuestions.orderIndex);
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    const [newQuestion] = await db.insert(quizQuestions).values(question).returning();
    return newQuestion;
  }

  // Quiz attempt operations
  async getQuizAttempts(userId?: string, quizId?: number): Promise<QuizAttempt[]> {
    let query = db.select().from(quizAttempts);
    
    if (userId && quizId) {
      return await query.where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)));
    } else if (userId) {
      return await query.where(eq(quizAttempts.userId, userId));
    } else if (quizId) {
      return await query.where(eq(quizAttempts.quizId, quizId));
    }
    
    return await query;
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt> {
    const [updatedAttempt] = await db
      .update(quizAttempts)
      .set(attempt)
      .where(eq(quizAttempts.id, id))
      .returning();
    return updatedAttempt;
  }

  // Course material operations
  async getCourseMaterials(courseId: number): Promise<CourseMaterial[]> {
    return await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, courseId))
      .orderBy(desc(courseMaterials.uploadedAt));
  }

  async createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial> {
    const [newMaterial] = await db.insert(courseMaterials).values(material).returning();
    return newMaterial;
  }

  // Analytics operations
  async getDashboardMetrics(): Promise<{
    totalStudents: number;
    totalLecturers: number;
    totalCourses: number;
    totalEnrollments: number;
  }> {
    const [studentsCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student"));

    const [lecturersCount] = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "lecturer"));

    const [coursesCount] = await db
      .select({ count: count() })
      .from(courses)
      .where(eq(courses.isActive, true));

    const [enrollmentsCount] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));

    return {
      totalStudents: studentsCount.count,
      totalLecturers: lecturersCount.count,
      totalCourses: coursesCount.count,
      totalEnrollments: enrollmentsCount.count,
    };
  }

  async getGradeDistribution(): Promise<Array<{ grade: string; count: number }>> {
    return await db
      .select({
        grade: assessments.grade,
        count: count(),
      })
      .from(assessments)
      .where(sql`${assessments.grade} IS NOT NULL`)
      .groupBy(assessments.grade);
  }

  async getTopPerformingCourses(limit = 5): Promise<Array<{ course: Course; avgGPA: number; studentCount: number }>> {
    const result = await db
      .select({
        course: courses,
        avgGPA: sql<number>`AVG(CASE 
          WHEN ${assessments.grade} = 'A' THEN 4.0
          WHEN ${assessments.grade} = 'B' THEN 3.0
          WHEN ${assessments.grade} = 'C' THEN 2.0
          WHEN ${assessments.grade} = 'D' THEN 1.0
          ELSE 0.0
        END)`,
        studentCount: count(assessments.studentId),
      })
      .from(courses)
      .leftJoin(assessments, eq(courses.id, assessments.courseId))
      .where(eq(courses.isActive, true))
      .groupBy(courses.id)
      .orderBy(sql`AVG(CASE 
        WHEN ${assessments.grade} = 'A' THEN 4.0
        WHEN ${assessments.grade} = 'B' THEN 3.0
        WHEN ${assessments.grade} = 'C' THEN 2.0
        WHEN ${assessments.grade} = 'D' THEN 1.0
        ELSE 0.0
      END) DESC`)
      .limit(limit);

    return result;
  }
}

export const storage = new DatabaseStorage();
