import { Schema, model, type InferSchemaType } from 'mongoose';

const trainerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    avatar: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    bio: { type: String, required: true, trim: true },
    pricePerHour: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export type Trainer = InferSchemaType<typeof trainerSchema>;
export default model('Trainer', trainerSchema);
