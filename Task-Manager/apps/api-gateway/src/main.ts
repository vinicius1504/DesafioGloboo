import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  });

  // Habilitar validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`🛡️  Rate limiting ativo: 10 req/seg global`);
  console.log(`🛡️  Auth endpoints com rate limiting específico`);
}
bootstrap();  