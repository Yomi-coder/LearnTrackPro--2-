import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "lecturer", "student", "guest"] }).notNull().default("student"),
  department: varchar("department"),
  studentId: varchar("student_id"),
  permissions: jsonb("permissions").default("[]"), // Custom permissions like "view_sittings"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Academic sessions/semesters
export const academicSessions = pgTable("academic_sessions", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  code: varchar("code").notNull().unique(),
  name: varchar("name").notNull(),
  description: text("description"),
  credits: integer("credits").default(3),
  department: varchar("department"),
  lecturerId: varchar("lecturer_id").references(() => users.id),
  sessionId: integer("session_id").references(() => academicSessions.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course enrollments
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  sessionId: integer("session_id").references(() => academicSessions.id).notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  status: varchar("status", { enum: ["active", "dropped", "completed"] }).default("active"),
});

// Assessments
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  studentId: varchar("student_id").references(() => users.id).notNull(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  sessionId: integer("session_id").references(() => academicSessions.id).notNull(),
  attendance: decimal("attendance", { precision: 5, scale: 2 }),
  midExam: decimal("mid_exam", { precision: 5, scale: 2 }),
  finalExam: decimal("final_exam", { precision: 5, scale: 2 }),
  assignment: decimal("assignment", { precision: 5, scale: 2 }),
  totalScore: decimal("total_score", { precision: 5, scale: 2 }),
  grade: varchar("grade"),
  gradeComment: varchar("grade_comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// News and events
export const newsEvents = pgTable("news_events", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content"),
  type: varchar("type", { enum: ["news", "event", "announcement"] }).notNull(),
  authorId: varchar("author_id").references(() => users.id),
  eventDate: timestamp("event_date"),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quiz categories
export const quizCategories = pgTable("quiz_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  courseId: integer("course_id").references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quizzes
export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => quizCategories.id),
  passMark: integer("pass_mark").default(50),
  timeLimit: integer("time_limit"), // in minutes
  attemptsAllowed: integer("attempts_allowed").default(1),
  randomizeQuestions: boolean("randomize_questions").default(false),
  showAnswers: varchar("show_answers", { enum: ["immediately", "after_completion", "never"] }).default("after_completion"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quiz questions
export const quizQuestions = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  question: text("question").notNull(),
  questionType: varchar("question_type", { enum: ["multiple_choice", "true_false", "essay"] }).notNull(),
  options: jsonb("options"), // For multiple choice questions
  correctAnswer: text("correct_answer"),
  explanation: text("explanation"),
  points: integer("points").default(1),
  orderIndex: integer("order_index"),
});

// Quiz attempts
export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  answers: jsonb("answers"),
  score: decimal("score", { precision: 5, scale: 2 }),
  passed: boolean("passed"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  timeSpent: integer("time_spent"), // in seconds
});

// Course materials
export const courseMaterials = pgTable("course_materials", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id).notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileUrl: varchar("file_url"),
  fileType: varchar("file_type"),
  uploadedBy: varchar("uploaded_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  enrollments: many(enrollments),
  assessments: many(assessments),
  coursesAsLecturer: many(courses),
  newsEvents: many(newsEvents),
  quizAttempts: many(quizAttempts),
  courseMaterials: many(courseMaterials),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  lecturer: one(users, {
    fields: [courses.lecturerId],
    references: [users.id],
  }),
  session: one(academicSessions, {
    fields: [courses.sessionId],
    references: [academicSessions.id],
  }),
  enrollments: many(enrollments),
  assessments: many(assessments),
  quizCategories: many(quizCategories),
  materials: many(courseMaterials),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [enrollments.sessionId],
    references: [academicSessions.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  student: one(users, {
    fields: [assessments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  session: one(academicSessions, {
    fields: [assessments.sessionId],
    references: [academicSessions.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  category: one(quizCategories, {
    fields: [quizzes.categoryId],
    references: [quizCategories.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizQuestions.quizId],
    references: [quizzes.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  quiz: one(quizzes, {
    fields: [quizAttempts.quizId],
    references: [quizzes.id],
  }),
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  role: true,
  department: true,
  studentId: true,
});

export const insertAcademicSessionSchema = createInsertSchema(academicSessions).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsEventSchema = createInsertSchema(newsEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true,
});

export const insertCourseMaterialSchema = createInsertSchema(courseMaterials).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AcademicSession = typeof academicSessions.$inferSelect;
export type InsertAcademicSession = z.infer<typeof insertAcademicSessionSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type NewsEvent = typeof newsEvents.$inferSelect;
export type InsertNewsEvent = z.infer<typeof insertNewsEventSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;
export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type CourseMaterial = typeof courseMaterials.$inferSelect;
export type InsertCourseMaterial = z.infer<typeof insertCourseMaterialSchema>;
