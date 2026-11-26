import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
@Injectable() export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy { async onModuleInit(){await this.$connect(); await this.systemConfig.upsert({where:{id:'default'},create:{id:'default',scoringWeights:{mergedPr:4,directCommit:1.5,lowReturnCommit:.25,impactCap:3,issue:1},orgName:'CollabCircle',syncMorningCron:'0 7 * * *',syncEveningCron:'0 18 * * *'},update:{}})} async onModuleDestroy(){await this.$disconnect()} }
