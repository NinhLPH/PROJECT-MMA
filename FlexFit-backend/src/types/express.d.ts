declare namespace Express {
  export interface Request {
    auth?: { userId: string; role: 'customer' | 'admin' };
  }
}
