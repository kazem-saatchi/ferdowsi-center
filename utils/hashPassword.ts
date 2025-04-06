import { compare, hash } from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  const hashedPassword = await hash(password, saltRounds);
  return hashedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const checkUserPassword = await compare(password, hashedPassword);
  return checkUserPassword;
};
