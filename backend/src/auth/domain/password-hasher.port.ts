export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

export interface PasswordHasher {
  compare(plain: string, hash: string): Promise<boolean>;
}
