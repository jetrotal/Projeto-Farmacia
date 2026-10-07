import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Habilita o CORS para que a aplicação React (web) consiga conectar
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
