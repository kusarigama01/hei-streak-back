import bcrypt from "bcrypt";

export const hashPassword = async (plainPassword: string): Promise<string> =>
  bcrypt.hash(plainPassword, 10);

export const comparePassword = async (
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> => bcrypt.compare(plainPassword, passwordHash);
