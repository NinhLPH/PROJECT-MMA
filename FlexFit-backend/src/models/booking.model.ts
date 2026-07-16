import { Schema, model, type InferSchemaType } from 'mongoose';

const bookingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainerId: { type: Schema.Types.ObjectId, ref: 'Trainer', required: true },
    date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    timeSlot: { type: String, required: true, trim: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending', required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'paid', required: true },
  },
  { timestamps: true },
);

export type Booking = InferSchemaType<typeof bookingSchema>;
export default model('Booking', bookingSchema);
