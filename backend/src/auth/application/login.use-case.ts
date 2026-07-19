import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/password-hasher.port';
import { TOKEN_SERVICE, TokenService } from '../domain/token-service.port';

export interface LoginInput {
  username: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: { id: string; username: string };
}

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokenService: TokenService,
  ) {}

  async execute({ username, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    const isValid = user ? await this.passwordHasher.compare(password, user.passwordHash) : false;

    if (!user || !isValid) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const token = await this.tokenService.sign({ sub: user.id, username: user.username });
    return { token, user: { id: user.id, username: user.username } };
  }
}
