import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model';
import { HttpError } from '../utils/http-error';
import { requireString } from '../utils/validation';

function safeUser(user: { _id: unknown; email: string; fullName: string; phoneNumber: string; role: string; createdAt?: unknown; updatedAt?: unknown }) {
  return {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function validateEmail(email: string): string {
  const normalized = email.toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalized)) throw new HttpError(400, 'email must be valid');
  return normalized;
}

function requirePassword(value: unknown): string {
  const password = requireString(value, 'password');
  if (password.length < 6) throw new HttpError(400, 'password must be at least 6 characters');
  return password;
}

function createToken(user: { _id: unknown; role: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return jwt.sign({ role: user.role }, secret, { subject: String(user._id), expiresIn: '7d' });
}

export async function register(req: Request, res: Response): Promise<void> {
  const email = validateEmail(requireString(req.body.email, 'email'));
  const password = requirePassword(req.body.password);
  const fullName = requireString(req.body.fullName, 'fullName');
  const phoneNumber = requireString(req.body.phoneNumber, 'phoneNumber');

  const existingUser = await UserModel.exists({ email });
  if (existingUser) throw new HttpError(409, 'Email is already registered');

  const user = await UserModel.create({
    email,
    password: await bcrypt.hash(password, 12),
    fullName,
    phoneNumber,
    role: 'customer',
  });
  res.status(201).json({ user: safeUser(user) });
}

export async function login(req: Request, res: Response): Promise<void> {
  const email = validateEmail(requireString(req.body.email, 'email'));
  const password = requireString(req.body.password, 'password');
  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new HttpError(401, 'Email or password is incorrect');
  }

  res.status(200).json({ token: createToken(user), user: safeUser(user) });
}
