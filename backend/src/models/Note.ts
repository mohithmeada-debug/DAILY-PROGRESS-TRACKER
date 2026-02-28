import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
    _id: mongoose.Types.ObjectId;
    content: string;
    date: string; // YYYY-MM-DD
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const noteSchema = new Schema<INote>(
    {
        content: {
            type: String,
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

export default mongoose.model<INote>('Note', noteSchema);
