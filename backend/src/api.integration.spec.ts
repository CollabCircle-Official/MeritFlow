import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HealthController } from './app.controller';
import { DashboardController } from './dashboard.controller';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service';

describe('REST API integration', () => {
  let app: INestApplication;
  beforeAll(async () => { const module = await Test.createTestingModule({ controllers: [HealthController, DashboardController], providers: [{ provide: PrismaService, useValue: { $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]), syncLog: { findFirst: jest.fn().mockResolvedValue(null) } } }, { provide: AppService, useValue: { summary: jest.fn().mockResolvedValue({ totalPoints: 0, activeContributors: 0 }), leaderboard: jest.fn().mockResolvedValue([]), projects: jest.fn().mockResolvedValue([]), project: jest.fn(), member: jest.fn(), timeline: jest.fn().mockResolvedValue([]) } }] }).compile(); app = module.createNestApplication(); await app.init(); });
  afterAll(async () => app.close());
  it('returns a healthy database-first response', async () => { const response = await request(app.getHttpServer()).get('/api/health').expect(200); expect(response.body.status).toBe('ok'); expect(response.body.timezone).toBe('Asia/Dhaka'); });
  it('returns an empty-safe dashboard overview', async () => { const response = await request(app.getHttpServer()).get('/api/dashboard/overview?period=current_month').expect(200); expect(response.body.totalPoints).toBe(0); });
});
