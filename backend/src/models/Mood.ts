import mongoose, { Document, Schema } from 'mongoose';

export interface IMood extends Document {
    _id: mongoose.Types.ObjectId;
    value: 'Happy' | 'Good' | 'Normal' | 'Low' | 'Stressed';
    date: string; // YYYY-MM-DD format
    userId: mongoose.Types.ObjectId;
}

const moodSchema = new Schema<IMood>(
    {
        value: {
            type: String,
            enum: ['Happy', 'Good', 'Normal', 'Low', 'Stressed'],
            required: true,
        },
        date: {
            type: String,
            required: true,
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

moodSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model<IMood>('Mood', moodSchema);
