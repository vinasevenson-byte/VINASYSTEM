import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './module';
async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Configure JWT_SECRET (32+ chars)');
  const app = await NestFactory.create(AppModule);
  app.enableCors({origin:process.env.WEB_ORIGIN || 'http://localhost:5173'});
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  await app.listen(Number(process.env.PORT || 3001));
  console.log('BOMA API disponível em http://localhost:'+(process.env.PORT||3001));
}
bootstrap();
