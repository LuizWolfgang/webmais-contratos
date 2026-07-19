import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { PasswordHasher } from '../domain/password-hasher.port';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
