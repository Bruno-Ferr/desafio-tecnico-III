import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Exam Controller (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testPatientId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Limpar dados de teste
    await prisma.exams.deleteMany({});
    await prisma.patient.deleteMany({});

    // Criar um paciente para os testes
    const patient = await prisma.patient.create({
      data: {
        name: 'Paciente Teste',
        age: 30,
        cpf: '12345678900',
      },
    });
    testPatientId = patient.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /exames', () => {
    it('Cenário 3: Criar exame com paciente existente e idempotencyKey nova - deve retornar HTTP 201', async () => {
      const examData = {
        patientId: testPatientId,
        modality: 'CT',
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', 'test-key-001')
        .send(examData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.patientId).toBe(testPatientId);
      expect(response.body.modality).toBe('CT');
      expect(response.body.idempotencyKey).toBe('test-key-001');
    });

    it('Cenário 4: Reenviar exame com mesma idempotencyKey - deve retornar HTTP 200 com mesmo exame', async () => {
      const examData = {
        patientId: testPatientId,
        modality: 'MR',
        date: new Date().toISOString(),
      };

      const idempotencyKey = 'test-key-duplicate-001';

      // Primeira requisição
      const firstResponse = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', idempotencyKey)
        .send(examData)
        .expect(201);

      // Segunda requisição com mesma idempotency key
      const secondResponse = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', idempotencyKey)
        .send(examData)
        .expect(201);

      // Deve retornar o mesmo exame
      expect(secondResponse.body.id).toBe(firstResponse.body.id);
      expect(secondResponse.body.idempotencyKey).toBe(idempotencyKey);
    });

    it('Cenário 5: Enviar múltiplas requisições simultâneas com mesma idempotencyKey - apenas um exame persistido', async () => {
      const examData = {
        patientId: testPatientId,
        modality: 'US',
        date: new Date().toISOString(),
      };

      const idempotencyKey = 'test-key-concurrent-001';

      // Criar 5 requisições simultâneas
      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/exames')
            .set('X-Idempotency-Key', idempotencyKey)
            .send(examData),
        );

      const responses = await Promise.all(requests);

      // Todas devem retornar sucesso
      responses.forEach((response) => {
        expect([200, 201]).toContain(response.status);
      });

      // Todas devem retornar o mesmo ID
      const ids = responses.map((r) => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(1);

      // Verificar no banco que só existe 1 exame
      const examsInDb = await prisma.exams.findMany({
        where: { idempotencyKey },
      });
      expect(examsInDb).toHaveLength(1);
    });

    it('Cenário 6: Criar exame com paciente inexistente - deve retornar erro 400 ou 500', async () => {
      const examData = {
        patientId: 'paciente-inexistente-id',
        modality: 'CR',
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', 'test-key-invalid-patient')
        .send(examData)
        .expect(500);

      expect(response.body.message).toContain('não encontrado');
    });

    it('Cenário 11: Enviar exame com modalidade inválida - deve retornar erro 400 ou 500', async () => {
      const examData = {
        patientId: testPatientId,
        modality: 'INVALID_MODALITY',
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', 'test-key-invalid-modality')
        .send(examData)
        .expect(500);

      expect(response.body.message).toContain('não é suportada');
    });

    it('Deve retornar erro 400 quando X-Idempotency-Key não é fornecido', async () => {
      const examData = {
        patientId: testPatientId,
        modality: 'CT',
        date: new Date().toISOString(),
      };

      const response = await request(app.getHttpServer())
        .post('/exames')
        .send(examData)
        .expect(400);

      expect(response.body.message).toContain('X-Idempotency-Key');
    });
  });

  describe('GET /exames', () => {
    it('Cenário 7: Listar exames com paginação (10 por página) - deve retornar paginado corretamente', async () => {
      // Criar múltiplos exames
      const modalities = ['CR', 'CT', 'DX', 'MG', 'MR', 'NM', 'OT', 'PT', 'RF', 'US', 'XA', 'CR', 'CT', 'DX', 'MG'];
      
      for (let i = 0; i < 15; i++) {
        await prisma.exams.create({
          data: {
            patientId: testPatientId,
            modality: modalities[i],
            date: new Date(),
            idempotencyKey: `test-key-pagination-${i}`,
          },
        });
      }

      // Testar primeira página
      const page1Response = await request(app.getHttpServer())
        .get('/exames?page=1&pageSize=10')
        .expect(200);

      expect(page1Response.body.items).toHaveLength(10);
      expect(page1Response.body.totalCount).toBe(15);

      // Testar segunda página
      const page2Response = await request(app.getHttpServer())
        .get('/exames?page=2&pageSize=10')
        .expect(200);

      expect(page2Response.body.items).toHaveLength(5);
      expect(page2Response.body.totalCount).toBe(15);
    });

    it('Deve retornar lista vazia quando não há exames', async () => {
      const response = await request(app.getHttpServer())
        .get('/exames?page=1&pageSize=10')
        .expect(200);

      expect(response.body.items).toHaveLength(0);
      expect(response.body.totalCount).toBe(0);
    });
  });

  describe('Cenário completo: Fluxo Paciente → Exame', () => {
    it('Deve criar paciente e depois criar exame para esse paciente', async () => {
      // 1. Criar paciente
      const patientData = {
        name: 'Carlos Oliveira',
        age: 42,
        cpf: '99988877766',
      };

      const patientResponse = await request(app.getHttpServer())
        .post('/pacientes')
        .send(patientData)
        .expect(201);

      const patientId = patientResponse.body.id;

      // 2. Criar exame para esse paciente
      const examData = {
        patientId: patientId,
        modality: 'MR',
        date: new Date().toISOString(),
      };

      const examResponse = await request(app.getHttpServer())
        .post('/exames')
        .set('X-Idempotency-Key', 'flow-test-key-001')
        .send(examData)
        .expect(201);

      expect(examResponse.body.patientId).toBe(patientId);
      expect(examResponse.body.modality).toBe('MR');

      // 3. Verificar que o exame está na lista
      const listResponse = await request(app.getHttpServer())
        .get('/exames?page=1&pageSize=10')
        .expect(200);

      expect(listResponse.body.items).toHaveLength(1);
      expect(listResponse.body.items[0].patientId).toBe(patientId);
    });
  });
});
