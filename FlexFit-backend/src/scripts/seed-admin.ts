import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDatabase from '../config/db';
import UserModel from '../models/user.model';

dotenv.config();

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} environment variable is required`);
  return value;
}

async function seedAdmin(): Promise<void> {
  const email = requireEnvironment('ADMIN_EMAIL').toLowerCase();
  const password = requireEnvironment('ADMIN_PASSWORD');
  if (password.length < 6) throw new Error('ADMIN_PASSWORD must be at least 6 characters');

  await connectDatabase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existingUser = await UserModel.findOne({ email }).select('+password');

  if (existingUser) {
    existingUser.password = passwordHash;
    existingUser.role = 'admin';
    if (process.env.ADMIN_FULL_NAME?.trim()) existingUser.fullName = process.env.ADMIN_FULL_NAME.trim();
    if (process.env.ADMIN_PHONE_NUMBER?.trim()) existingUser.phoneNumber = process.env.ADMIN_PHONE_NUMBER.trim();
    await existingUser.save();
    console.log(`Admin account updated: ${email}`);
    return;
  }

  await UserModel.create({
    email,
    password: passwordHash,
    fullName: process.env.ADMIN_FULL_NAME?.trim() || 'FlexFit Administrator',
    phoneNumber: process.env.ADMIN_PHONE_NUMBER?.trim() || '0000000000',
    role: 'admin',
  });
  console.log(`Admin account created: ${email}`);
}

seedAdmin()
  .catch((error: unknown) => {
    console.error('Unable to seed admin account:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
