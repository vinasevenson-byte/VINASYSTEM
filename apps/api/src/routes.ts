import { randomUUID } from 'node:crypto';
import { Body, Controller, Get, Post, Patch, Param, Query, Req, BadRequestException, ConflictException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IsEmail, IsUUID, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { Db } from './db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Decimal } from '@prisma/client/runtime/library';

class RegisterDto { @IsString() @MinLength(2) name!:string; @IsEmail() email!:string; @IsString() @MinLength(12) password!:string; }
class LoginDto { @IsEmail() email!:string; @IsString() password!:string; }
class NameDto { @IsString() @IsNotEmpty() name!:string; }
class AccountDto extends NameDto { @Matches(/^\d{1,16}(\.\d{1,2})?$/) openingBalance!:string; }
class EntryDto {
 @IsUUID() profileId!:string; @IsUUID() accountId!:string;
 @IsIn(['INCOME','EXPENSE']) type!:'INCOME'|'EXPENSE';
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string;
 @IsString() @IsNotEmpty() description!:string;
 @IsISO8601() occurredAt!:string;
 @IsOptional() @IsUUID() categoryId?:string;
}
class TransferDto { @IsUUID() fromProfileId!:string; @IsUUID() fromAccountId!:string; @IsUUID() toProfileId!:string; @IsUUID() toAccountId!:string; @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string; @IsString() @IsNotEmpty() description!:string; }
@Controller('api') export class FinanceController {
 constructor(@Inject(Db) private db:Db){}
 private sign(id:string){return jwt.sign({sub:id},process.env.JWT_SECRET!,{expiresIn:'8h'});}
 private positive(v:string){const d=new Decimal(v);if(!d.isFinite()||d.lte(0))throw new BadRequestException('Valor deve ser positivo');return d;}
 private async member(userId:string,profileId:string,write=false){const m=await this.db.membership.findUnique({where:{userId_profileId:{userId,profileId}}});if(!m||write&&m.role==='VIEWER')throw new ForbiddenException('Sem permissão no perfil');return m;}
 @Get('health') health(){return {status:'ok'};}
 @Post('auth/register') async register(@Body() b:RegisterDto){const email=b.email.trim().toLowerCase();if(await this.db.user.findUnique({where:{email}}))throw new ConflictException('E-mail já cadastrado');const user=await this.db.user.create({data:{email,name:b.name,passwordHash:await bcrypt.hash(b.password,12)}});return {token:this.sign(user.id),user:{id:user.id,name:user.name,email:user.email}};}
 @Post('auth/login') async login(@Body() b:LoginDto){const user=await this.db.user.findUnique({where:{email:b.email.trim().toLowerCase()}});if(!user||!(await bcrypt.compare(b.password,user.passwordHash)))throw new ForbiddenException('Credenciais inválidas');return {token:this.sign(user.id),user:{id:user.id,name:user.name,email:user.email}};}
 @Get('profiles') async profiles(@Req() req:any){const ms=await this.db.membership.findMany({where:{userId:req.userId},include:{profile:true}});return ms.map(m=>({...m.profile,role:m.role}));}
 @Post('profiles') async newProfile(@Req() req:any,@Body() b:NameDto){return this.db.profile.create({data:{name:b.name,memberships:{create:{userId:req.userId,role:'OWNER'}}}});}
 @Get('profiles/:id/accounts') async accounts(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.account.findMany({where:{profileId:id},orderBy:{createdAt:'asc'}});}
 @Post('profiles/:id/accounts') async newAccount(@Req() req:any,@Param('id') id:string,@Body() b:AccountDto){await this.member(req.userId,id,true);return this.db.account.create({data:{profileId:id,name:b.name,openingBalance:new Decimal(b.openingBalance)}});}
 @Get('profiles/:id/entries') async entries(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.entry.findMany({where:{profileId:id},orderBy:{occurredAt:'desc'},take:100,include:{account:{select:{name:true}}}});}
 @Post('entries') async createEntry(@Req() req:any,@Body() b:EntryDto){await this.member(req.userId,b.profileId,true);this.positive(b.amount);const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:b.profileId}});if(!account)throw new BadRequestException('Conta não pertence ao perfil');if(b.categoryId&&!await this.db.category.findFirst({where:{id:b.categoryId,profileId:b.profileId,type:b.type}}))throw new BadRequestException('Categoria inválida');return this.db.entry.create({data:{...b,type:b.type,amount:new Decimal(b.amount),occurredAt:new Date(b.occurredAt)}});}
 @Post('transfers') async transfer(@Req() req:any,@Body() b:TransferDto){await this.member(req.userId,b.fromProfileId,true);await this.member(req.userId,b.toProfileId,true);if(b.fromAccountId===b.toAccountId)throw new BadRequestException('Contas devem ser diferentes');const amount=this.positive(b.amount);const accounts=await this.db.account.findMany({where:{OR:[{id:b.fromAccountId,profileId:b.fromProfileId},{id:b.toAccountId,profileId:b.toProfileId}]}});if(accounts.length!==2)throw new BadRequestException('Contas incompatíveis');const transferId=randomUUID();return this.db.$transaction(async tx=>{const occurredAt=new Date();const from=await tx.entry.create({data:{profileId:b.fromProfileId,accountId:b.fromAccountId,amount,description:b.description,occurredAt,type:'TRANSFER_OUT',transferId}});const to=await tx.entry.create({data:{profileId:b.toProfileId,accountId:b.toAccountId,amount,description:b.description,occurredAt,type:'TRANSFER_IN',transferId}});return {transferId,from,to};});}
 @Get('dashboard') async dashboard(@Req() req:any,@Query('profileId') profileId?:string){const memberships=await this.db.membership.findMany({where:{userId:req.userId}});const permitted=memberships.map(m=>m.profileId);if(profileId&&!permitted.includes(profileId))throw new ForbiddenException('Perfil sem acesso');const ids=profileId?[profileId]:permitted;
  const [accounts,entries]=await Promise.all([this.db.account.findMany({where:{profileId:{in:ids}}}),this.db.entry.findMany({where:{profileId:{in:ids},status:'POSTED'}})]);
  const opening=accounts.reduce((v,a)=>v.plus(a.openingBalance),new Decimal(0));const now=new Date();const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1));let income=new Decimal(0),expense=new Decimal(0),balance=opening;
  for(const e of entries){const signed=e.type==='INCOME'||e.type==='TRANSFER_IN'?e.amount:e.amount.negated();balance=balance.plus(signed);if(e.occurredAt>=start&&e.occurredAt<end){if(e.type==='INCOME')income=income.plus(e.amount);if(e.type==='EXPENSE')expense=expense.plus(e.amount);}}
  return {income:income.toFixed(2),expense:expense.toFixed(2),result:income.minus(expense).toFixed(2),balance:balance.toFixed(2),profileCount:ids.length,accountCount:accounts.length};
 }
}
