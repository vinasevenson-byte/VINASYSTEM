import { randomUUID } from 'node:crypto';
import { Body, Controller, Get, Post, Put, Patch, Delete, Param, Query, Req, BadRequestException, ConflictException, ForbiddenException, NotFoundException, Inject } from '@nestjs/common';
import { IsEmail, IsUUID, IsIn, IsISO8601, IsNotEmpty, IsOptional, IsString, MinLength, Matches, IsArray, IsInt, Min, Max } from 'class-validator';
import { Db } from './db';
import { AuditService } from './audit';
import { RateLimiterService } from './rate-limiter';
import { AdvisorService } from './advisor';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Decimal } from '@prisma/client/runtime/library';

class BenefitWalletDto { @IsString() @IsNotEmpty() name!:string; @IsIn(['MARKET','FUEL','OTHER']) kind!:'MARKET'|'FUEL'|'OTHER'; @Matches(/^\d{1,16}(\.\d{1,2})?$/) openingBalance!:string; }
class BenefitMovementDto { @IsIn(['RECHARGE','PURCHASE']) type!:'RECHARGE'|'PURCHASE'; @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string; @IsString() @IsNotEmpty() description!:string; @IsISO8601() occurredAt!:string; @IsOptional() @Matches(/^\d{4}-\d{2}$/) referenceMonth?:string; }
class IncomeScheduleDto { @IsString() @IsNotEmpty() name!:string; @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string; @IsInt() @Min(1) @Max(31) dayOfMonth!:number; @IsUUID() accountId!:string; }
class RegisterDto { @IsString() @MinLength(2) name!:string; @IsString() @IsNotEmpty() email!:string; @IsString() @MinLength(6) password!:string; }
class LoginDto { @IsString() @IsNotEmpty() email!:string; @IsString() password!:string; }
class NameDto { @IsString() @IsNotEmpty() name!:string; }
class AccountDto extends NameDto { @Matches(/^-?\d{1,16}(\.\d{1,2})?$/) openingBalance!:string; }
class EntryDto {
 @IsUUID() profileId!:string; @IsUUID() accountId!:string;
 @IsIn(['INCOME','EXPENSE']) type!:'INCOME'|'EXPENSE';
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string;
 @IsString() @IsNotEmpty() description!:string;
 @IsISO8601() occurredAt!:string;
 @IsOptional() @IsUUID() categoryId?:string;
 @IsOptional() @IsIn(['SCHEDULED','POSTED','VOID']) status?:'SCHEDULED'|'POSTED'|'VOID';
}
class CategoryDto { @IsString() @IsNotEmpty() name!:string; @IsIn(['INCOME','EXPENSE']) type!:'INCOME'|'EXPENSE'; }
class EditEntryDto { @IsUUID() accountId!:string; @IsIn(['INCOME','EXPENSE']) type!:'INCOME'|'EXPENSE'; @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string; @IsString() @IsNotEmpty() description!:string; @IsISO8601() occurredAt!:string; @IsOptional() @IsUUID() categoryId?:string; @IsIn(['SCHEDULED','POSTED','VOID']) status!:'SCHEDULED'|'POSTED'|'VOID'; }
class UpdateStatusDto { @IsIn(['SCHEDULED','POSTED','VOID']) status!:'SCHEDULED'|'POSTED'|'VOID'; }
class TransferDto { @IsUUID() fromProfileId!:string; @IsUUID() fromAccountId!:string; @IsUUID() toProfileId!:string; @IsUUID() toAccountId!:string; @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string; @IsString() @IsNotEmpty() description!:string; }
class AddMemberDto { @IsEmail() email!:string; @IsIn(['OWNER','MANAGER','EDITOR','VIEWER']) role!:'OWNER'|'MANAGER'|'EDITOR'|'VIEWER'; }
class GroupDto { @IsString() @IsNotEmpty() name!:string; @IsArray() profileIds!:string[]; }
class CreditCardDto { @IsString() @IsNotEmpty() name!:string; @Matches(/^\d{1,16}(\.\d{1,2})?$/) limit!:string; @IsInt() @Min(1) @Max(31) closingDay!:number; @IsInt() @Min(1) @Max(31) dueDay!:number; @IsOptional() @IsString() color?:string; }
class CardPurchaseDto { @IsString() @IsNotEmpty() description!:string; @Matches(/^\d{1,16}(\.\d{1,2})?$/) totalAmount!:string; @IsInt() @Min(1) @Max(48) totalInstallments!:number; @IsISO8601() purchaseDate!:string; @IsOptional() @IsUUID() categoryId?:string; }
class PayInvoiceDto { @IsUUID() accountId!:string; }
class CommitmentDto {
 @IsIn(['PAYABLE','RECEIVABLE']) type!:'PAYABLE'|'RECEIVABLE';
 @IsString() @IsNotEmpty() description!:string;
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string;
 @IsISO8601() dueDate!:string;
 @IsOptional() @IsString() entityName?:string;
 @IsOptional() @IsString() category?:string;
 @IsOptional() @IsUUID() accountId?:string;
 @IsOptional() isRecurring?:boolean;
 @IsOptional() @IsString() period?:string;
 @IsOptional() @IsString() notes?:string;
}
class SettleCommitmentDto { @IsUUID() accountId!:string; }
class GoalDto {
 @IsString() @IsNotEmpty() name!:string;
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) targetAmount!:string;
 @IsOptional() @IsISO8601() targetDate?:string;
 @IsOptional() @IsString() color?:string;
}
class DepositGoalDto {
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) amount!:string;
 @IsOptional() @IsUUID() accountId?:string;
}
class BudgetDto {
 @IsString() @Matches(/^\d{4}-\d{2}$/) referenceMonth!:string;
 @IsString() @IsNotEmpty() categoryName!:string;
 @Matches(/^\d{1,16}(\.\d{1,2})?$/) plannedAmount!:string;
}
class AdvisorQueryDto {
 @IsOptional() @IsString() question?:string;
 @IsOptional() @IsUUID() profileId?:string;
}
@Controller('api') export class FinanceController {
 constructor(@Inject(Db) private db:Db, @Inject(AuditService) private audit:AuditService, @Inject(RateLimiterService) private rateLimiter:RateLimiterService, @Inject(AdvisorService) private advisor:AdvisorService){}
 private sign(id:string){return jwt.sign({sub:id},process.env.JWT_SECRET!,{expiresIn:'8h'});}
 private positive(v:string){const d=new Decimal(v);if(!d.isFinite()||d.lte(0))throw new BadRequestException('Valor deve ser positivo');return d;}
 private async member(userId:string,profileId:string,write=false){const m=await this.db.membership.findUnique({where:{userId_profileId:{userId,profileId}}});if(!m||write&&m.role==='VIEWER')throw new ForbiddenException('Sem permissão no perfil');return m;}
 @Get('health') health(){return {status:'ok'};}
 @Get('welcome') async welcome(){
   try {
     const { get } = await import('@vercel/global-config');
     const greeting = await get('greeting');
     return { success: true, greeting: greeting || 'Bem-vindo ao VINA FINACE!', source: greeting ? 'vinasystem-global-config' : 'default' };
   } catch (e: any) {
     return { success: true, greeting: 'Bem-vindo ao VINA FINACE!', source: 'fallback', message: e?.message || 'Config pending' };
   }
 }
 @Get('audit') async auditLogs(@Req() req:any){return this.audit.getRecent(req.userId);}
 @Post('auth/register') async register(@Req() req:any,@Body() b:RegisterDto){const ip=req.ip||req.headers['x-forwarded-for']||'127.0.0.1';this.rateLimiter.check(`register:${ip}`,10,60000);const raw=b.email.trim();const email=raw.includes('@')?raw.toLowerCase():`${raw.toLowerCase()}@vina.com`;if(await this.db.user.findUnique({where:{email}}))throw new ConflictException('E-mail já cadastrado');const user=await this.db.user.create({data:{email,name:b.name,passwordHash:await bcrypt.hash(b.password,12)}});await this.audit.log({userId:user.id,action:'AUTH_REGISTER',entity:'User',entityId:user.id,ipAddress:String(ip)});return {token:this.sign(user.id),user:{id:user.id,name:user.name,email:user.email}};}
 @Post('auth/login') async login(@Req() req:any,@Body() b:LoginDto){const ip=req.ip||req.headers['x-forwarded-for']||'127.0.0.1';const loginInput=b.email.trim();const loginLower=loginInput.toLowerCase();this.rateLimiter.check(`login:${ip}:${loginLower}`,15,60000);const user=await this.db.user.findFirst({where:{OR:[{email:loginLower},{email:`${loginLower}@vina.com`},{email:`${loginLower}@finance.com`},{name:{equals:loginInput,mode:'insensitive'}}]}});const isPassValid=user&&((await bcrypt.compare(b.password,user.passwordHash))||(await bcrypt.compare(b.password.toUpperCase(),user.passwordHash))||(await bcrypt.compare(b.password.toLowerCase(),user.passwordHash)));if(!user||!isPassValid){await this.audit.log({action:'AUTH_LOGIN_FAILED',entity:'User',details:{email:loginInput},ipAddress:String(ip)});throw new ForbiddenException('Credenciais inválidas');}this.rateLimiter.reset(`login:${ip}:${loginLower}`);await this.audit.log({userId:user.id,action:'AUTH_LOGIN_SUCCESS',entity:'User',entityId:user.id,ipAddress:String(ip)});return {token:this.sign(user.id),user:{id:user.id,name:user.name,email:user.email}};}
 @Get('profiles') async profiles(@Req() req:any){const ms=await this.db.membership.findMany({where:{userId:req.userId},include:{profile:true}});return ms.map(m=>({...m.profile,role:m.role}));}
 @Post('profiles') async newProfile(@Req() req:any,@Body() b:NameDto){return this.db.profile.create({data:{name:b.name,memberships:{create:{userId:req.userId,role:'OWNER'}}}});}
 @Get('profiles/:id/members') async profileMembers(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.membership.findMany({where:{profileId:id},include:{user:{select:{id:true,name:true,email:true}}}});}
 @Post('profiles/:id/members') async addProfileMember(@Req() req:any,@Param('id') id:string,@Body() b:AddMemberDto){const current=await this.member(req.userId,id,true);if(current.role!=='OWNER'&&current.role!=='MANAGER')throw new ForbiddenException('Apenas proprietário ou gestor podem convidar membros');const targetUser=await this.db.user.findUnique({where:{email:b.email.trim().toLowerCase()}});if(!targetUser)throw new NotFoundException('Usuário não cadastrado com este e-mail');const m=await this.db.membership.upsert({where:{userId_profileId:{userId:targetUser.id,profileId:id}},update:{role:b.role},create:{userId:targetUser.id,profileId:id,role:b.role}});await this.audit.log({userId:req.userId,action:'MEMBER_INVITED',entity:'Membership',entityId:id,details:{targetEmail:b.email,role:b.role}});return m;}
 @Delete('profiles/:id/members/:userId') async removeProfileMember(@Req() req:any,@Param('id') id:string,@Param('userId') targetUserId:string){const current=await this.member(req.userId,id,true);if(current.role!=='OWNER'&&current.role!=='MANAGER')throw new ForbiddenException('Apenas proprietário ou gestor podem gerenciar membros');const target=await this.db.membership.findUnique({where:{userId_profileId:{userId:targetUserId,profileId:id}}});if(!target)throw new NotFoundException('Membro não encontrado');if(target.role==='OWNER'&&current.role!=='OWNER')throw new ForbiddenException('Não é possível remover o proprietário');await this.db.membership.delete({where:{userId_profileId:{userId:targetUserId,profileId:id}}});await this.audit.log({userId:req.userId,action:'MEMBER_REMOVED',entity:'Membership',entityId:id,details:{removedUser:targetUserId}});return {status:'removed'};}
 @Get('groups') async getGroups(@Req() req:any){return this.db.consolidationGroup.findMany({where:{userId:req.userId},orderBy:{createdAt:'desc'}});}
 @Post('groups') async createGroup(@Req() req:any,@Body() b:GroupDto){const memberships=await this.db.membership.findMany({where:{userId:req.userId}});const permitted=memberships.map(m=>m.profileId);const validIds=b.profileIds.filter(id=>permitted.includes(id));return this.db.consolidationGroup.create({data:{userId:req.userId,name:b.name,profileIds:validIds}});}
 @Get('profiles/:id/accounts') async accounts(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.account.findMany({where:{profileId:id},orderBy:{createdAt:'asc'}});}
 @Post('profiles/:id/accounts') async newAccount(@Req() req:any,@Param('id') id:string,@Body() b:AccountDto){await this.member(req.userId,id,true);return this.db.account.create({data:{profileId:id,name:b.name,openingBalance:new Decimal(b.openingBalance)}});}
 @Get('profiles/:id/entries') async entries(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.entry.findMany({where:{profileId:id},orderBy:{occurredAt:'desc'},take:100,include:{account:{select:{name:true}}}});}
 @Post('entries') async createEntry(@Req() req:any,@Body() b:EntryDto){await this.member(req.userId,b.profileId,true);this.positive(b.amount);const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:b.profileId}});if(!account)throw new BadRequestException('Conta não pertence ao perfil');if(b.categoryId&&!await this.db.category.findFirst({where:{id:b.categoryId,profileId:b.profileId,type:b.type}}))throw new BadRequestException('Categoria inválida');return this.db.entry.create({data:{...b,type:b.type,status:b.status||'POSTED',amount:new Decimal(b.amount),occurredAt:new Date(b.occurredAt)}});}
 @Patch('entries/:id/status') async updateEntryStatus(@Req() req:any,@Param('id') id:string,@Body() b:UpdateStatusDto){const entry=await this.db.entry.findUnique({where:{id}});if(!entry)throw new NotFoundException('Lançamento não encontrado');await this.member(req.userId,entry.profileId,true);const updated=await this.db.entry.update({where:{id},data:{status:b.status}});await this.audit.log({userId:req.userId,action:'ENTRY_STATUS_UPDATED',entity:'Entry',entityId:id,details:{fromStatus:entry.status,toStatus:b.status}});return updated;}
 @Post('entries/:id/reconcile') async reconcileEntry(@Req() req:any,@Param('id') id:string){const entry=await this.db.entry.findUnique({where:{id}});if(!entry)throw new NotFoundException('Lançamento não encontrado');await this.member(req.userId,entry.profileId,true);const updated=await this.db.entry.update({where:{id},data:{reconciled:true,reconciledAt:new Date()}});await this.audit.log({userId:req.userId,action:'ENTRY_RECONCILED',entity:'Entry',entityId:id});return updated;}
 @Get('profiles/:id/categories') async categories(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.category.findMany({where:{profileId:id},orderBy:[{type:'asc'},{name:'asc'}]});}
 @Post('profiles/:id/categories') async addCategory(@Req() req:any,@Param('id') id:string,@Body() b:CategoryDto){await this.member(req.userId,id,true);const name=b.name.trim();if(!name)throw new BadRequestException('Informe o nome da categoria');const exists=await this.db.category.findFirst({where:{profileId:id,type:b.type,name:{equals:name,mode:'insensitive'}}});if(exists)throw new ConflictException('Já existe uma categoria com esse nome e tipo');const created=await this.db.category.create({data:{profileId:id,name,type:b.type}});await this.audit.log({userId:req.userId,action:'CATEGORY_CREATED',entity:'Category',entityId:created.id});return created;}
 @Patch('entries/:id') async editEntry(@Req() req:any,@Param('id') id:string,@Body() b:EditEntryDto){const previous=await this.db.entry.findUnique({where:{id}});if(!previous)throw new NotFoundException('Lançamento não encontrado');await this.member(req.userId,previous.profileId,true);if(previous.transferId||!['INCOME','EXPENSE'].includes(previous.type))throw new BadRequestException('Transferências não podem ser editadas isoladamente');if(previous.reconciled)throw new BadRequestException('Desfaça a conciliação antes de editar');this.positive(b.amount);const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:previous.profileId}});if(!account)throw new BadRequestException('Conta não pertence ao perfil');if(b.categoryId&&!await this.db.category.findFirst({where:{id:b.categoryId,profileId:previous.profileId,type:b.type}}))throw new BadRequestException('Categoria inválida');const updated=await this.db.entry.update({where:{id},data:{accountId:b.accountId,type:b.type,status:b.status,amount:new Decimal(b.amount),description:b.description,occurredAt:new Date(b.occurredAt),categoryId:b.categoryId||null}});await this.audit.log({userId:req.userId,action:'ENTRY_EDITED',entity:'Entry',entityId:id,details:{previous:{amount:previous.amount.toString(),description:previous.description,status:previous.status},updated:{amount:b.amount,description:b.description,status:b.status}}});return updated;}
 @Delete('entries/:id') async deleteEntry(@Req() req:any,@Param('id') id:string){const entry=await this.db.entry.findUnique({where:{id}});if(!entry)throw new NotFoundException('Lançamento não encontrado');await this.member(req.userId,entry.profileId,true);if(entry.transferId){await this.db.entry.deleteMany({where:{transferId:entry.transferId}});}else{await this.db.entry.delete({where:{id}});}await this.audit.log({userId:req.userId,action:'ENTRY_DELETED',entity:'Entry',entityId:id,details:{description:entry.description,amount:entry.amount.toString()}});return {success:true,deletedId:id};}
 @Post('transfers') async transfer(@Req() req:any,@Body() b:TransferDto){await this.member(req.userId,b.fromProfileId,true);await this.member(req.userId,b.toProfileId,true);if(b.fromAccountId===b.toAccountId)throw new BadRequestException('Contas devem ser diferentes');const amount=this.positive(b.amount);const accounts=await this.db.account.findMany({where:{OR:[{id:b.fromAccountId,profileId:b.fromProfileId},{id:b.toAccountId,profileId:b.toProfileId}]}});if(accounts.length!==2)throw new BadRequestException('Contas incompatíveis');const transferId=randomUUID();return this.db.$transaction(async tx=>{const occurredAt=new Date();const from=await tx.entry.create({data:{profileId:b.fromProfileId,accountId:b.fromAccountId,amount,description:b.description,occurredAt,type:'TRANSFER_OUT',transferId}});const to=await tx.entry.create({data:{profileId:b.toProfileId,accountId:b.toAccountId,amount,description:b.description,occurredAt,type:'TRANSFER_IN',transferId}});return {transferId,from,to};});}
 @Get('profiles/:id/cards') async profileCards(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);const cards=await this.db.creditCard.findMany({where:{profileId:id},include:{invoices:{where:{status:'OPEN'}}},orderBy:{createdAt:'asc'}});return cards.map(c=>{const currentInvoice=c.invoices[0]||null;const used=currentInvoice?currentInvoice.totalAmount:new Decimal(0);const avail=c.limit.minus(used);return {...c,currentInvoice,availableLimit:avail.isNegative()?'0.00':avail.toFixed(2)};});}
 @Post('profiles/:id/cards') async createCard(@Req() req:any,@Param('id') id:string,@Body() b:CreditCardDto){await this.member(req.userId,id,true);const limit=this.positive(b.limit);const card=await this.db.creditCard.create({data:{profileId:id,name:b.name,limit,closingDay:b.closingDay,dueDay:b.dueDay,color:b.color}});const now=new Date();const refMonth=`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;const closingDate=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),b.closingDay));const dueDate=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,b.dueDay));await this.db.invoice.create({data:{cardId:card.id,profileId:id,referenceMonth:refMonth,closingDate,dueDate,status:'OPEN'}});await this.audit.log({userId:req.userId,action:'CREDIT_CARD_CREATED',entity:'CreditCard',entityId:card.id,details:{name:b.name,limit:b.limit}});return card;}
 @Post('cards/:id/purchases') async createPurchase(@Req() req:any,@Param('id') cardId:string,@Body() b:CardPurchaseDto){const card=await this.db.creditCard.findUnique({where:{id:cardId}});if(!card)throw new NotFoundException('Cartão de crédito não encontrado');await this.member(req.userId,card.profileId,true);const totalAmount=this.positive(b.totalAmount);const pDate=new Date(b.purchaseDate);const installmentAmt=totalAmount.dividedBy(b.totalInstallments).toDecimalPlaces(2);const purchases=[];for(let i=1;i<=b.totalInstallments;i++){const instMonthDate=new Date(Date.UTC(pDate.getUTCFullYear(),pDate.getUTCMonth()+i-1,1));const refMonth=`${instMonthDate.getUTCFullYear()}-${String(instMonthDate.getUTCMonth()+1).padStart(2,'0')}`;const closingDate=new Date(Date.UTC(instMonthDate.getUTCFullYear(),instMonthDate.getUTCMonth(),card.closingDay));const dueDate=new Date(Date.UTC(instMonthDate.getUTCFullYear(),instMonthDate.getUTCMonth()+1,card.dueDay));let invoice=await this.db.invoice.findUnique({where:{cardId_referenceMonth:{cardId:card.id,referenceMonth:refMonth}}});if(!invoice){invoice=await this.db.invoice.create({data:{cardId:card.id,profileId:card.profileId,referenceMonth:refMonth,closingDate,dueDate,status:'OPEN'}});}const p=await this.db.cardPurchase.create({data:{cardId:card.id,profileId:card.profileId,invoiceId:invoice.id,description:b.totalInstallments>1?`${b.description} (${i}/${b.totalInstallments})`:b.description,amount:installmentAmt,totalAmount,installmentNumber:i,totalInstallments:b.totalInstallments,purchaseDate:pDate,categoryId:b.categoryId}});await this.db.invoice.update({where:{id:invoice.id},data:{totalAmount:invoice.totalAmount.plus(installmentAmt)}});purchases.push(p);}await this.audit.log({userId:req.userId,action:'CARD_PURCHASE_REGISTERED',entity:'CardPurchase',entityId:cardId,details:{description:b.description,totalAmount:b.totalAmount,installments:b.totalInstallments}});return {installmentsCreated:purchases.length,purchases};}
 @Get('cards/:id/invoices') async cardInvoices(@Req() req:any,@Param('id') cardId:string){const card=await this.db.creditCard.findUnique({where:{id:cardId}});if(!card)throw new NotFoundException('Cartão não encontrado');await this.member(req.userId,card.profileId);return this.db.invoice.findMany({where:{cardId},include:{purchases:true},orderBy:{dueDate:'asc'}});}
  @Post('cards/invoices/:id/pay') async payInvoice(@Req() req:any,@Param('id') invoiceId:string,@Body() b:PayInvoiceDto){const invoice=await this.db.invoice.findUnique({where:{id:invoiceId},include:{card:true}});if(!invoice)throw new NotFoundException('Fatura não encontrada');await this.member(req.userId,invoice.profileId,true);const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:invoice.profileId}});if(!account)throw new BadRequestException('Conta bancária inválida para este perfil');const payment=await this.db.$transaction(async tx=>{const entry=await tx.entry.create({data:{profileId:invoice.profileId,accountId:account.id,type:'EXPENSE',status:'POSTED',amount:invoice.totalAmount,description:`Pagamento Fatura ${invoice.card.name} (${invoice.referenceMonth})`,occurredAt:new Date()}});const updatedInvoice=await tx.invoice.update({where:{id:invoiceId},data:{status:'PAID',paidAmount:invoice.totalAmount}});return {entry,invoice:updatedInvoice};});await this.audit.log({userId:req.userId,action:'INVOICE_PAID',entity:'Invoice',entityId:invoiceId,details:{card:invoice.card.name,amount:invoice.totalAmount.toString(),accountId:account.id}});return payment;}
  @Get('cards/invoices/:id/late-fees') async invoiceLateFees(@Req() req:any,@Param('id') invoiceId:string,@Query('simulatedDate') simulatedDate?:string,@Query('revolvingRate') customRate?:string){const invoice=await this.db.invoice.findUnique({where:{id:invoiceId},include:{card:true}});if(!invoice)throw new NotFoundException('Fatura não encontrada');await this.member(req.userId,invoice.profileId);const totalAmount=invoice.totalAmount;const dueDate=new Date(invoice.dueDate);const payDate=simulatedDate?new Date(simulatedDate):new Date();const diffTime=payDate.getTime()-dueDate.getTime();const daysLate=Math.max(0,Math.ceil(diffTime/(1000*60*60*24)));const fineAmount=daysLate>0?totalAmount.times(new Decimal(0.02)).toDecimalPlaces(2):new Decimal(0);const moraDailyRate=new Decimal(0.01).dividedBy(30);const moraAmount=daysLate>0?totalAmount.times(moraDailyRate).times(daysLate).toDecimalPlaces(2):new Decimal(0);const monthlyRate=customRate?new Decimal(customRate).dividedBy(100):new Decimal(0.12);const rotativoDailyRate=monthlyRate.dividedBy(30);const rotativoAmount=daysLate>0?totalAmount.times(rotativoDailyRate).times(daysLate).toDecimalPlaces(2):new Decimal(0);const iofFixed=daysLate>0?totalAmount.times(new Decimal(0.0038)).toDecimalPlaces(2):new Decimal(0);const iofDaily=daysLate>0?totalAmount.times(new Decimal(0.000082)).times(daysLate).toDecimalPlaces(2):new Decimal(0);const iofTotal=iofFixed.plus(iofDaily).toDecimalPlaces(2);const totalFees=fineAmount.plus(moraAmount).plus(rotativoAmount).plus(iofTotal).toDecimalPlaces(2);const totalWithFees=totalAmount.plus(totalFees).toDecimalPlaces(2);return {invoiceId:invoice.id,cardName:invoice.card.name,referenceMonth:invoice.referenceMonth,originalAmount:totalAmount.toFixed(2),dueDate:dueDate.toISOString(),simulatedDate:payDate.toISOString(),daysLate,fineAmount:fineAmount.toFixed(2),moraAmount:moraAmount.toFixed(2),rotativoAmount:rotativoAmount.toFixed(2),iofAmount:iofTotal.toFixed(2),totalFees:totalFees.toFixed(2),totalWithFees:totalWithFees.toFixed(2),status:invoice.status};}
 @Get('dashboard') async dashboard(@Req() req:any,@Query('profileId') profileId?:string){const memberships=await this.db.membership.findMany({where:{userId:req.userId}});const permitted=memberships.map(m=>m.profileId);if(profileId&&!permitted.includes(profileId))throw new ForbiddenException('Perfil sem acesso');const ids=profileId?[profileId]:permitted;
  const [accounts,entries]=await Promise.all([this.db.account.findMany({where:{profileId:{in:ids}}}),this.db.entry.findMany({where:{profileId:{in:ids}}})]);
  const opening=accounts.reduce((v,a)=>v.plus(a.openingBalance),new Decimal(0));const now=new Date();const start=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));const end=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1));let income=new Decimal(0),expense=new Decimal(0),balance=opening,projectedBalance=opening,scheduledIncome=new Decimal(0),scheduledExpense=new Decimal(0);
  for(const e of entries){if(e.status==='VOID')continue;const signed=e.type==='INCOME'||e.type==='TRANSFER_IN'?e.amount:e.amount.negated();if(e.status==='POSTED'){balance=balance.plus(signed);projectedBalance=projectedBalance.plus(signed);if(e.occurredAt>=start&&e.occurredAt<end){if(e.type==='INCOME')income=income.plus(e.amount);if(e.type==='EXPENSE')expense=expense.plus(e.amount);}}else if(e.status==='SCHEDULED'){projectedBalance=projectedBalance.plus(signed);if(e.occurredAt>=start&&e.occurredAt<end){if(e.type==='INCOME')scheduledIncome=scheduledIncome.plus(e.amount);if(e.type==='EXPENSE')scheduledExpense=scheduledExpense.plus(e.amount);}}}
  return {income:income.toFixed(2),expense:expense.toFixed(2),result:income.minus(expense).toFixed(2),balance:balance.toFixed(2),projectedBalance:projectedBalance.toFixed(2),scheduledIncome:scheduledIncome.toFixed(2),scheduledExpense:scheduledExpense.toFixed(2),profileCount:ids.length,accountCount:accounts.length};
 }
 @Get('profiles/:id/commitments') async profileCommitments(@Req() req:any,@Param('id') id:string,@Query('status') status?:string){
  await this.member(req.userId,id);
  return this.db.commitment.findMany({where:{profileId:id,...(status?{status:status as any}:{})},orderBy:{dueDate:'asc'}});
 }
 @Post('profiles/:id/commitments') async createCommitment(@Req() req:any,@Param('id') id:string,@Body() b:CommitmentDto){
  await this.member(req.userId,id,true);
  const amount=this.positive(b.amount);
  return this.db.commitment.create({data:{profileId:id,type:b.type,description:b.description,amount,dueDate:new Date(b.dueDate),entityName:b.entityName,category:b.category,accountId:b.accountId,isRecurring:!!b.isRecurring,period:b.period||'MONTHLY',notes:b.notes}});
 }
 @Post('commitments/:id/settle') async settleCommitment(@Req() req:any,@Param('id') id:string,@Body() b:SettleCommitmentDto){
  const comm=await this.db.commitment.findUnique({where:{id}});
  if(!comm)throw new NotFoundException('Compromisso não encontrado');
  await this.member(req.userId,comm.profileId,true);
  const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:comm.profileId}});
  if(!account)throw new BadRequestException('Conta inválida para este perfil');
  return this.db.$transaction(async tx=>{
   const entryType=comm.type==='PAYABLE'?'EXPENSE':'INCOME';
   const entry=await tx.entry.create({data:{profileId:comm.profileId,accountId:account.id,type:entryType,status:'POSTED',amount:comm.amount,description:`Liquidação: ${comm.description}`,occurredAt:new Date()}});
   const updated=await tx.commitment.update({where:{id},data:{status:'PAID',paidAt:new Date(),accountId:account.id}});
   return {commitment:updated,entry};
  });
 }
 @Delete('commitments/:id') async deleteCommitment(@Req() req:any,@Param('id') id:string){
  const comm=await this.db.commitment.findUnique({where:{id}});
  if(!comm)throw new NotFoundException('Compromisso não encontrado');
  await this.member(req.userId,comm.profileId,true);
  await this.db.commitment.delete({where:{id}});
  return {status:'deleted'};
 }
 @Get('profiles/:id/goals') async profileGoals(@Req() req:any,@Param('id') id:string){
  await this.member(req.userId,id);
  const goals=await this.db.financialGoal.findMany({where:{profileId:id},orderBy:{createdAt:'asc'}});
  return goals.map(g=>{
   const progress=g.targetAmount.gt(0)?g.currentAmount.dividedBy(g.targetAmount).times(100).toDecimalPlaces(1).toNumber():0;
   return {...g,progress:Math.min(100,progress)};
  });
 }
 @Post('profiles/:id/goals') async createGoal(@Req() req:any,@Param('id') id:string,@Body() b:GoalDto){
  await this.member(req.userId,id,true);
  const targetAmount=this.positive(b.targetAmount);
  return this.db.financialGoal.create({data:{profileId:id,name:b.name,targetAmount,targetDate:b.targetDate?new Date(b.targetDate):null,color:b.color||'#10B981'}});
 }
 @Post('goals/:id/deposit') async depositGoal(@Req() req:any,@Param('id') id:string,@Body() b:DepositGoalDto){
  const goal=await this.db.financialGoal.findUnique({where:{id}});
  if(!goal)throw new NotFoundException('Meta não encontrada');
  await this.member(req.userId,goal.profileId,true);
  const amount=this.positive(b.amount);
  return this.db.$transaction(async tx=>{
   if(b.accountId){
    const acc=await tx.account.findFirst({where:{id:b.accountId,profileId:goal.profileId}});
    if(!acc)throw new BadRequestException('Conta bancária não encontrada no perfil');
    await tx.entry.create({data:{profileId:goal.profileId,accountId:acc.id,type:'EXPENSE',status:'POSTED',amount,description:`Aporte Meta: ${goal.name}`,occurredAt:new Date()}});
   }
   const newTotal=goal.currentAmount.plus(amount);
   const isCompleted=newTotal.gte(goal.targetAmount);
   return tx.financialGoal.update({where:{id},data:{currentAmount:newTotal,status:isCompleted?'COMPLETED':goal.status}});
  });
 }
 @Get('profiles/:id/budgets') async profileBudgets(@Req() req:any,@Param('id') id:string,@Query('month') month?:string){
  await this.member(req.userId,id);
  const now=new Date();
  const refMonth=month||`${now.getUTCFullYear()}-${String(now.getUTCMonth()+1).padStart(2,'0')}`;
  const budgets=await this.db.budget.findMany({where:{profileId:id,referenceMonth:refMonth}});
  const entries=await this.db.entry.findMany({where:{profileId:id,type:'EXPENSE',status:'POSTED'},include:{category:true}});
  return budgets.map(b=>{
   const spent=entries.filter(e=>e.category?.name===b.categoryName||e.description.toLowerCase().includes(b.categoryName.toLowerCase())).reduce((sum,e)=>sum.plus(e.amount),new Decimal(0));
   const pct=b.plannedAmount.gt(0)?spent.dividedBy(b.plannedAmount).times(100).toDecimalPlaces(1).toNumber():0;
   return {...b,spentAmount:spent.toFixed(2),percentageUsed:pct};
  });
 }
 @Post('profiles/:id/budgets') async createOrUpdateBudget(@Req() req:any,@Param('id') id:string,@Body() b:BudgetDto){
  await this.member(req.userId,id,true);
  const planned=this.positive(b.plannedAmount);
  return this.db.budget.upsert({where:{profileId_referenceMonth_categoryName:{profileId:id,referenceMonth:b.referenceMonth,categoryName:b.categoryName}},update:{plannedAmount:planned},create:{profileId:id,referenceMonth:b.referenceMonth,categoryName:b.categoryName,plannedAmount:planned}});
 }
 @Get('reports/cashflow') async cashflowReport(@Req() req:any,@Query('profileId') profileId?:string){
  const memberships=await this.db.membership.findMany({where:{userId:req.userId}});
  const permitted=memberships.map(m=>m.profileId);
  if(profileId&&!permitted.includes(profileId))throw new ForbiddenException('Perfil sem acesso');
  const ids=profileId?[profileId]:permitted;
  const [entries,commitments,invoices]=await Promise.all([
   this.db.entry.findMany({where:{profileId:{in:ids}}}),
   this.db.commitment.findMany({where:{profileId:{in:ids},status:'PENDING'}}),
   this.db.invoice.findMany({where:{profileId:{in:ids},status:'OPEN'}})
  ]);
  const monthsData:Record<string,{income:Decimal,expense:Decimal,obligations:Decimal}>={};
  const now=new Date();
  for(let i=-2;i<=3;i++){
   const d=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+i,1));
   const key=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`;
   monthsData[key]={income:new Decimal(0),expense:new Decimal(0),obligations:new Decimal(0)};
  }
  for(const e of entries){
   if(e.status==='VOID')continue;
   const key=`${e.occurredAt.getUTCFullYear()}-${String(e.occurredAt.getUTCMonth()+1).padStart(2,'0')}`;
   if(monthsData[key]){
    if(e.type==='INCOME')monthsData[key].income=monthsData[key].income.plus(e.amount);
    if(e.type==='EXPENSE')monthsData[key].expense=monthsData[key].expense.plus(e.amount);
   }
  }
  for(const c of commitments){
   const key=`${c.dueDate.getUTCFullYear()}-${String(c.dueDate.getUTCMonth()+1).padStart(2,'0')}`;
   if(monthsData[key]){
    if(c.type==='PAYABLE')monthsData[key].obligations=monthsData[key].obligations.plus(c.amount);
    if(c.type==='RECEIVABLE')monthsData[key].income=monthsData[key].income.plus(c.amount);
   }
  }
  for(const inv of invoices){
   if(monthsData[inv.referenceMonth]){
    monthsData[inv.referenceMonth].obligations=monthsData[inv.referenceMonth].obligations.plus(inv.totalAmount);
   }
  }
  return Object.entries(monthsData).map(([month,data])=>({
   month,
   income:data.income.toFixed(2),
   expense:data.expense.toFixed(2),
   obligations:data.obligations.toFixed(2),
   net:data.income.minus(data.expense).minus(data.obligations).toFixed(2)
  }));
 }
 @Get('reports/export') async exportReport(@Req() req:any,@Query('profileId') profileId?:string){
  const memberships=await this.db.membership.findMany({where:{userId:req.userId}});
  const permitted=memberships.map(m=>m.profileId);
  if(profileId&&!permitted.includes(profileId))throw new ForbiddenException('Perfil sem acesso');
  const ids=profileId?[profileId]:permitted;
  const entries=await this.db.entry.findMany({where:{profileId:{in:ids}},include:{account:true,profile:true},orderBy:{occurredAt:'desc'}});
  const header='ID,Data,Perfil,Conta,Tipo,Status,Descricao,Valor(R$),Conciliado\n';
  const rows=entries.map(e=>`"${e.id}","${e.occurredAt.toISOString()}","${e.profile.name}","${e.account.name}","${e.type}","${e.status}","${e.description.replace(/"/g,'""')}","${e.amount.toFixed(2)}","${e.reconciled?'Sim':'Não'}"`).join('\n');
  return {csv:header+rows,totalRecords:entries.length};
 }
 @Post('ai/advisor') async aiAdvisor(@Req() req:any,@Body() b:AdvisorQueryDto){
  const memberships=await this.db.membership.findMany({where:{userId:req.userId}});
  const permitted=memberships.map(m=>m.profileId);
  const targetProfileId=b.profileId||permitted[0];
  if(!targetProfileId||!permitted.includes(targetProfileId))throw new ForbiddenException('Perfil não autorizado');
  const profile=await this.db.profile.findUnique({where:{id:targetProfileId}});
  if(!profile)throw new NotFoundException('Perfil não encontrado');

  const [accounts,entries,commitments,invoices,goals]=await Promise.all([
   this.db.account.findMany({where:{profileId:targetProfileId}}),
   this.db.entry.findMany({where:{profileId:targetProfileId}}),
   this.db.commitment.findMany({where:{profileId:targetProfileId,status:'PENDING'}}),
   this.db.invoice.findMany({where:{profileId:targetProfileId,status:'OPEN'}}),
   this.db.financialGoal.findMany({where:{profileId:targetProfileId}})
  ]);

  const opening=accounts.reduce((v,a)=>v.plus(a.openingBalance),new Decimal(0));
  let balance=opening;
  const now=new Date();
  const startMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),1));
  const endMonth=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()+1,1));
  const next30=new Date(Date.now()+30*86400000);
  const next90=new Date(Date.now()+90*86400000);

  let monthlyIncome=new Decimal(0), monthlyExpense=new Decimal(0);
  for(const e of entries){
   if(e.status==='VOID')continue;
   const signed=e.type==='INCOME'||e.type==='TRANSFER_IN'?e.amount:e.amount.negated();
   if(e.status==='POSTED')balance=balance.plus(signed);
   if(e.occurredAt>=startMonth&&e.occurredAt<endMonth){
    if(e.type==='INCOME')monthlyIncome=monthlyIncome.plus(e.amount);
    if(e.type==='EXPENSE')monthlyExpense=monthlyExpense.plus(e.amount);
   }
  }

  let pending30=new Decimal(0), pending90Pay=new Decimal(0), pending90Rec=new Decimal(0);
  for(const c of commitments){
   if(c.dueDate<=next30&&c.type==='PAYABLE')pending30=pending30.plus(c.amount);
   if(c.dueDate<=next90){
    if(c.type==='PAYABLE')pending90Pay=pending90Pay.plus(c.amount);
    if(c.type==='RECEIVABLE')pending90Rec=pending90Rec.plus(c.amount);
   }
  }

  const openInvoiceAmount=invoices.reduce((sum,inv)=>sum.plus(inv.totalAmount),new Decimal(0));
  const totalSavedInGoals=goals.reduce((sum,g)=>sum.plus(g.currentAmount),new Decimal(0));

  return this.advisor.analyze({
   profileName:profile.name,
   totalLiquidBalance:balance,
   monthlyIncome,
   monthlyExpense,
   pendingPayablesNext30Days:pending30,
   pendingPayablesNext90Days:pending90Pay,
   pendingReceivablesNext90Days:pending90Rec,
   openInvoiceAmount,
   totalCardLimit:new Decimal(0),
   goalsCount:goals.length,
   totalSavedInGoals
  },b.question);
 }

  // MEU FINANCEIRO DIÁRIO — os saldos vêm exclusivamente do banco real.
  @Get('profiles/:id/benefits') async benefitWallets(@Req() req:any,@Param('id') id:string){
   await this.member(req.userId,id);
   const wallets=await this.db.benefitWallet.findMany({where:{profileId:id},include:{movements:{orderBy:{occurredAt:'desc'}}},orderBy:{createdAt:'asc'}});
   return wallets.map(w=>{const balance=w.movements.reduce((sum,m)=>sum.plus(m.type==='PURCHASE'?m.amount.negated():m.amount),w.openingBalance);return {...w,balance:balance.toFixed(2)};});
  }
  @Post('profiles/:id/benefits') async createBenefitWallet(@Req() req:any,@Param('id') id:string,@Body() b:BenefitWalletDto){
   await this.member(req.userId,id,true);
   const balance=new Decimal(b.openingBalance);
   return this.db.benefitWallet.create({data:{profileId:id,name:b.name,kind:b.kind,openingBalance:balance}});
  }
  @Post('benefits/:id/movements') async benefitMovement(@Req() req:any,@Param('id') id:string,@Body() b:BenefitMovementDto){
   const wallet=await this.db.benefitWallet.findUnique({where:{id}});
   if(!wallet)throw new NotFoundException('Benefício não encontrado');
   await this.member(req.userId,wallet.profileId,true);
   const amount=this.positive(b.amount);
   if(b.type==='PURCHASE'&&b.referenceMonth)throw new BadRequestException('Referência mensal é exclusiva para recargas');
   if(b.type==='RECHARGE'&&b.referenceMonth&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(b.referenceMonth))throw new BadRequestException('Mês inválido');
   return this.db.$transaction(async tx=>{
    // Serializa movimentações desta carteira para não permitir saldo negativo por concorrência.
    await tx.$queryRaw`SELECT id FROM "BenefitWallet" WHERE id = ${id}::uuid FOR UPDATE`;
    if(b.type==='PURCHASE'){
     const movements=await tx.benefitMovement.findMany({where:{walletId:id}});
     const balance=movements.reduce((v,m)=>v.plus(m.type==='PURCHASE'?m.amount.negated():m.amount),wallet.openingBalance);
     if(balance.lt(amount))throw new BadRequestException('Saldo do benefício insuficiente');
    }
    const movement=await tx.benefitMovement.create({data:{walletId:id,type:b.type,amount,description:b.description,occurredAt:new Date(b.occurredAt),referenceMonth:b.type==='RECHARGE'?(b.referenceMonth||null):null}});
    return movement;
   });
  }
  @Get('profiles/:id/income-schedules') async incomeSchedules(@Req() req:any,@Param('id') id:string){await this.member(req.userId,id);return this.db.incomeSchedule.findMany({where:{profileId:id,active:true},orderBy:{dayOfMonth:'asc'}});}
  @Post('profiles/:id/income-schedules') async addIncomeSchedule(@Req() req:any,@Param('id') id:string,@Body() b:IncomeScheduleDto){
   await this.member(req.userId,id,true);
   const account=await this.db.account.findFirst({where:{id:b.accountId,profileId:id}});
   if(!account)throw new BadRequestException('Conta de recebimento inválida');
   const amount=this.positive(b.amount);
   return this.db.incomeSchedule.create({data:{profileId:id,name:b.name,amount,dayOfMonth:b.dayOfMonth,accountId:b.accountId}});
  }
  @Delete('income-schedules/:id') async removeIncomeSchedule(@Req() req:any,@Param('id') id:string){
   const item=await this.db.incomeSchedule.findUnique({where:{id}});
   if(!item)throw new NotFoundException('Agendamento não encontrado');
   await this.member(req.userId,item.profileId,true);
   return this.db.incomeSchedule.update({where:{id},data:{active:false}});
  }
  @Get('profiles/:id/daily-summary') async dailySummary(@Req() req:any,@Param('id') id:string,@Query('days') rawDays?:string){
   await this.member(req.userId,id);
   const days=Math.min(90,Math.max(7,Number(rawDays)||30));
   const end=new Date();const start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate()-days+1));
   const [entries,benefits]=await Promise.all([
    this.db.entry.findMany({where:{profileId:id,status:'POSTED',type:'EXPENSE',occurredAt:{gte:start,lte:end}},select:{amount:true,occurredAt:true}}),
    this.db.benefitMovement.findMany({where:{wallet:{profileId:id},type:'PURCHASE',occurredAt:{gte:start,lte:end}},select:{amount:true,occurredAt:true}})
   ]);
   const points=[] as {date:string,expense:string,count:number}[];
   for(let i=0;i<days;i++){const dt=new Date(start.getTime()+i*86400000);const key=dt.toISOString().slice(0,10);const same=entries.filter(e=>e.occurredAt.toISOString().slice(0,10)===key);const fromBenefits=benefits.filter(e=>e.occurredAt.toISOString().slice(0,10)===key);points.push({date:key,expense:[...same,...fromBenefits].reduce((a,e)=>a.plus(e.amount),new Decimal(0)).toFixed(2),count:same.length+fromBenefits.length});}
   const registered=points.filter(p=>p.count>0);
   const sorted=[...registered].sort((a,b)=>Number(b.expense)-Number(a.expense));
   return {days,points,highest:sorted[0]||null,lowest:sorted[sorted.length-1]||null,hasHistory:registered.length>0};
  }

  @Post('system/reset')
  async resetSystem(@Req() req: any) {
    await this.db.auditLog.deleteMany({});
    await this.db.benefitMovement.deleteMany({});
    await this.db.benefitWallet.deleteMany({});
    await this.db.incomeSchedule.deleteMany({});
    await this.db.cardPurchase.deleteMany({});
    await this.db.invoice.deleteMany({});
    await this.db.creditCard.deleteMany({});
    await this.db.entry.deleteMany({});
    await this.db.commitment.deleteMany({});
    await this.db.financialGoal.deleteMany({});
    await this.db.budget.deleteMany({});
    await this.db.account.deleteMany({});
    await this.db.consolidationGroup.deleteMany({});
    return { success: true, message: 'Sistema zerado com sucesso.' };
  }
}
