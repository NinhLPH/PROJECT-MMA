import dotenv from 'dotenv';
import app from './app';
import connectDatabase from './config/db';

dotenv.config();

const port = Number(process.env.PORT);

async function startServer(): Promise<void> {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT environment variable must be a valid port number');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  await connectDatabase();
  app.listen(port, () => {
    console.log(`FlexFit API listening on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start FlexFit API:', error);
  process.exit(1);
});
