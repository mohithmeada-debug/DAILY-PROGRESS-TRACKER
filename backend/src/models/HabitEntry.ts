import mongoose, { Document, Schema } from 'mongoose';

export interface IHabitEntry extends Document {
  _id: mongoose.Types.ObjectId;
  habitId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

const habitEntrySchema = new Schema<IHabitEntry>(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

habitEntrySchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export default mongoose.model<IHabitEntry>('HabitEntry', habitEntrySchema);

