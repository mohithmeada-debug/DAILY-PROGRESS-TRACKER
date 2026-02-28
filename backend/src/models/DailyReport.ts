import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyReport extends Document {
  _id: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  userId: mongoose.Types.ObjectId;
}

const dailyReportSchema = new Schema<IDailyReport>(
  {
    date: {
      type: String,
      required: true,
    },
    totalTasks: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

dailyReportSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IDailyReport>('DailyReport', dailyReportSchema);
