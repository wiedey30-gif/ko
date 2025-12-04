import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FileLogger } from './file-logger'; // Импортируем наш логгер

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new FileLogger(), // <-- Включаем его здесь
  });
  
  app.enableCors(); 
  app.setGlobalPrefix('api/v1'); 

  await app.listen(3000);
  
  // Используем новый логгер и здесь
  new FileLogger().log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();