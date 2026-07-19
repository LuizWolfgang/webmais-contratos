import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors();

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
