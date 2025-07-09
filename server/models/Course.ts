import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  id: number;
  code: string;
  title: string;
  description?: string;
  credits: number;
  lecturerId: string;
  sessionId: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  id: { type: Number, required: true, unique: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  credits: { type: Number, required: true },
  lecturerId: { type: String, required: true },
  sessionId: { type: Number, required: true },
}, {
  timestamps: true,
});

export const Course = mongoose.model<ICourse>('Course', courseSchema);