import { Schema, model, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer', required: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;
export default model('User', userSchema);
