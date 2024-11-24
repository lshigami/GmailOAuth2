import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);
  app.enableCors({
    origin: 'http://localhost:5173', // Frontend port
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
