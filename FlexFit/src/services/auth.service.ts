import { apiClient, clearAuthToken, setAuthToken } from "@/api";
import type { LoginResponseDto, RegisterResponseDto } from "@/models/api.dto";
import type { AuthSession, LoginInput, RegisterInput, User } from "@/models/user";
import { mapUser } from "@/services/mappers";

async function register(input: RegisterInput): Promise<User> {
  const { data } = await apiClient.post<RegisterResponseDto>("/auth/register", input);
  return mapUser(data.user);
}

async function login(input: LoginInput): Promise<AuthSession> {
  const { data } = await apiClient.post<LoginResponseDto>("/auth/login", input);
  const session = {
    token: data.token,
    user: mapUser(data.user),
  };

  setAuthToken(session.token);
  return session;
}

function logout(): void {
  clearAuthToken();
}

export const authService = {
  login,
  logout,
  register,
};
