import { Body, Controller, Post } from '@nestjs/common';
import { LoginUseCase } from '../application/login.use-case';
import { LoginDto } from './dto/login.schema';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const result = await this.loginUseCase.execute(body);
    return { data: result };
  }
}
