import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function comparePassword(plainText: string, hashedPassword?: string | null): Promise<boolean> {
  if (!hashedPassword) return false;
  try {
    return await bcrypt.compare(plainText, hashedPassword);
  } catch (err) {
    return false;
  }
}
