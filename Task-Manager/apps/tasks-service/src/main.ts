import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Tasks Service')
    .setDescription('API para gerenciamento de tarefas')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = process.env.PORT || 3003 ;
  await app.listen(port);

  console.log(`🚀 task Service running on port ${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);
}
bootstrap();
