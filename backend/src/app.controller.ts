import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';
@Controller('api/health') export class HealthController { constructor(private db:PrismaService){} @Get() async health(){let database='ok';try{await this.db.$queryRaw`SELECT 1`}catch{database='unavailable'} const last=await this.db.syncLog.findFirst({orderBy:{executedAt:'desc'}}).catch(()=>null); return {status:database==='ok'?'ok':'degraded',database,lastSync:last,timezone:'Asia/Dhaka'};} }
