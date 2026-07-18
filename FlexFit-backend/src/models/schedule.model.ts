import { Schema, model, type InferSchemaType } from 'mongoose';

const scheduleSchema = new Schema(
  {
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeSlot: { type: String, required: true, trim: true },
    isBooked: { type: Boolean, default: false, required: true },
  },
  { timestamps: true },
);

scheduleSchema.index({ trainerId: 1, date: 1, timeSlot: 1 }, { unique: true });

export type Schedule = InferSchemaType<typeof scheduleSchema>;
export default model('Schedule', scheduleSchema);
