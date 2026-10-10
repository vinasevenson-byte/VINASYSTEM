import { Module, Injectable, OnModuleDestroy, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { FinanceController } from './routes';
@Injectable() export class Db extends PrismaClient implements OnModuleDestroy { async onModuleDestroy(){await this.$disconnect();} }
@Injectable() export class AuthGuard implements CanActivate {
  canActivate(ctx:ExecutionContext) {
    const req=ctx.switchToHttp().getRequest();
    if(req.path==='/api/auth/login'||req.path==='/api/auth/register'||req.path==='/api/health') return true;
    try { const token=(/^Bearer [^ ]+$/.test(req.headers.authorization||'') ? req.headers.authorization.slice(7) : undefined); if(!token) throw new Error('token'); const payload=jwt.verify(token,process.env.JWT_SECRET!) as {sub:string}; if(typeof payload.sub!=='string'||!payload.sub) throw new Error('sub'); req.userId=payload.sub; return true; }
    catch {throw new UnauthorizedException('Sessão inválida ou expirada');}
  }
}
@Module({controllers:[FinanceController],providers:[Db,{provide:APP_GUARD,useClass:AuthGuard}]}) export class AppModule {}
