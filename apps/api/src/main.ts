import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './module';
async function bootstrap() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Configure JWT_SECRET (32+ chars)');
  const app = await NestFactory.create(AppModule);
  const allowed = ['http://localhost:5173','http://localhost:3000','https://vinasystem-vert.vercel.app',...(process.env.WEB_ORIGIN?process.env.WEB_ORIGIN.split(','):[])];
  app.enableCors({
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) cb(null, true);
      else cb(null, true);
    },
    credentials: true
  });
  app.useGlobalPipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true,transform:true}));
  await app.listen(Number(process.env.PORT || 3001));
  console.log('BOMA API disponível em http://localhost:'+(process.env.PORT||3001));
}
bootstrap();
