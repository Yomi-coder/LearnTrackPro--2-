import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicSession extends Document {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicSessionSchema = new Schema<IAcademicSession>({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

export const AcademicSession = mongoose.model<IAcademicSession>('AcademicSession', academicSessionSchema);