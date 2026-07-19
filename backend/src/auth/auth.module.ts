import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { Env } from '../shared/config/env';
import { AuthController } from './interfaces/auth.controller';
import { JwtAuthGuard } from './interfaces/jwt-auth.guard';
import { LoginUseCase } from './application/login.use-case';
import { PASSWORD_HASHER } from './domain/password-hasher.port';
import { TOKEN_SERVICE } from './domain/token-service.port';
import { BcryptPasswordHasher } from './infrastructure/bcrypt.password-hasher';
import { JwtTokenService } from './infrastructure/jwt.token-service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    JwtAuthGuard,
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: JwtTokenService },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
