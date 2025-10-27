import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

console.log('Seeding database: creating patients and exams...');
const firstNames = [
  'Lucas',
  'Mariana',
  'Pedro',
  'Ana',
  'João',
  'Carla',
  'Rafael',
  'Sofia',
  'Gustavo',
  'Laura',
  'Bruno',
  'Camila',
  'Matheus',
  'Isabela',
  'Felipe',
  'Marina',
  'Thiago',
  'Beatriz',
  'André',
  'Lívia',
];
const lastNames = [
  'Silva',
  'Souza',
  'Oliveira',
  'Pereira',
  'Lima',
  'Gomes',
  'Costa',
  'Ribeiro',
  'Almeida',
  'Ferreira',
];
const modalities: string[] = [
  'CR',
  'CT',
  'DX',
  'MG',
  'MR',
  'NM',
  'OT',
  'PT',
  'RF',
  'US',
  'XA',
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDateWithinLastYear() {
  const now = Date.now();
  const oneYear = 1000 * 60 * 60 * 24 * 365;
  const ts = now - Math.floor(Math.random() * oneYear);
  return new Date(ts);
}

function randomName() {
  const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
  const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${fn} ${ln}`;
}

function generateCpf(index: number) {
  // simple deterministic unique 11-digit string (not real CPF validation)
  const base = (10000000000 + index).toString();
  return base.slice(-11);
}

function uniqueIdempotencyKey(patientId: string, idx: number) {
  return `${patientId}-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function main() {
  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.exams.deleteMany({});
  await prisma.patient.deleteMany({});

  console.log('Seeding database: creating patients and exams...');

  const totalPatients = 30;

  for (let i = 0; i < totalPatients; i++) {
    const name = randomName();
    const age = randomInt(18, 90);
    const cpf = generateCpf(i + 1);

    const patient = await prisma.patient.create({
      data: {
        name,
        age,
        cpf,
      },
    });

    const examsCount = randomInt(1, 5);
    const examPromises: Promise<any>[] = [];
    for (let j = 0; j < examsCount; j++) {
      const modality =
        modalities[Math.floor(Math.random() * modalities.length)];
      const date = randomDateWithinLastYear();
      const idempotencyKey = uniqueIdempotencyKey(patient.id, j);

      examPromises.push(
        prisma.exams.create({
          data: {
            patientId: patient.id,
            // cast modality to any to avoid TypeScript enum mismatch with generated types
            modality: modality as any,
            date,
            idempotencyKey,
          },
        }),
      );
    }

    await Promise.all(examPromises);
    console.log(
      `Created patient ${i + 1}/${totalPatients}: ${patient.name} (cpf=${patient.cpf}) with ${examsCount} exams`,
    );
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
