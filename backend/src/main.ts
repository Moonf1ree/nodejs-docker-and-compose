import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 4000);
  const allowedCors = [
    'https://moonf.nomorepartiessite.ru',
    'http://moonf.nomorepartiessite.ru',
    'https://api.moonf.nomorepartiessite.ru',
    'http://api.moonf.nomorepartiessite.ru',
    'http://localhost:8081',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: allowedCors,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.listen(port);
}
bootstrap();
