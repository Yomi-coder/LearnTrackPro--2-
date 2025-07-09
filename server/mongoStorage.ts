import { User, AcademicSession, Course } from './models';
import {
  type User as UserType,
  type UpsertUser,
  type InsertUser,
  type AcademicSession as AcademicSessionType,
  type InsertAcademicSession,
  type Course as CourseType,
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
  type CourseMaterial,
  type InsertCourseMaterial,
} from '@shared/schema';

export interface IMongoStorage {
  // User operations
  getUser(id: string): Promise<UserType | undefined>;
  getUserByEmail(email: string): Promise<UserType | undefined>;
  upsertUser(user: UpsertUser): Promise<UserType>;
  getAllUsers(): Promise<UserType[]>;
  createUser(user: InsertUser): Promise<UserType>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<UserType>;
  deleteUser(id: string): Promise<void>;
  
  // Academic session operations
  getActiveSessions(): Promise<AcademicSessionType[]>;
  createAcademicSession(session: InsertAcademicSession): Promise<AcademicSessionType>;
  updateAcademicSession(id: number, session: Partial<InsertAcademicSession>): Promise<AcademicSessionType>;
  
  // Course operations
  getCourses(sessionId?: number): Promise<CourseType[]>;
  getCourseById(id: number): Promise<CourseType | undefined>;
  createCourse(course: InsertCourse): Promise<CourseType>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<CourseType>;
  deleteCourse(id: number): Promise<void>;
  
  // Analytics operations
  getDashboardMetrics(): Promise<{
    totalStudents: number;
    totalLecturers: number;
    totalCourses: number;
    totalEnrollments: number;
  }>;
  
  // Placeholder methods for other operations (can be implemented later)
  getEnrollments(studentId?: string, courseId?: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  dropEnrollment(studentId: string, courseId: number): Promise<void>;
  getAssessments(studentId?: string, courseId?: number): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment>;
  getNewsEvents(limit?: number): Promise<NewsEvent[]>;
  createNewsEvent(newsEvent: InsertNewsEvent): Promise<NewsEvent>;
  updateNewsEvent(id: number, newsEvent: Partial<InsertNewsEvent>): Promise<NewsEvent>;
  deleteNewsEvent(id: number): Promise<void>;
  getQuizzes(categoryId?: number): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz>;
  getQuizQuestions(quizId: number): Promise<QuizQuestion[]>;
  createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion>;
  getQuizAttempts(userId?: string, quizId?: number): Promise<QuizAttempt[]>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt>;
  getCourseMaterials(courseId: number): Promise<CourseMaterial[]>;
  createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial>;
  getGradeDistribution(): Promise<Array<{ grade: string; count: number }>>;
  getTopPerformingCourses(limit?: number): Promise<Array<{ course: CourseType; avgGPA: number; studentCount: number }>>;
}

export class MongoStorage implements IMongoStorage {
  // User operations
  async getUser(id: string): Promise<UserType | undefined> {
    const user = await User.findOne({ id });
    return user ? this.convertUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<UserType | undefined> {
    const user = await User.findOne({ email });
    return user ? this.convertUser(user) : undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<UserType> {
    const user = await User.findOneAndUpdate(
      { id: userData.id },
      userData,
      { upsert: true, new: true }
    );
    return this.convertUser(user);
  }

  async getAllUsers(): Promise<UserType[]> {
    const users = await User.find();
    return users.map(user => this.convertUser(user));
  }

  async createUser(userData: InsertUser): Promise<UserType> {
    const id = userData.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = new User({ ...userData, id });
    await user.save();
    return this.convertUser(user);
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<UserType> {
    const user = await User.findOneAndUpdate({ id }, userData, { new: true });
    if (!user) throw new Error('User not found');
    return this.convertUser(user);
  }

  async deleteUser(id: string): Promise<void> {
    await User.findOneAndDelete({ id });
  }

  // Academic session operations
  async getActiveSessions(): Promise<AcademicSessionType[]> {
    return []; // Placeholder implementation
  }

  async createAcademicSession(session: InsertAcademicSession): Promise<AcademicSessionType> {
    // Placeholder implementation
    return {
      id: Date.now(),
      ...session,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateAcademicSession(id: number, session: Partial<InsertAcademicSession>): Promise<AcademicSessionType> {
    // Placeholder implementation
    return {
      id,
      name: session.name || '',
      startDate: session.startDate || new Date(),
      endDate: session.endDate || new Date(),
      isActive: session.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // Course operations
  async getCourses(sessionId?: number): Promise<CourseType[]> {
    return []; // Placeholder implementation
  }

  async getCourseById(id: number): Promise<CourseType | undefined> {
    return undefined; // Placeholder implementation
  }

  async createCourse(course: InsertCourse): Promise<CourseType> {
    // Placeholder implementation
    return {
      id: Date.now(),
      ...course,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<CourseType> {
    // Placeholder implementation
    return {
      id,
      code: course.code || '',
      title: course.title || '',
      description: course.description,
      credits: course.credits || 0,
      lecturerId: course.lecturerId || '',
      sessionId: course.sessionId || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteCourse(id: number): Promise<void> {
    // Placeholder implementation
  }

  // Analytics operations
  async getDashboardMetrics(): Promise<{
    totalStudents: number;
    totalLecturers: number;
    totalCourses: number;
    totalEnrollments: number;
  }> {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalLecturers = await User.countDocuments({ role: 'lecturer' });
    
    return {
      totalStudents,
      totalLecturers,
      totalCourses: 0, // Placeholder
      totalEnrollments: 0, // Placeholder
    };
  }

  // Placeholder methods for other operations
  async getEnrollments(studentId?: string, courseId?: number): Promise<Enrollment[]> {
    return [];
  }

  async createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment> {
    return {
      id: Date.now(),
      ...enrollment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async dropEnrollment(studentId: string, courseId: number): Promise<void> {
    // Placeholder implementation
  }

  async getAssessments(studentId?: string, courseId?: number): Promise<Assessment[]> {
    return [];
  }

  async createAssessment(assessment: InsertAssessment): Promise<Assessment> {
    return {
      id: Date.now(),
      ...assessment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment> {
    return {
      id,
      studentId: assessment.studentId || '',
      courseId: assessment.courseId || 0,
      type: assessment.type || 'assignment',
      title: assessment.title || '',
      score: assessment.score || 0,
      maxScore: assessment.maxScore || 100,
      submissionDate: assessment.submissionDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getNewsEvents(limit = 50): Promise<NewsEvent[]> {
    return [];
  }

  async createNewsEvent(newsEvent: InsertNewsEvent): Promise<NewsEvent> {
    return {
      id: Date.now(),
      ...newsEvent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateNewsEvent(id: number, newsEvent: Partial<InsertNewsEvent>): Promise<NewsEvent> {
    return {
      id,
      title: newsEvent.title || '',
      content: newsEvent.content || '',
      type: newsEvent.type || 'news',
      publishedAt: newsEvent.publishedAt || new Date(),
      authorId: newsEvent.authorId || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async deleteNewsEvent(id: number): Promise<void> {
    // Placeholder implementation
  }

  async getQuizzes(categoryId?: number): Promise<Quiz[]> {
    return [];
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    return undefined;
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    return {
      id: Date.now(),
      ...quiz,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz> {
    return {
      id,
      title: quiz.title || '',
      description: quiz.description || '',
      courseId: quiz.courseId || 0,
      timeLimit: quiz.timeLimit || 60,
      isActive: quiz.isActive || true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getQuizQuestions(quizId: number): Promise<QuizQuestion[]> {
    return [];
  }

  async createQuizQuestion(question: InsertQuizQuestion): Promise<QuizQuestion> {
    return {
      id: Date.now(),
      ...question,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getQuizAttempts(userId?: string, quizId?: number): Promise<QuizAttempt[]> {
    return [];
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    return {
      id: Date.now(),
      ...attempt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async updateQuizAttempt(id: number, attempt: Partial<InsertQuizAttempt>): Promise<QuizAttempt> {
    return {
      id,
      userId: attempt.userId || '',
      quizId: attempt.quizId || 0,
      score: attempt.score || 0,
      maxScore: attempt.maxScore || 100,
      timeSpent: attempt.timeSpent || 0,
      submittedAt: attempt.submittedAt || new Date(),
      answers: attempt.answers || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getCourseMaterials(courseId: number): Promise<CourseMaterial[]> {
    return [];
  }

  async createCourseMaterial(material: InsertCourseMaterial): Promise<CourseMaterial> {
    return {
      id: Date.now(),
      ...material,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getGradeDistribution(): Promise<Array<{ grade: string; count: number }>> {
    return [];
  }

  async getTopPerformingCourses(limit = 5): Promise<Array<{ course: CourseType; avgGPA: number; studentCount: number }>> {
    return [];
  }

  // Helper method to convert Mongoose document to plain object
  private convertUser(user: any): UserType {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      department: user.department,
      studentId: user.studentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const mongoStorage = new MongoStorage();