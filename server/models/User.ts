import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'lecturer' | 'student' | 'guest';
  firstName?: string;
  lastName?: string;
  phone?: string;
  department?: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'lecturer', 'student', 'guest'], default: 'student' },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  department: { type: String },
  studentId: { type: String },
}, {
  timestamps: true,
});

export const User = mongoose.model<IUser>('User', userSchema);