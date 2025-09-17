import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Gateway - Task Manager')
    .setDescription('Gateway para integração dos microserviços do Task Manager')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('tasks', 'Endpoints de tarefas')
    .addTag('notifications', 'Endpoints de notificações')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3003;
  await app.listen(port);
  
  console.log(`🚀 Tasks Service running on port ${port}`);
  console.log(`📚 Swagger disponível em: http://localhost:${port}/api/docs`);


}
bootstrap();
  