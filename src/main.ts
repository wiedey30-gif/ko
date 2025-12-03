import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Включаем CORS, чтобы мобильное приложение могло делать запросы
  app.enableCors(); 
  
  // Префикс для всех маршрутов API
  app.setGlobalPrefix('api/v1'); 

  await app.listen(3000);
  console.log(`Backend is running on: ${await app.getUrl()}`);
}
bootstrap();