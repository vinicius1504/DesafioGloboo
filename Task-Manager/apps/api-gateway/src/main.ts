import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  });

  // Habilitar validação automática de DTOs
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // TODO: Add Swagger configuration once @nestjs/swagger is properly installed

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`🔗 Endpoints disponíveis em: http://localhost:${port}/api`);
  console.log(`🛡️  Rate limiting ativo: 10 req/seg global`);
  console.log(`🛡️  Auth endpoints com rate limiting específico`);
}
bootstrap();  