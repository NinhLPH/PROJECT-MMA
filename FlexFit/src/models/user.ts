import type { TimestampedModel } from "@/models/common";

export type UserRole = "customer" | "admin";

export interface User extends TimestampedModel {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface AuthSession {
  token: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
