# Guia de Testes - Desafio Técnico III

## 📋 Cenários de Teste Implementados

Este documento descreve todos os cenários de teste implementados para a aplicação de cadastro de pacientes e exames médicos.

## 🧪 Tipos de Testes

### 1. Testes Unitários (Services)
- **Localização**: `src/patient/patient.service.spec.ts` e `src/exam/exam.service.spec.ts`
- **Objetivo**: Testar a lógica de negócio isoladamente

### 2. Testes de Integração (E2E)
- **Localização**: `test/patient.e2e-spec.ts` e `test/exam.e2e-spec.ts`
- **Objetivo**: Testar os endpoints REST completos

## 🚀 Como Executar os Testes

### Testes Unitários
```bash
cd backend
npm test
```

### Testes E2E (Integração)
```bash
cd backend
npm run test:e2e
```

### Cobertura de Código
```bash
cd backend
npm run test:cov
```

### Modo Watch (desenvolvimento)
```bash
cd backend
npm run test:watch
```

## ✅ Cenários Implementados

### Pacientes (Patient)

#### Cenário 1: Criar paciente com dados válidos
- **Arquivo**: `test/patient.e2e-spec.ts`
- **Teste**: "Criar paciente com dados válidos - deve salvar com UUID único"
- **Critério**: Paciente deve ser criado com sucesso e retornar ID único
- **Status**: ✅ Implementado

#### Cenário 2: Criar paciente com CPF já existente
- **Arquivo**: `test/patient.e2e-spec.ts`
- **Teste**: "Criar paciente com CPF já existente - deve retornar erro 409 ou 400"
- **Critério**: Deve retornar erro de duplicidade
- **Status**: ✅ Implementado

#### Cenário 8: Listar pacientes com paginação
- **Arquivo**: `test/patient.e2e-spec.ts`
- **Teste**: "Listar pacientes com paginação - deve retornar lista paginada corretamente"
- **Critério**: Retornar dados paginados com totalCount correto
- **Status**: ✅ Implementado

#### Cenário 12: Validação de campos obrigatórios
- **Arquivo**: `test/patient.e2e-spec.ts`
- **Testes**: 
  - "Validação de campos obrigatórios - deve retornar erro sem nome"
  - "Validação de campos obrigatórios - deve retornar erro sem CPF"
- **Critério**: Validar campos obrigatórios no formulário
- **Status**: ✅ Implementado

### Exames (Exam)

#### Cenário 3: Criar exame com paciente existente e idempotencyKey nova
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Criar exame com paciente existente e idempotencyKey nova - deve retornar HTTP 201"
- **Critério**: Exame deve ser criado com sucesso
- **Status**: ✅ Implementado

#### Cenário 4: Reenviar exame com mesma idempotencyKey
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Reenviar exame com mesma idempotencyKey - deve retornar HTTP 200 com mesmo exame"
- **Critério**: Deve retornar o exame existente sem criar duplicata
- **Status**: ✅ Implementado

#### Cenário 5: Múltiplas requisições simultâneas com mesma idempotencyKey
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Enviar múltiplas requisições simultâneas com mesma idempotencyKey - apenas um exame persistido"
- **Critério**: Apenas um exame deve ser criado mesmo com 5 requisições simultâneas
- **Status**: ✅ Implementado

#### Cenário 6: Criar exame com paciente inexistente
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Criar exame com paciente inexistente - deve retornar erro 400 ou 500"
- **Critério**: Deve retornar erro de paciente não encontrado
- **Status**: ✅ Implementado

#### Cenário 7: Listar exames com paginação (10 por página)
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Listar exames com paginação (10 por página) - deve retornar paginado corretamente"
- **Critério**: Retornar dados paginados corretamente
- **Status**: ✅ Implementado

#### Cenário 11: Enviar exame com modalidade inválida
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Enviar exame com modalidade inválida - deve retornar erro 400 ou 500"
- **Critério**: Deve retornar erro de enum inválido
- **Status**: ✅ Implementado

### Fluxo Completo

#### Fluxo Paciente → Exame
- **Arquivo**: `test/exam.e2e-spec.ts`
- **Teste**: "Deve criar paciente e depois criar exame para esse paciente"
- **Critério**: Testar integração completa do fluxo
- **Status**: ✅ Implementado

## 📊 Estrutura dos Testes

### Testes Unitários (Services)

```typescript
// PatientService
✅ Criar paciente com dados válidos
✅ Validar nome obrigatório
✅ Validar CPF obrigatório
✅ Validar CPF duplicado
✅ Listar pacientes paginados
✅ Calcular skip correto para paginação
✅ Buscar paciente por CPF

// ExamService
✅ Criar exame com dados válidos
✅ Retornar exame existente com idempotencyKey duplicada
✅ Validar patientId obrigatório
✅ Validar modality obrigatória
✅ Validar paciente existente
✅ Validar modalidade suportada
✅ Listar exames paginados
✅ Calcular skip correto para paginação
✅ Verificar modalidades válidas
```

### Testes E2E (Integração)

```typescript
// Patient E2E
✅ POST /pacientes - criar com dados válidos
✅ POST /pacientes - erro com CPF duplicado
✅ POST /pacientes - validar campos obrigatórios
✅ GET /pacientes - listar com paginação
✅ GET /pacientes - lista vazia

// Exam E2E
✅ POST /exames - criar com idempotencyKey nova
✅ POST /exames - idempotência (mesma key retorna mesmo exame)
✅ POST /exames - requisições simultâneas (race condition)
✅ POST /exames - erro com paciente inexistente
✅ POST /exames - erro com modalidade inválida
✅ POST /exames - erro sem X-Idempotency-Key header
✅ GET /exames - listar com paginação
✅ GET /exames - lista vazia
✅ Fluxo completo: Paciente → Exame
```

## 🎯 Modalidades DICOM Suportadas

Os testes cobrem todas as modalidades DICOM:
- `CR` - Computed Radiography
- `CT` - Computed Tomography
- `DX` - Digital Radiography
- `MG` - Mammography
- `MR` - Magnetic Resonance
- `NM` - Nuclear Medicine
- `OT` - Other
- `PT` - Positron Emission Tomography
- `RF` - Radio Fluoroscopy
- `US` - Ultrasound
- `XA` - X-Ray Angiography

## 🔍 Requisitos Atendidos

### Idempotência
✅ Exames com mesma `idempotencyKey` não são duplicados
✅ Requisições simultâneas são tratadas corretamente (race condition)
✅ Retorna HTTP 200 com exame existente em caso de duplicata

### Validações
✅ CPF único por paciente
✅ Campos obrigatórios validados
✅ Paciente deve existir para criar exame
✅ Modalidade deve ser uma das opções DICOM válidas
✅ X-Idempotency-Key obrigatório para criar exames

### Paginação
✅ Endpoints suportam `?page=X&pageSize=Y`
✅ Retornam `{ items: [], totalCount: number }`
✅ Cálculo correto de skip/take

### Transações ACID
✅ Prisma garante transações atômicas
✅ Race conditions tratadas corretamente

## 📈 Meta de Cobertura

**Requisito**: Mínimo de 80% de cobertura

Para verificar a cobertura atual:
```bash
npm run test:cov
```

O relatório será gerado em `coverage/lcov-report/index.html`

## 🐛 Debugging de Testes

### Ver output detalhado
```bash
npm test -- --verbose
```

### Rodar teste específico
```bash
npm test -- patient.service.spec.ts
npm run test:e2e -- exam.e2e-spec.ts
```

### Modo debug
```bash
npm run test:debug
```

## 📝 Observações

1. Os testes E2E limpam o banco de dados antes de cada teste (`beforeEach`)
2. Um paciente de teste é criado automaticamente nos testes de exames
3. Os testes verificam tanto os status codes HTTP quanto o conteúdo das respostas
4. Race conditions são testadas com 5 requisições simultâneas
5. Todos os cenários do README principal foram implementados

## ✨ Próximos Passos

- [ ] Cenário 9: Frontend mostra loading durante chamada
- [ ] Cenário 10: Frontend exibe erro de rede e botão "Tentar novamente"
- [ ] Cenário 13: Validar cobertura mínima de 80%
- [ ] Testes E2E do frontend com TestBed e HttpClientTestingModule
